var myApp = angular.module('app', ["firebase"]);

myApp.controller('priceCtrl', ['$scope', function($scope) {
  // Connects to the firebase server
  var ref = new Firebase('https://popping-torch-7294.firebaseio.com/');
  $scope.password = "";

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
}]);
