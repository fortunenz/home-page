var app = angular.module("checklist", ["firebase"]);

app.controller("appCtrl", ["$scope", "$compile", "$firebaseArray", "$firebaseObject",
  function($scope, $compile, $firebaseArray, $firebaseObject) {

  // Firebase queries ----------------------------------------------------------
  ref.onAuth(function(authData) {
    $scope.access = false;
    if (authData) {
      $scope.access = true;
      $scope.loggedEmail = getName(authData);
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
      $scope.slipNumber = $firebaseObject(ref.child('slipNumber'));

      // Pulls all the past orders from server
      $scope.orders = $firebaseArray(ref.child('fruitWorldOrders'));
    } else {
      console.log("Client unauthenticated.");
    }
  });

  // Login variables
  $scope.loggedPass = "";

  // Application variables
  $scope.viewOrder = {
    id: "Print",
    bool: true
  };
  $scope.selectedBranch = {
    name: "",
    short: "",
    acc: "",
    address: "",
    city: "",
    selected: false
  };
  $scope.spreadsheetArray = [];
  $scope.searchBox = "";
  $scope.viewList = false;
  $scope.printableShop = [];
  $scope.checkoutItems = [];
  $scope.items = model.items;
  $scope.displayedItems = $scope.items;
  stopScroll();

  var systemDate = new Date();
  var tokens = systemDate.toString().split(" ");
  $scope.slipDate = tokens[2] + " " + tokens[1] + " " + tokens[3];

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
        $scope.printableShop = [];
      }
    }, {
      remember: "default"
    });
  };

  // Changed the viewOrder value when clicked
  $scope.changeView = function() {
    if ($scope.viewOrder.bool === true) {
      $scope.viewOrder.id = "Order";
      $scope.viewOrder.bool = false;
    } else {
      $scope.viewOrder.id = "Print";
      $scope.viewOrder.bool = true;
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
        }
      } else {
        if (temp > -1) {
          $scope.checkoutItems.splice(temp, 1);
        }
      }
    }
  };

  // Displays the list of shops that can be accessed
  $scope.showList = function() {
    if ($scope.viewList === false) {
      $scope.viewList = true;
      $("#loadedOrders").css("display", "none");
      $("#checkout").css("display", "none");
    } else {
      $scope.viewList = false;
      $("#loadedOrders").css("display", "inline");
      var mq = window.matchMedia( "(min-width: 1000px)" );
      if (mq.matches) {
        $("#checkout").css("display", "inline");
      }
    }
  };

  // Loads all the saved data from previous orders
  // of a branch
  $scope.listClick = function(data) {
    $scope.showList();
    $scope.selectedBranch.name = data.name;
    $scope.selectedBranch.short = data.short;
    $scope.selectedBranch.acc = data.acc;
    $scope.selectedBranch.address = data.address;
    $scope.selectedBranch.city = data.city;
    $scope.selectedBranch.selected = true;

    $('html, body').animate({ scrollTop: 0 }, 'fast');
  };

  // Submit the order data to the server for later
  // printing
  $scope.saveOrder = function() {
    if ($scope.selectedBranch.name === "") {
      alert("Please select a branch before you submit");
    } else {
      var tempJson = {};

      tempJson.name = $scope.selectedBranch.name;
      tempJson.short =  $scope.selectedBranch.short;
      tempJson.acc =  $scope.selectedBranch.acc;
      tempJson.address =  $scope.selectedBranch.address;
      tempJson.city =  $scope.selectedBranch.city;
      tempJson.time = new Date().toDateString();

      for (var i = 0; i < $scope.items.length; i++) {
        if ($scope.items[i].ordered > 0) {
          tempJson[$scope.items[i].code] = $scope.items[i].ordered;
        }
      }

      var shopRef = new Firebase('https://popping-torch-7294.firebaseio.com/fruitWorldOrders');
      shopRef.push(tempJson);
      alert("Thanks, Your order has been saved for " + $scope.selectedBranch.name + "!");

      // Resets the view
      $scope.selectedBranch.name = "";
      $scope.selectedBranch.short = "";
      $scope.selectedBranch.acc = "";
      $scope.selectedBranch.address = "";
      $scope.selectedBranch.city = "";
      $scope.selectedBranch.selected = false;
      for (i = 0; i < $scope.items.length; i++) {
        $scope.items[i].ordered = 0;
      }
      $scope.checkoutItems = [];
      $('html, body').animate({ scrollTop: 0 }, 'fast');
    }
  };

  // Loads a previously saved order for user to modify and update
  $scope.loadOrder = function(location) {
    var object = $scope.orders[location];
    for (var i = 0, len = $scope.items.length; i < len; i++) {
      if ($scope.items[i].code in object) {
        $scope.items[i].ordered = object[$scope.items[i].code];
      }
    }
    $scope.checkoutList();
    $('html, body').animate({ scrollTop: 0 }, 'fast');
    alert("Previous order for " + $scope.selectedBranch.name + " from " + object.time + " has been loaded");
  };

  // Add the shop to the print list if checkbox is checked
  $scope.selectPrint = function(shop) {
    if (shop.clicked === false) {
      shop.clicked = true;
      $scope.printableShop.push(shop);
    } else {
      for (var i = 0; i < $scope.printableShop.length; i++) {
        if ($scope.printableShop[i].name == shop.name) {
          shop.clicked = false;
          $scope.printableShop.splice(i, 1);
        }
      }
    }
  };

  // Grabs all data required and proceeds with a print preview
  $scope.printPreview = function() {
    if ($scope.printableShop.length < 1) {
      alert("Please select the shops you want to have printed");
    } else {
      $scope.spreadsheetArray = [];
      for (var j = 0; j < $scope.printableShop.length; j++) {
        for (var i = $scope.orders.length; i > 0; i--) {
          if ($scope.printableShop[j].short == $scope.orders[i-1].short) {
            $scope.spreadsheetArray.push($scope.orders[i-1]);
            break;
          }
        }
      }

      for (var j = 0, len = $scope.spreadsheetArray.length; j < len; j++) {
        $scope.slipNumber.$value++;
        $scope.slipNumber.$save();
        $scope.spreadsheetArray[j].slipNumber = $scope.slipNumber.$value;
      }

      var tempTotal;
      for (var i = 0; i < $scope.items.length; i++) {
        tempTotal = 0;
        for (var j = 0, len = $scope.spreadsheetArray.length; j < len; j++) {
          if ($scope.spreadsheetArray[j][$scope.items[i].code] > 0) {
            tempTotal += $scope.spreadsheetArray[j][$scope.items[i].code];
          }
        }
        $scope.items[i].spreadsheetTotal = tempTotal;
      }

      if ($scope.spreadsheetArray.length === 0 || $scope.spreadsheetArray.length !== $scope.printableShop.length) {
        alert("Sorry one of the shops you are trying to load has no data, please submit an order before loading");
      }
    }
  };
}]);
