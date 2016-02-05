(function() {
  var app = angular.module("checklist", ["firebase"]);

  app.controller("appCtrl", function($scope, $compile, $firebaseArray) {
    // Connects to the firebase server
    var ref = new Firebase('https://popping-torch-7294.firebaseio.com/');

    // Firebase queries ----------------------------------------------------------
    ref.onAuth(function(authData) {
      $scope.access = false;
      if (authData) {
        $scope.access = true;
        $scope.userName = getName(authData);
        ref.child("users").child(authData.uid).set({
          provider: authData.provider,
          name: getName(authData)
        });

        // Pulls data from server for all fruit world customers
        var tempShops = $firebaseArray(ref.child('customers'));
        $scope.shops = [];
        tempShops.$loaded().then(function() {
          for (var i = 0, len = tempShops.length; i < len; i++) {
            if (tempShops[i].type == "Fruit World" || tempShops[i].type == "Supa Fruit Mart") {
              tempShops[i].clicked = false;
              $scope.shops.push(tempShops[i]);
            }
          }
          sortByKey($scope.shops, "name");
        });

        // updates the order number
        ref.child("slipNumber").on("value", function(snapshot) {
          self.slipNumber = snapshot.val();
        });
        // Pulls all the past orders from server
        $scope.orders = $firebaseArray(ref.child('fruitWorldOrders'));
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

    var self = this;

    // Login variables
    self.password = "";

    // Application variables
    self.viewOrder = {
      id: "Print",
      bool: true
    };
    self.selectedBranch = {
      name: "",
      short: "",
      acc: "",
      address: "",
      city: "",
      selected: false
    };
    self.searchBox = "";
    self.viewList = false;
    self.printableShop = [];
    self.spreadsheetArray = [];
    self.checkoutItems = [];
    self.items = model.items;
    self.displayedItems = self.items;
    stopScroll();
    self.slipNumber = 0;

    // Function to log the user in so they can use the program
    self.login = function() {
      $("#loading").show();
      ref.authWithPassword({
        email    : $scope.userName,
        password : self.password
      }, function(error, authData) {
        if (error) {
          console.log("Login Failed!", error);
          $("#loading").hide();
          alert("Sorry the username or password may be wrong, please try again");
        } else {
          console.log("Authenticated successfully with payload:", authData);
          $scope.access = true;
          $("#loading").hide();

          self.printableShop = [];
          $("#print").empty();
          $("#packingSlip").empty();
          $("#printButton").hide();
          $scope.$apply();
        }
      }, {
        remember: "default"
      });
    };

    // Function to log the user out of applciation for security
    self.logout = function() {
      ref.unauth();
      $scope.access = false;
      $scope.userName = "";
      self.password = "";
    };

    // Loops through items in list and if it matches what's in the search bar
    // it will display the item
    self.search = function() {
      if (self.searchBox == " ") {
        self.displayedItems = self.items;
      } else {
        self.displayedItems = [];
        for (var i = 0, len = self.items.length; i < len; i++) {
          if (self.items[i].description.toLowerCase().includes(self.searchBox.toLowerCase()) || self.items[i].code.toLowerCase().includes(self.searchBox.toLowerCase())) {
            self.displayedItems.push(self.items[i]);
          }
        }
      }
    };

    // Changed the viewOrder value when clicked
    self.changeView = function() {
      if (self.viewOrder.bool === true) {
        self.viewOrder.id = "Order";
        self.viewOrder.bool = false;
      } else {
        self.viewOrder.id = "Print";
        self.viewOrder.bool = true;
      }
    };

    // Appends data to the checkout list
    self.checkoutList = function() {
      var temp;
      for (var i = 0, len = self.items.length; i < len; i++) {
        temp = $.inArray(self.items[i], self.checkoutItems);
        if (self.items[i].ordered > 0) {
          if (temp === -1) {
            self.checkoutItems.push(self.items[i]);
          }
        } else {
          if (temp > -1) {
            self.checkoutItems.splice(temp, 1);
          }
        }
      }
    };

    // Displays the list of shops that can be accessed
    self.showList = function() {
      if (self.viewList === false) {
        self.viewList = true;
        $("#loadedOrders").css("display", "none");
        $("#checkout").css("display", "none");
      } else {
        self.viewList = false;
        $("#loadedOrders").css("display", "inline");
        var mq = window.matchMedia( "(min-width: 1000px)" );
        if (mq.matches) {
          $("#checkout").css("display", "inline");
        }
      }
    };

    // Loads all the saved data from previous orders
    // of a branch
    self.listClick = function(data) {
      self.showList();
      self.selectedBranch.name = data.name;
      self.selectedBranch.short = data.short;
      self.selectedBranch.acc = data.acc;
      self.selectedBranch.address = data.address;
      self.selectedBranch.city = data.city;

      $("#loadedOrders").empty();

      var tempNum = 0;
      var temp;
      temp = '<h3 ng-show="app.selectedBranch.selected">Saved orders for ' + data.name + '</h3>';
      $("#loadedOrders").append(temp);

      for (var i = $scope.orders.length; i > 0; i--) {
        if ($scope.orders[i-1].short == self.selectedBranch.short) {
          temp = '<div class="oldOrders"><p>File last modified: ' +
          $scope.orders[i-1].time +
          ' <button class="clean-gray-btn" ng-click="app.loadOrder(' +
          (i-1) +
          ')">Load</button></p></div>';
          angular.element(document.getElementById("loadedOrders")).append($compile(temp)($scope));
          tempNum++;
          if (tempNum > 4) {
            break;
          }
        }
      }

      self.selectedBranch.selected = true;
      $('html, body').animate({ scrollTop: 0 }, 'fast');
    };

    // Submit the order data to the server for later
    // printing
    self.saveOrder = function() {
      if (self.selectedBranch.name === "") {
        alert("Please select a branch before you submit");
      } else {
        var tempJson = {};

        tempJson.name = self.selectedBranch.name;
        tempJson.short =  self.selectedBranch.short;
        tempJson.acc =  self.selectedBranch.acc;
        tempJson.address =  self.selectedBranch.address;
        tempJson.city =  self.selectedBranch.city;
        tempJson.time = new Date().toDateString();

        for (var i = 0; i < self.items.length; i++) {
          tempJson[self.items[i].code] = self.items[i].ordered;
        }

        var shopRef = new Firebase('https://popping-torch-7294.firebaseio.com/fruitWorldOrders');
        shopRef.push(tempJson);
        alert("Thanks, Your order has been saved for " + self.selectedBranch.name + "!");

        // Resets the view
        self.selectedBranch.name = "";
        self.selectedBranch.short = "";
        self.selectedBranch.acc = "";
        self.selectedBranch.address = "";
        self.selectedBranch.city = "";
        self.selectedBranch.selected = false;
        for (i = 0; i < self.items.length; i++) {
          self.items[i].ordered = 0;
        }
        self.checkoutItems = [];
        $('html, body').animate({ scrollTop: 0 }, 'fast');
      }
    };

    // Loads a previously saved order for user to modify and update
    self.loadOrder = function(location) {
      var object = $scope.orders[location];
      for (var i = 0, len = self.items.length; i < len; i++) {
        if (self.items[i].code in object) {
          self.items[i].ordered = object[self.items[i].code];
        }
      }
      self.checkoutList();
      $('html, body').animate({ scrollTop: 0 }, 'fast');
      alert("Previous order for " + self.selectedBranch.name + " from " + object.time + " has been loaded");
    };

    // Add the shop to the print list if checkbox is checked
    self.selectPrint = function(shop) {
      if (shop.clicked === false) {
        shop.clicked = true;
        self.printableShop.push(shop);
      } else {
        for (var i = 0; i < self.printableShop.length; i++) {
          if (self.printableShop[i].name == shop.name) {
            shop.clicked = false;
            self.printableShop.splice(i, 1);
          }
        }
      }
    };

    // Grabs all data required and proceeds with a print preview
    self.printPreview = function() {
      if (self.printableShop.length < 1) {
        alert("Please select the shops you want to have printed");
      } else {
        var spreadsheetArray = [];
        for (var j = 0; j < self.printableShop.length; j++) {
          for (var i = $scope.orders.length; i > 0; i--) {
            if (self.printableShop[j].short == $scope.orders[i-1].short) {
              spreadsheetArray.push($scope.orders[i-1]);
              break;
            }
          }
        }
        if (spreadsheetArray.length === 0 || spreadsheetArray.length !== self.printableShop.length) {
          alert("Sorry one of the shops you are trying to load has no data, please submit an order before loading");
        } else {
          buildTable(spreadsheetArray);
          buildPackingSlips(spreadsheetArray, self.slipNumber);
          $("#printButton").show();
        }
      }
    };
  });
})();
