var app = angular.module("app", ["firebase"]);

app.controller("appCtrl", ["$scope", "$firebaseArray", "$firebaseObject",
  function($scope, $firebaseArray, $firebaseObject) {
  $scope.loggedEmail = "";
  $scope.loggedPass = "";
  $scope.slipNumber = 0;
  $scope.selectedSlip = {};

  // Firebase queries ----------------------------------------------------------
  ref.onAuth(function(authData) {
    $scope.access = false;
    document.getElementById("slipNumber").disabled = true;
    if (authData) {
      if (authData.uid == "c03ed305-143f-4fca-9a42-4ebabf14e471") {
        window.location.replace("index.html");
      } else {
        $scope.access = true;
        $scope.loggedEmail = getName(authData);
        ref.child("users").child(authData.uid).set({
          provider: authData.provider,
          name: getName(authData)
        });
      }
    } else {
      console.log("Client unauthenticated.");
    }

    $scope.orders = $firebaseArray(ref.child("slipOrders"));
    $scope.orders.$loaded().then(function() {
      document.getElementById("slipNumber").disabled = false;
    });
  });

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
        $scope.$apply();
      }
    }, {
      remember: "default"
    });
  };

  $scope.findSlip() {
    for(var i = 0, len = $scope.orders.length; i < len; i++) {
      
    }
  };
}]);
