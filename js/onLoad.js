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

// When user pressed the grave accent key they will focus on the search box
// this allows for q quicker using exp
document.addEventListener('keyup', function(event) {
  if(event.keyCode == 192) {
    document.getElementById("searchBox").focus();
  }
});
