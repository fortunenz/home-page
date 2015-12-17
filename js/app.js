(function() {
  Parse.initialize("p45yej86tibQrsfKYCcj6UmNw4o7b6kxtsobZnmA", "fXSkEhDGakCYnVv5OOdAfWDmjAuQvlnFI5KOwIUO");
  var Items = Parse.Object.extend("Items");
  var Customers = Parse.Object.extend("Customers");

  var app = angular.module("homePageApp", []);

  app.controller("mainController", function($scope) {
    var self = this;

    var currentUser = Parse.User.current();
    if (currentUser) {
      self.logged = true;
    } else {
      self.logged = false;
    }

    self.loggedName = "";
    self.loggedPass = "";
    self.user;

    self.firstName = "";
    self.lastName = "";
    self.userName = "";
    self.password = "";
    self.email = "";
    self.access = "";

    self.login = function() {
      Parse.User.logIn(self.loggedName, self.loggedPass, {
        success: function(user) {
          self.logged = true;
          self.user = user;
          $scope.$apply();
          // Do stuff after successful login.
        },
        error: function(user, error) {
          // The login failed. Check error to see why.
        }
      });
    };

    self.signUp = function() {
      var newUser = new Parse.User();
      newUser.set("username", self.userName);
      newUser.set("password", self.password);
      newUser.set("firstName", self.firstName);
      newUser.set("lastName", self.lastName);
      newUser.set("email", self.email);
      newUser.set("access", self.access);
      newUser.signUp(null, {
        success: function(newUser) {
          console.log(newUser);
          alert("New user created!");
          self.firstName = "";
          self.lastName = "";
          self.userName = "";
          self.password = "";
          self.email = "";
          self.access = "";
          $scope.$apply();
        },
        error: function(newUser, error) {
          // Show the error message somewhere and let the user try again.
          console.log("Error: " + error.code + " " + error.message);
        }
      });
    };
  });

  app.controller("itemController", function($scope) {
    var self = this;

    self.code = "";
    self.description = "";
    self.unit = "";
    self.quantitiy = "";
    self.packaging = "";
    self.defaultPrice = 0;
    self.orderAs = "";

    self.create = function() {
      var newItem = new Items();
      var itemQuery = new Parse.Query(Items);

      itemQuery.equalTo("code", self.code.toUpperCase());
      itemQuery.first({
        success: function(results) {
          if (results !== undefined) {
            alert("Sorry, this code is already taken. Please use a different code");
            return;
          }
          newItem.set("code", self.code.toUpperCase());
          newItem.set("description", self.description);
          newItem.set("unit", self.unit);
          newItem.set("quantity", parseInt(self.quantitiy));
          newItem.set("packaging", parseInt(self.packaging));
          newItem.set("price", parseInt(self.defaultPrice));
          newItem.set("orderAs", self.orderAs.toLowerCase());
          newItem.save(null, {
            success: function(item) {
              console.log('New object created with objectId: ' + item.id);
              alert("Your new item has been created!")
              self.code = "";
              self.description = "";
              self.unit = "";
              self.quantitiy = "";
              self.packaging = "";
              self.defaultPrice = 0;
              self.orderAs = "";
              $scope.$apply();
            },
            error: function(item, error) {
              // Execute any logic that should take place if the save fails.
              // error is a Parse.Error with an error code and message.
              console.log('Failed to create new object, with error code: ' + error.message);
            }
          });
        },
        error: function(error) {
          console.log("Error: " + error.code + " " + error.message);
        }
      });
    }
  });

  app.controller("customerController", function($scope) {
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
      var newCustomer = new Customers();
      var customerQuery = new Parse.Query(Customers);

      customerQuery.equalTo("short", self.short);
      customerQuery.first({
        success: function(results) {
          if (results !== undefined) {
            alert("Sorry, this short name is already taken. Please use a different name");
            return;
          }
          newCustomer.set("name", self.name);
          newCustomer.set("short", self.short);
          newCustomer.set("acc", self.acc);
          newCustomer.set("address", self.address);
          newCustomer.set("city", self.city);
          newCustomer.set("type", self.type);
          if (self.shippingComment.trim().length !== 0) {
            newCustomer.set("shippingComment", self.shippingComment);
          }
          newCustomer.save(null, {
            success: function(customer) {
              console.log('New object created with objectId: ' + customer.id);
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
            },
            error: function(customer, error) {
              // Execute any logic that should take place if the save fails.
              // error is a Parse.Error with an error code and message.
              console.log('Failed to create new object, with error code: ' + error.message);
            }
          });
        },
        error: function(error) {
          console.log("Error: " + error.code + " " + error.message);
        }
      });
    }
  });
})();
