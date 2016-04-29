app.directive("slipSortDescription", function() {
  function link(scope, element) {
    function shouldBeRed(itemCode) {
      if (itemCode.indexOf("RE0") === 0 && itemCode.indexOf("H") == 5) {
        // Checks if item is heavy duty resealable bag
        return true;
      } else if (itemCode.indexOf("FP") === 0 && itemCode.includes("B")) {
        // Checks if item is black foam tray
        return true;
      } else if (itemCode.indexOf("PRB") === 0 && itemCode.includes("NZ")) {
        // Checks if item is NZ made produce bag
        return true;
      }

      return false;
    }

    function shouldHavePackaging(itemCode) {
      if (itemCode.indexOf('RE0') === 0) {
        // Checks if item is resealable bag
        return true;
      }

      return false;
    }

    if (shouldBeRed(scope.item.code)) {
      element.css("color", "red");
    }
    if (shouldHavePackaging(scope.item.code)) {
      element.text(scope.item.description + " " + scope.item.packaging + ":");
    } else {
      element.text(scope.item.description + ":");
    }
  }

  return {
    restrict: 'E',
    scope: {
      item: '='
    },
    link: link
  };
});

app.directive("slipLoginCard", function() {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'htmlTemplates/loginCard.html'
  };
});

app.directive("slipLogout", function() {
  function link(scope, element, attr) {
    element.text("Logout");

    element.on("click", function() {
      ref.unauth();
      scope.loggedEmail = "";
      scope.loggedPass = "";
      scope.access = false;
      scope.$apply();
    });
  }

  return {
    restrict: 'A',
    transclude: true,
    link: link
  };
});

app.directive("slipSearchBox", function() {
  function link(scope, element, attr) {
    element.on("input", function() {
      if (scope.searchBox.trim().length === 0) {
        scope.displayedItems = scope.items;
      } else {
        scope.displayedItems = [];
        for (var i = 0, len = scope.items.length; i < len; i++) {
          if (scope.items[i].description.toLowerCase().includes(scope.searchBox.toLowerCase()) ||
              scope.items[i].code.toLowerCase().includes(scope.searchBox.toLowerCase())) {
            scope.displayedItems.push(scope.items[i]);
          }
        }
      }
      scope.$apply();
    });
  }

  return {
    restrict: 'A',
    transclude: true,
    link: link
  };
});
