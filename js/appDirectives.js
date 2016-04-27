app.directive("slipSortDescription", function() {
  function link(scope, element) {
    function shouldBeRed(itemCode) {
      if (itemCode.indexOf("RE0") === 0 && itemCode.indexOf("H") == 5) {
        return true;
      } else if (itemCode.indexOf("FP") === 0 && itemCode.includes("B")) {
        return true;
      }

      return false;
    }

    function shouldHavePackaging(itemCode) {
      if (itemCode.indexOf('RE0') === 0) {
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
