var myApp = angular.module('app', ["firebase"]);

myApp.controller('priceCtrl', ['$scope', '$firebaseArray', function($scope, $firebaseArray) {
  // Connects to the firebase server
  var ref = new Firebase('https://popping-torch-7294.firebaseio.com/');
  $scope.password = "";
  $scope.selectedAccNo = 0;
  $scope.selectedAcc = undefined;
  $scope.selectedItemNo = undefined;
  $scope.selectedItem = undefined;
  $scope.selectedPrice = 0;

  // Firebase queries ----------------------------------------------------------
  ref.onAuth(function(authData) {
    $scope.access = false;
    if (authData) {
      $scope.access = true;
      $scope.userName = getName(authData);
      ref.child("users").child(authData.uid).set({
        provider: authData.provider,
        name: getName(authData)
      });
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
  };

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
    for (var i = 0, len = $scope.customers.length; i < len; i++) {
      if ($scope.selectedAccNo == $scope.customers[i].acc) {
        $scope.selectedAcc = $scope.customers[i].name;
        if ($scope.customers[i][$scope.selectedItemNo.toUpperCase()]) {
          for (var j = 0, leng = $scope.items.length; j < leng; j++) {
            if ($scope.items[j].code == $scope.selectedItemNo.toUpperCase()) {
              $scope.selectedItem = $scope.items[j];
            } else {
              console.log("could not find this item");
            }
          }
        } else {
          console.log("This item isn't logged");
        }
      }
    }
  };
}]);
