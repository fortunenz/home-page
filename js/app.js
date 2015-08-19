(function() {
  var app = angular.module("homePageApp", []);

  app.controller("mainController", function() {
    var self = this;
    self.access = false;
    self.userName = "";
    self.password = "";
    self.users = model.users;

    self.login = function() {

      for (i = 0, len = self.users.length; i < len; i++) {
        if (self.users[i].userName.toLowerCase() == self.userName.toLowerCase() && self.users[i].password == self.password) {
          self.access = true;
        }
      }
    }
  });

  app.controller("functionController", function() {
    var self = this;
    self.sites = model.sites;


  });
})();
