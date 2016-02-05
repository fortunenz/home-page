// Checks the height of the browser to create height of item list
var adjustCheckoutSize = function() {
  $("#checkoutItems").css("height", window.innerHeight - $("#checkoutHeader").height());
  $("#invoiceCheckout").css("height", window.innerHeight - 150);
  $("#invoiceInnerItems").css("height", window.innerHeight - 150 - 70);
};

$(window).resize(function() {
  adjustCheckoutSize();
});

// Hides the loading gif on load of the application
window.onload = function() {
  adjustCheckoutSize();
};

var sortByKey = function(array, key) {
  return array.sort(function(a, b) {
      var x = a[key]; var y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
};

// Disable mousewheel on a input number field when in focus so the user
// doesn't accidently scroll values by incemrent of 0.01
var stopScroll = function() {
  $("form").on("focus", "input[type=number]", function (e) {
    $(this).on("mousewheel.disableScroll", function (e) {
      e.preventDefault();
    });
  });
  $("form").on("blur", "input[type=number]", function (e) {
    $(this).off("mousewheel.disableScroll");
  });
};

// Disable mousewheel on a input number field when in focus so the user
// doesn't accidently scroll values by incemrent of 0.01
var stopScrollInvoice = function() {
  setTimeout(function() {
    $("#invoiceTable").on("focus", "input[type=number]", function (e) {
      $(this).on("mousewheel.disableScroll", function (e) {
        e.preventDefault();
      });
    });
    $("#invoiceTable").on("blur", "input[type=number]", function (e) {
      $(this).off("mousewheel.disableScroll");
    });
  }, 100);
};

// Inserts approprate commas for quantities for ease of viewing when invoicing
var insertComma = function(number) {
  if (number.length < 4) {
    return number;
  } else if (number.length > 6) {
    number = number.slice(0,number.length-6) + "," + number.slice(number.length-6, number.length-3) + "," + number.slice(number.length-3);
    return number;
  } else {
    number = number.slice(0,number.length-3) + "," + number.slice(number.length-3);
    return number;
  }
};
