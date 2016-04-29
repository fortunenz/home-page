var app = angular.module("app", ["firebase"]);

// Connects to the firebase server
var ref = new Firebase('https://popping-torch-7294.firebaseio.com/');

app.controller("appCtrl", ["$scope", "$firebaseArray", "$firebaseObject", "$timeout",
      function($scope, $firebaseArray, $firebaseObject, $timeout, $window) {

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

      $scope.slipNumber = $firebaseObject(ref.child('slipNumber'));

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
  $scope.loggedEmail = "";
  $scope.loggedPass = "";

  // Application variables
  $scope.selectedCustomer = {};
  $scope.notes = "";
  $scope.searchBox = "";
  $scope.backOrder = false;
  $scope.orderNo = "";
  $scope.date = new Date();
  $scope.slipDate = "";
  $scope.checkoutItems = [];
  $scope.shippingLabel = [];

  // Invoice view variables
  $scope.invoice = false;
  $scope.invoiceNewCustomer = false;
  $scope.subTotal = 0;
  $scope.gst = 0;
  $scope.grandTotal = 0;

  // Function to log the user in so they can use the program
  $scope.login = function() {
    ref.authWithPassword({
      email    : $scope.loggedEmail,
      password : $scope.loggedPass
    }, function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
        alert("Sorry the username or password may be wrong, please try again");
      } else {
        console.log("Authenticated successfully with payload:", authData);
        $scope.access = true;
      }
    }, {
      remember: "default"
    });
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
      // If the user is using a new customer while in invoice view then set
      // irrelevent variables to null
      if ($scope.invoiceNewCustomer === true && $scope.invoice === true) {
        $scope.selectedCustomer.short = "";
        $scope.selectedCustomer.acc = "";
        $scope.selectedCustomer.city = "";
        $scope.selectedCustomer.shippingComment = "";
      }

      // If the customer is out of Auckland they most likely require shipping
      // so shipping addresses will be printed automatically if the user requires
      $scope.shippingLabel = [];

      if ($scope.selectedCustomer.city !== "Auckland" && $scope.invoiceNewCustomer === false) {
        var check = confirm("Would you like to print shipping addresses for your customer?");
        if (check) {
          var labelAmount = prompt("How many addresses do you need?", 0);
          if (isNaN(parseInt(labelAmount))) {
            alert("No shipping addresses will be printed because you did not enter a valid number");
          } else {
            for (var i = 0; i < labelAmount; i++) {
              $scope.shippingLabel.push(i);
            }
          }
        }
      }

      // Updates the slip number and saves to server
      $scope.slipNumber.$value++;
      $scope.slipNumber.$save();

      $timeout(function() {
        window.print();

        // Saves the shop data to be reloaded if most recent order needs to be
        // modified at a later stage
        if ($scope.invoiceNewCustomer === false) {
          var tempJson = {};

          tempJson.short =  $scope.selectedCustomer.short;
          tempJson.notes = $scope.notes;
          tempJson.orderNo = $scope.orderNo;

          for ( i = 0; i < $scope.items.length; i++) {
            if ($scope.items[i].ordered > 0) {
              tempJson[$scope.items[i].code] = $scope.items[i].ordered;
            }
          }

          ref.child("slipOrders").push(tempJson);
        }

        // If customer is being invoiced prices will be checked and if needed
        // will be saved for next time
        if ($scope.invoice === true && $scope.invoiceNewCustomer === false) {
          for (var i = 0, len = $scope.items.length; i < len; i++) {
            if ($scope.items[i].ordered > 0 && $scope.items[i].tempPrice !== $scope.selectedCustomer[$scope.items[i].code]) {
              var tempJson = {};
              tempJson[$scope.items[i].code] = $scope.items[i].tempPrice;
              ref.child("customers").child($scope.selectedCustomer.$id).update(
                tempJson
              );
              console.log("New price has been saved for item " + $scope.items[i].code + " with the price of $" + $scope.items[i].tempPrice);

            }
          }
        }
        $scope.resetApp();
      }, 0);

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
        break;
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
        angular.element(document.getElementsByClassName("item")).css("width", "150%");
      });
    }
  });

  // Watched if the user changes the packing slip date it will give appropriate value
  $scope.$watch("date", function() {
    var tokens = $scope.date.toString().split(" ");
    $scope.slipDate = tokens[2] + " " + tokens[1] + " " + tokens[3];
  });

  angular.element($window).bind('resize', function(){
    adjustCheckoutSize();
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
      angular.element(document.getElementById("notes")).css("left", "80%");
      angular.element(document.getElementById("notes")).css("top", "30px");
      angular.element(document.getElementById("notes")).css("max-height", "100px");

      angular.element(document.getElementById("mainBody")).css("width", "50%");
      angular.element(document.getElementsByClassName("itemList")).css("position", "relative");
      angular.element(document.getElementsByClassName("itemList")).css("left", "-15%");
      angular.element(document.getElementsByTagName("NAV")[0]).css("width", "100%");
      angular.element(document.getElementsByClassName("item")).css("width", "150%");
      // Else if view has been changed back to packing slip view do the following
    } else if ($scope.invoice === false && window.innerWidth >= 1000) {
      angular.element(document.getElementById("notes")).css("left", 0);
      angular.element(document.getElementById("notes")).css("top", "80px");
      angular.element(document.getElementById("notes")).css("max-height", "100%");

      angular.element(document.getElementById("mainBody")).css("left", "0");
      angular.element(document.getElementById("mainBody")).css("width", "100%");
      angular.element(document.getElementsByClassName("itemList")).css("left", "0");
      angular.element(document.getElementsByTagName("NAV")[0]).css("width", "60%");
      angular.element(document.getElementsByClassName("item")).css("width", "80%");
      angular.element(document.getElementById("checkoutItems")).css("height", window.innerHeight - 60);
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
