var app = angular.module("homePageApp", []);
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
    }, {
      remember: "default"
    });
  };
});
