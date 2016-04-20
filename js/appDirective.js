app.filter("reverse", function() {
  return function(items) {
    return items.slice().reverse();
  };
});

// Logic for displaying correct quantities
app.filter("quantity", function() {
  return function(amount, item) {
    var quantity;
    var reQuantitiy;
    var value;

    if (item.code.includes("RE0")) {
      reQuantitiy = amount * 1000;
      value = insertComma(reQuantitiy.toString()) + " pcs";
    } else if (item.unit == "1000") {
      quantity =  amount * item.quantity;

      // Checks if it's a set item or just normal pcs
      if (item.orderAs == "ctn+ctn") {
        value = insertComma(quantity.toString()) + " sets";
      } else {
        value = insertComma(quantity.toString()) + " pcs";
      }
    } else if (item.unit == "Roll" && item.orderAs == "ctn") {
      quantity =  amount * item.quantity;
      value = insertComma(quantity.toString()) + " rolls";
    } else if (item.unit == "Box" && item.orderAs == "ctn") {
      quantity =  amount * item.quantity;
      value = insertComma(quantity.toString()) + " boxes";
    } else {
      value = amount + " " + item.orderAs;
    }

    return value;
  };
});

// Logic for displaying correct carton values
app.filter("carton", function() {
  return function(amount, item) {
    var value;

    // Logic for gloves
    if (item.code.includes("GLOVE")) {
      if (amount < 1) {
        value = (amount * 10)+ " boxes";
      } else if (amount.toString().includes(".")){
        value = parseInt(amount-(amount%1)) + " ctn + " + parseInt((amount*10)-((amount-(amount%1))*10))+ " boxes";
      } else {
        value = amount + " ctn";
      }
    // Logic for bag seal tape 12mmx66m
    } else if (item.code.includes("SEAL")) {
      if (amount%item.quantity === 0) {
        value = (amount / item.quantity) + " ctn";
      } else {
        if (amount < item.quantity) {
          value = amount + " rolls";
        } else {
          value = ((amount/item.quantity)-((amount%item.quantity)/item.quantity)) + " ctn + " + (amount % item.quantity)+ " rolls";
        }
      }
    // Logic for resealable bags
    } else if (item.code.includes("RE0")) {
      var reQuantitiy = amount * 1000;

      if (reQuantitiy < item.quantity) {
        value = insertComma(reQuantitiy.toString()) + " pcs";
      } else {
        if (reQuantitiy%item.quantity === 0) {
          value = (reQuantitiy / item.quantity) + " ctn";
        } else {
          value = ((reQuantitiy/item.quantity)-((reQuantitiy%item.quantity)/item.quantity)) + " ctn + " + insertComma((reQuantitiy % item.quantity).toString())+ " pcs";
        }
      }
    } else if (item.orderAs == "1000") {
      var quantity =  insertComma(amount.toString()) * item.quantity;
      value = quantity + " pcs";
    } else {
      value = amount + ' ' + item.orderAs;
    }

    return value;
  };
});
