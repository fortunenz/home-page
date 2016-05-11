var app = angular.module("app", ["firebase"]);

app.controller("appCtrl", ["$scope", "$firebaseArray",
  function($scope, $firebaseArray) {
  $scope.slipNumber = 0;
  $scope.selectedSlip = undefined;
  $scope.selectedCustomer = undefined;

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

    $scope.orders = $firebaseArray(ref.child("slipOrders").limitToLast(500));
    $scope.orders.$loaded().then(function() {
      document.getElementById("slipNumber").disabled = false;
    });

    $scope.customers = $firebaseArray(ref.child("customers"));
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

  $scope.findSlip = function() {
    for (var i = 0, len = $scope.orders.length; i < len; i++) {
      if ($scope.orders[i].slipNo === $scope.slipNumber) {
        $scope.selectedSlip = $scope.orders[i];
      }
    }

    var tempCustomer = $scope.selectedSlip.short;
    for (var i = 0, len = $scope.customers.length; i < len; i++) {
      if ($scope.customers[i].short == tempCustomer) {
        $scope.selectedCustomer = $scope.customers[i];
      }
    }

    delete $scope.selectedSlip["$id"];
    delete $scope.selectedSlip["$priority"];
    delete $scope.selectedSlip["notes"];
    delete $scope.selectedSlip["orderNo"];
    delete $scope.selectedSlip["short"];
    delete $scope.selectedSlip["slipNo"];

    for (key in $scope.selectedSlip) {
      if ($scope.selectedCustomer.hasOwnProperty(key)) {
        $scope.selectedSlip[key] = $scope.selectedCustomer[key];
      } else {
        $scope.selectedSlip[key] = 0;
      }
    }
  };

  $scope.savePriceChanges = function() {
    for (key in $scope.selectedSlip) {
      if ($scope.selectedSlip[key] !== 0 && $scope.selectedSlip[key] !== $scope.selectedCustomer[key]) {
        var tempJson = {};
        tempJson[key] = $scope.selectedSlip[key];
        ref.child("customers").child($scope.selectedCustomer.$id).update(
          tempJson
        );
        console.log("Price of " + key + " has been changed to $" + tempJson[key] + " for the customer " + $scope.selectedCustomer.name);
      }
    }
  };
}]);
