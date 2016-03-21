var myApp = angular.module('app', ["firebase"]);

myApp.controller('priceCtrl', ['$scope', '$firebaseArray', function($scope, $firebaseArray) {
  // Connects to the firebase server
  var ref = new Firebase('https://popping-torch-7294.firebaseio.com/');
  $scope.password = "";
  $scope.selectedAccNo = 0;
  $scope.selectedAcc = undefined;
  $scope.selectedItemNo = undefined;
  $scope.selectedItem = undefined;
  $scope.selectedPrice = undefined;
  $scope.predictedItems = [];
  $scope.predictedClick = false;

  // Firebase queries ----------------------------------------------------------
  ref.onAuth(function(authData) {
    $scope.access = false;
    if (authData) {
      if (authData.uid == "c03ed305-143f-4fca-9a42-4ebabf14e471") {
        window.location.replace("index.html");
      } else {
        $scope.access = true;
        $scope.userName = getName(authData);
        ref.child("users").child(authData.uid).set({
          provider: authData.provider,
          name: getName(authData)
        });
      }
    } else {
      console.log("Client unauthenticated.");
    }

    $scope.items = $firebaseArray(ref.child('items'));
    $scope.customers = $firebaseArray(ref.child('customers'));
  });

  // find a suitable name based on the meta info given by each provider
  function getName(authData) {
    switch(authData.provider) {
       case 'password':
         return authData.password.email.replace(/@.*/, '');
       case 'twitter':
         return authData.twitter.displayName;
       case 'facebook':
         return authData.facebook.displayName;
    }
  }

  // Function to log the user in so they can use the program
  $scope.login = function() {
    ref.authWithPassword({
      email    : $scope.userName,
      password : $scope.password
    }, function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
        alert("Sorry the username or password may be wrong, please try again");
      } else {
        console.log("Authenticated successfully with payload:", authData);
        $scope.access = true;
        $scope.printableShop = [];
        $scope.$apply();
      }
    }, {
      remember: "default"
    });
  };

  // Function to log the user out of applciation for security
  $scope.logout = function() {
    ref.unauth();
    $scope.access = false;
    $scope.userName = "";
    $scope.password = "";
  };

  // Checks the user input and displays customer info if any
  $scope.priceCheck = function() {
    // Finds the customer acc details
    for (var i = 0, len = $scope.customers.length; i < len; i++) {
      if ($scope.selectedAccNo == $scope.customers[i].acc) {
        $scope.selectedAcc = $scope.customers[i];
      }
    }

    // Item exists in customer file, change user price to that otherwise 0
    if ($scope.selectedAcc[$scope.selectedItemNo.toUpperCase()]) {
      $scope.selectedPrice = $scope.selectedAcc[$scope.selectedItemNo.toUpperCase()];
    } else {
      $scope.selectedPrice = 0;
    }

    // Finds the item details
    for (i = 0, len = $scope.items.length; i < len; i++) {
      if ($scope.items[i].code == $scope.selectedItemNo.toUpperCase()) {
        $scope.selectedItem = $scope.items[i];
      }
    }

    if (!$scope.selectedItem) {
      $scope.selectedItem = undefined;
    }
  };

  // Perform changes to the server if prices have changed or are not 0
  $scope.priceChange = function() {
    if ($scope.selectedPrice !== 0 && $scope.selectedPrice !== $scope.selectedAcc[$scope.selectedItem.code]) {
      var tempJson = {};
      tempJson[$scope.selectedItem.code] = $scope.selectedPrice;
      ref.child("customers").child($scope.selectedAcc.$id).update(
        tempJson
      );
      alert("Price of " + $scope.selectedItem.description + " has been changed to $" + $scope.selectedPrice + " for the customer " + $scope.selectedAcc.name);
    }
  };

  $scope.selectPrediction = function(item) {
    $scope.predictedClick = true;
    $scope.selectedItemNo = item;
    $scope.predictedItems = [];
  };

  $scope.$watch('selectedItemNo', function(newValue, oldValue) {
    if (newValue == oldValue) {
      return;
    }

    if ($scope.items.length === 0) {
      alert("Items have not been loaded yet");
      return;
    }

    if (!$scope.predictedClick) {
      $scope.predictedItems = [];

      for (var i = 0, len = $scope.items.length; i < len; i++) {
        if ($scope.items[i].code.indexOf(newValue.toUpperCase()) == 0) {
          $scope.predictedItems.push($scope.items[i].code);
        }
      }
    }
    
    $scope.predictedClick = false;
  });
}]);
