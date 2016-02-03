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

    var self = this;

    self.loggedEmail = "";
    self.loggedPass = "";
    self.user;

    self.email = "";
    self.password = "";

    self.login = function() {
      ref.authWithPassword({
        email    : self.loggedEmail,
        password : self.loggedPass
      }, function(error, authData) {
        if (error) {
          console.log("Login Failed!", error);
        } else {
          console.log("Authenticated successfully with payload:", authData);
          $scope.access = true;
        }
      });
    };

    self.signUp = function() {
      ref.createUser({
        email    : self.email,
        password : self.password
      }, function(error, userData) {
        if (error) {
          console.log("Error creating user:", error);
        } else {
          console.log("Successfully created user account with uid:", userData.uid);
          alert("New user created!");
          self.email = "";
          self.password = "";
          $scope.$apply();
        }
      });
    };
  });

  app.controller("itemController", function($scope, $firebaseArray) {
    var itemsRef = new Firebase('https://popping-torch-7294.firebaseio.com/items');
    $scope.items = $firebaseArray(itemsRef);

    var self = this;

    self.code = "";
    self.description = "";
    self.unit = "";
    self.quantitiy = "";
    self.packaging = "";
    self.defaultPrice = 0;
    self.orderAs = "";

    self.create = function() {
      var codeError = false;
      for (var i = 0, len = $scope.items.length; i < len; i++) {
        if ($scope.items[i].code == self.code.toUpperCase()) {
          codeError = true;
        }
      }

      if (codeError === false) {
        ref.child("items").push({
          "code": self.code.toUpperCase(),
          "description": self.description,
          "unit": self.unit,
          "quantity": parseInt(self.quantitiy),
          "packaging": self.packaging,
          "price": parseInt(self.defaultPrice),
          "orderAs": self.orderAs.toLowerCase()
        }, function(error) {
          if (error) {
            console.log("Data could not be saved." + error);
          } else {
            alert("Your new item has been created!")
            self.code = "";
            self.description = "";
            self.unit = "";
            self.quantitiy = "";
            self.packaging = "";
            self.defaultPrice = 0;
            self.orderAs = "";
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

    var self = this;

    self.name = "";
    self.short = "";
    self.acc = "";
    self.address = "";
    self.city = "";
    self.type = "";
    self.includeGST = false;
    self.shippingComment = "";

    self.create = function() {
      var codeError = false;
      for (var i = 0, len = $scope.customers.length; i < len; i++) {
        if ($scope.customers[i].short == self.short) {
          codeError = true;
        }
      }

      if (self.shippingComment.trim().length === 0) {
        self.shippingComment = null;
      }

      if (codeError === false) {
        ref.child("customers").push({
          "name": self.name,
          "short": self.short,
          "acc": self.acc,
          "address": self.address,
          "city": self.city,
          "type": self.type,
          "shippingComment": self.shippingComment
        }, function(error) {
          if (error) {
            console.log("Data could not be saved." + error);
          } else {
            alert("Your new customer has been created!")
            self.name = "";
            self.short = "";
            self.acc = "";
            self.address = "";
            self.city = "";
            self.type = "";
            self.includeGST = false;
            self.shippingComment = "";
            $scope.$apply();
          }
        });
      } else {
        alert("Sorry, this short name is already taken. Please use a different name");
      }
    }
  });
})();
