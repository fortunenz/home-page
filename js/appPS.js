(function() {
  var app = angular.module("app", ["firebase"]);

  app.controller("appCtrl", ["$scope", "$compile", "$filter", "$firebaseArray",
        function($scope, $compile, $filter, $firebaseArray) {
    // Connects to the firebase server
    var ref = new Firebase('https://popping-torch-7294.firebaseio.com/');

    // Firebase queries ----------------------------------------------------------
    ref.onAuth(function(authData) {
      $scope.access = false;
      if (authData) {
        $scope.access = true;
        $scope.name = getName(authData);
        $scope.customers = [
          {
            "name": "Fruit World",
            "show": false,
            "array": []
          },
          {
            "name": "Supa Fruit Mart",
            "show": false,
            "array": []
          },
          {
            "name": "Taiping Trading",
            "show": false,
            "array": []
          },
          {
            "name": "Delivery",
            "show": false,
            "array": []
          },
          {
            "name": "Out of Auckland",
            "show": false,
            "array": []
          },
          {
            "name": "Invoice",
            "show": false,
            "array": []
          }
        ];
        // Loads customers from server and appends them into the correct array
        var results = $firebaseArray(ref.child('customers'));
        results.$loaded().then(function() {
          for (var i = 0, len = results.length; i < len; i++) {
            for (var j = 0; j < $scope.customers.length; j++) {
              if (results[i].type == $scope.customers[j].name) {
                $scope.customers[j].array.push(results[i]);
              }
            }
          }
          for (i = 0; i < $scope.customers.length; i++) {
            sortByKey($scope.customers[i].array, "name");
          }
        })
        .catch(function(err) {
          console.error(err);
        });

        $scope.items = $firebaseArray(ref.child('items'));

        $scope.items.$loaded().then(function() {
          for (var i = 0, len = $scope.items.length; i < len; i++) {
            $scope.items[i].ordered = 0;
          }
          sortByKey($scope.items, "code");
          $scope.displayedItems = $scope.items;
          stopScroll();
        });

        ref.child("slipNumber").on("value", function(snapshot) {
          $scope.slipNumber = snapshot.val();
        });

        $scope.slipOrders = $firebaseArray(ref.child('slipOrders'));
      } else {
        console.log("Client unauthenticated.");
      }
    });

    // find a suitable name based on the meta info given by each provider
    function getName(authData) {
      switch(authData.provider) {
         case 'password':
           return authData.password.email.replace(/@.*/, '');
         case 'twitter':
           return authData.twitter.displayName;
         case 'facebook':
           return authData.facebook.displayName;
      }
    }

    // Login variables
    $scope.userName = "";
    $scope.password = "";

    // Application variables
    $scope.selectedCustomer = {};
    $scope.notes = "";
    $scope.searchBox = "";
    $scope.backOrder = false;
    $scope.orderNo = "";
    $scope.date = new Date();
    $scope.checkoutItems = [];

    // Invoice view variables
    $scope.invoice = false;
    $scope.invoiceNewCustomer = false;
    $scope.subTotal = 0;
    $scope.gst = 0;
    $scope.grandTotal = 0;

    // Function to log the user in so they can use the program
    $scope.login = function() {
      ref.authWithPassword({
        email    : $scope.userName,
        password : $scope.password
      }, function(error, authData) {
        if (error) {
          console.log("Login Failed!", error);
          alert("Sorry the username or password may be wrong, please try again");
        } else {
          console.log("Authenticated successfully with payload:", authData);
          $scope.access = true;
          $scope.$apply();
        }
      }, {
        remember: "default"
      });
    };

    // Function to log the user out of applciation for security
    $scope.logout = function() {
      ref.unauth();
      $scope.userName = "";
      $scope.access = false;
    };

    // Displays the list of shops that can be accessed
    $scope.showList = function(customer) {
      if (customer.show === false) {
        customer.show = true;
        for (var i = 0, len = $scope.customers.length; i < len; i++) {
          if (customer !== $scope.customers[i]) {
            $scope.customers[i].show = false;
          }
        }
      } else {
        customer.show = false;
      }
    };

    // Loads the selected customer as the selected customer
    $scope.listClick = function(data) {
      for (var i = 0, len = $scope.customers.length; i < len; i++) {
        $scope.customers[i].show = false;
      }
      $scope.selectedCustomer = data;
      $('html, body').animate({ scrollTop: 0 }, 'fast');
      if ($scope.invoice === true) {
        for (i = 0, len = $scope.checkoutItems.length; i < len; i++) {
          $scope.definePrices($scope.checkoutItems[i]);
          $scope.priceChange($scope.checkoutItems[i]);
        }
        $scope.defineTotalPrice();
      }
    };

    // Appends data to the checkout list
    $scope.checkoutList = function() {
      var temp;
      for (var i = 0, len = $scope.items.length; i < len; i++) {
        temp = $.inArray($scope.items[i], $scope.checkoutItems);
        if ($scope.items[i].ordered > 0) {
          if (temp === -1) {
            $scope.checkoutItems.push($scope.items[i]);
            // Recalculate the prices and totals if in invoice view
            if ($scope.invoice === true) {
              $scope.definePrices($scope.items[i]);
            }
          }
        } else {
          if (temp > -1) {
            $scope.checkoutItems.splice(temp, 1);
          }
        }
      }
      if ($scope.invoice === true) {
        $scope.defineTotalPrice();
        stopScrollInvoice();
      }
    };

    // Grabs all data required and proceeds with a print preview
    $scope.printPreview = function() {
      // Prevents the user from creating packing slips if there are no
      // customer or items selected
      var total = 0;
      for (var i = 0, len = $scope.items.length; i < len; i++) {
        total += $scope.items[i].ordered;
      }
      if ($scope.selectedCustomer.name === undefined) {
        alert("Please select a customer before you print");
      } else if (total === 0) {
        alert("Your customers order cannot have no items");
      } else {
        buildPackingSlips($scope, $filter);
      }
    };

    // Loads last saved order for current customer
    $scope.loadData = function() {
      for (var i = $scope.slipOrders.length, len = 0; i > len; i--) {
        if ($scope.slipOrders[i-1].short == $scope.selectedCustomer.short) {
          $scope.notes = $scope.slipOrders[i-1].notes;
          $scope.orderNo = $scope.slipOrders[i-1].orderNo;
          for (var j = 0; j < $scope.items.length; j++) {
            if ($scope.slipOrders[i-1].hasOwnProperty($scope.items[j].code)) {
              $scope.items[j].ordered = $scope.slipOrders[i-1][$scope.items[j].code];
            } else {
              $scope.items[j].ordered = 0;
            }
          }
          $scope.checkoutList();
          $('html, body').animate({ scrollTop: 0 }, 'fast');
        }
      }
    };

    // Resets the customer variables
    $scope.resetCustomer = function () {
      $scope.selectedCustomer = {};
    };

    // Reset the app
    $scope.resetApp = function() {
      $scope.resetCustomer();
      $scope.backOrder = false;
      $scope.orderNo = "";
      $scope.searchBox = "";
      $scope.notes = "";
      $scope.invoiceNewCustomer = false;
      $scope.date = new Date();
      for (var i = 0, len = $scope.items.length; i < len; i++) {
        $scope.items[i].ordered = 0;
        $scope.items[i].tempPrice = 0;
        $scope.items[i].wrongPrice = false;
      }
      $scope.checkoutList();
      $scope.displayedItems = $scope.items;
      $('html, body').animate({ scrollTop: 0 }, 'fast');
    };

    // Watches if the displayedItems variable changes based on searches and Resets
    // and will respond accordingly to the view
    $scope.$watch("displayedItems", function() {
      if ($scope.invoice === true) {
        $scope.$evalAsync(function() {
          $(".item").css("width", "150%");
        });
      }
    });

    // Watches if the search box and changes the displayed items accordingly
    // if the user searches for items
    $scope.$watch("searchBox", function() {
      if ($scope.searchBox.trim().length === 0) {
        $scope.displayedItems = $scope.items;
      } else {
        $scope.displayedItems = [];
        for (var i = 0, len = $scope.items.length; i < len; i++) {
          if ($scope.items[i].description.toLowerCase().includes($scope.searchBox.toLowerCase()) || $scope.items[i].code.toLowerCase().includes($scope.searchBox.toLowerCase())) {
            $scope.displayedItems.push($scope.items[i]);
          }
        }
      }
    });

    // Functions specific to invoice view
    // ------------------------------------------------------------------------

    // User changes the view to invoice or packing slip and aspects of the view
    // gets arranged
    $scope.changeView = function() {
      $scope.invoice = !$scope.invoice;

      $scope.resetCustomer();
      $scope.backOrder = false;
      // Close all customer tabs
      for (var i = 0, len = $scope.customers.length; i < len; i++) {
        $scope.customers[i].show = false;
      }

      // If the view has been changed to invoice view do the following
      if ($scope.invoice === true && window.innerWidth >= 1000) {
        $("#notes").css("left", "80%");
        $("#notes").css("top", "30px");
        $("#notes").css("max-height", "100px");

        $("#mainBody").css("width", "50%");
        $(".itemList").css("position", "relative");
        $(".itemList").css("left", "-15%");
        $("nav").css("width", "100%");
        $(".item").css("width", "150%");
        // Else if view has been changed back to packing slip view do the following
      } else if ($scope.invoice === false && window.innerWidth >= 1000) {
        $("#notes").css("left", 0);
        $("#notes").css("top", "80px");
        $("#notes").css("max-height", "100%");

        $("#mainBody").css("left", "0");
        $("#mainBody").css("width", "100%");
        $(".itemList").css("left", "0");
        $("nav").css("width", "60%");
        $(".item").css("width", "80%");
        $("#checkoutItems").css("height", window.innerHeight - $("#checkoutHeader").height());
      }

      stopScrollInvoice();
    };

    // Modifies the prices of items in the checkout list
    $scope.definePrices = function(item) {
      // Checks if customer has been selected
      // if so then change the prices based on customer
      // otherwise use default prices
      if ($scope.selectedCustomer.name !== undefined) {
        if ($scope.selectedCustomer[item.code] !== undefined) {
          item.tempPrice = $scope.selectedCustomer[item.code];
        } else {
          if (item.tempPrice === undefined) {
            if (item.price === undefined) {
              item.tempPrice = 0;
            } else {
              item.tempPrice = item.price;
            }
          }
        }
      } else {
        if (item.price === undefined) {
          item.tempPrice = 0;
        } else {
          item.tempPrice = item.price;
        }
      }

      // If the customer has not previously purchased an item using the system
      // the price will not yet be set, and therefore the user needs to be
      // alerted that they need to check the price
      if ($scope.selectedCustomer.short !== undefined && item.tempPrice !== $scope.selectedCustomer[item.code]) {
        item.wrongPrice = true;
      }
    };

    // Adjusts the total price charged to customers responsively
    $scope.defineTotalPrice = function() {
      $scope.subTotal = 0;
      for (var i = 0, len = $scope.items.length; i < len; i++) {
        if ($scope.items[i].ordered > 0) {
          $scope.subTotal += $scope.items[i].ordered * $scope.items[i].tempPrice;
        }
      }
      $scope.gst = $scope.subTotal * 0.15;
      $scope.grandTotal = $scope.subTotal * 1.15;
    };

    $scope.priceChange = function(tempItem) {
      if ($scope.selectedCustomer !== undefined) {
        if ($scope.selectedCustomer[tempItem.code] !== tempItem.tempPrice) {
          tempItem.wrongPrice = true;
        } else {
          tempItem.wrongPrice = false;
        }
      }
    };
  }]);
})();
