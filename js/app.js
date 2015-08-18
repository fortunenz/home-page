(function() {
  var app = angular.module("homePageApp", []);

  app.controller("mainController", function() {
    var self = this;
    self.access = false;
  });

  app.controller("functionController", function() {
    var self = this;
    self.sites = model.sites;


  });
})();
