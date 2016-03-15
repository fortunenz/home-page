(function() {
  var app = angular.module("homePageApp", ["firebase"]);
  // Connects to the firebase server
  var ref = new Firebase('https://popping-torch-7294.firebaseio.com/');

  app.controller("mainController", function($scope) {
    // Firebase queries ----------------------------------------------------------
    ref.onAuth(function(authData) {
      $scope.access = false;
      if (authData) {
        console.log("User " + authData.uid + " is logged in with " + authData.provider);
        $scope.access = true;
      } else {
        console.log("Client unauthenticated.")
      }
    });

    $scope.loggedEmail = "";
    $scope.loggedPass = "";
    $scope.user;

    $scope.email = "";
    $scope.password = "";

    $scope.login = function() {
      ref.authWithPassword({
        email    : $scope.loggedEmail,
        password : $scope.loggedPass
      }, function(error, authData) {
        if (error) {
          console.log("Login Failed!", error);
        } else {
          console.log("Authenticated successfully with payload:", authData);
          $scope.access = true;
          $scope.$apply();
        }
      });
    };

    $scope.signUp = function() {
      ref.createUser({
        email    : $scope.email,
        password : $scope.password
      }, function(error, userData) {
        if (error) {
          console.log("Error creating user:", error);
        } else {
          console.log("Successfully created user account with uid:", userData.uid);
          alert("New user created!");
          $scope.email = "";
          $scope.password = "";
          $scope.$apply();
        }
      });
    };
  });

  app.controller("itemController", function($scope, $firebaseArray) {
    var itemsRef = new Firebase('https://popping-torch-7294.firebaseio.com/items');
    $scope.items = $firebaseArray(itemsRef);

    $scope.code = "";
    $scope.description = "";
    $scope.unit = "";
    $scope.quantitiy = "";
    $scope.packaging = "";
    $scope.defaultPrice = 0;
    $scope.orderAs = "";

    $scope.create = function() {
      var codeError = false;
      for (var i = 0, len = $scope.items.length; i < len; i++) {
        if ($scope.items[i].code == $scope.code.toUpperCase()) {
          codeError = true;
        }
      }

      if (codeError === false) {
        ref.child("items").push({
          "code": $scope.code.toUpperCase(),
          "description": $scope.description,
          "unit": $scope.unit,
          "quantity": parseInt($scope.quantitiy),
          "packaging": $scope.packaging,
          "price": parseInt($scope.defaultPrice),
          "orderAs": $scope.orderAs.toLowerCase()
        }, function(error) {
          if (error) {
            console.log("Data could not be saved." + error);
          } else {
            alert("Your new item has been created!")
            $scope.code = "";
            $scope.description = "";
            $scope.unit = "";
            $scope.quantitiy = "";
            $scope.packaging = "";
            $scope.defaultPrice = 0;
            $scope.orderAs = "";
            $scope.$apply();
          }
        });
      } else {
        alert("You alraedy have that code in your database please try another");
      }
    }
  });

  app.controller("customerController", function($scope, $firebaseArray) {
    var customersRef = new Firebase('https://popping-torch-7294.firebaseio.com/customers');
    $scope.customers = $firebaseArray(customersRef);

    $scope.name = "";
    $scope.short = "";
    $scope.acc = "";
    $scope.address = "";
    $scope.city = "";
    $scope.type = "";
    $scope.includeGST = false;
    $scope.shippingComment = "";

    $scope.create = function() {
      var codeError = false;
      for (var i = 0, len = $scope.customers.length; i < len; i++) {
        if ($scope.customers[i].short == $scope.short) {
          codeError = true;
        }
      }

      if ($scope.shippingComment.trim().length === 0) {
        $scope.shippingComment = null;
      }

      if (codeError === false) {
        ref.child("customers").push({
          "name": $scope.name,
          "short": $scope.short,
          "acc": $scope.acc,
          "address": $scope.address,
          "city": $scope.city,
          "type": $scope.type,
          "includeGST": $scope.includeGST,
          "shippingComment": $scope.shippingComment
        }, function(error) {
          if (error) {
            console.log("Data could not be saved." + error);
          } else {
            alert("Your new customer has been created!")
            $scope.name = "";
            $scope.short = "";
            $scope.acc = "";
            $scope.address = "";
            $scope.city = "";
            $scope.type = "";
            $scope.includeGST = false;
            document.getElementById("invoiceCheckerFalse").checked = true;
            $scope.shippingComment = "";
            $scope.$apply();
          }
        });
      } else {
        alert("Sorry, this short name is already taken. Please use a different name");
      }
    }
  });
})();
