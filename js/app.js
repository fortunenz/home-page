(function() {
  var app = angular.module("homePageApp", []);

  app.controller("mainController", function() {
    var self = this;
    self.access = false;
    self.userName = "";
    self.password = "";

    self.login = function() {
      console.log(self.userName + self.password);
      self.access = true;
    }
  });

  app.controller("functionController", function() {
    var self = this;
    self.sites = model.sites;


  });
})();
