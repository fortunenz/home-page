(function() {
  Parse.initialize("p45yej86tibQrsfKYCcj6UmNw4o7b6kxtsobZnmA", "fXSkEhDGakCYnVv5OOdAfWDmjAuQvlnFI5KOwIUO");

  var app = angular.module("homePageApp", []);

  app.controller("mainController", function($scope) {
    var self = this;
    self.logged = false;
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
          // Hooray! Let them use the app now.
          alert("It worked!");
          self.firstName = "";
          self.lastName = "";
          self.userName = "";
          self.password = "";
          self.email = "";
          self.access = "";
        },
        error: function(newUser, error) {
          // Show the error message somewhere and let the user try again.
          alert("Error: " + error.code + " " + error.message);
        }
      });
    };
  });
})();
