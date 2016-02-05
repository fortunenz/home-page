// Function to build the table to be printed
var buildTable = function(spreadsheetArray) {
  $("#print").empty();

  var table = '<br><table>';
  table += "<tr>";
  table += "<th></th>";
  for (var i = 0, len = spreadsheetArray.length; i < len; i++) {
    table += "<th>" + spreadsheetArray[i].short + "</th>";
  }
  table += "<th>Total</th>";
  table += "</tr>";

  table += buildRow(spreadsheetArray);

  table += "</table>";

  $("#print").append(table);
};

// Loops through each shop in spreadsheet and builds a packing slip
// to be printed
var buildPackingSlips = function(spreadsheetArray, slipNumber) {
  $("#packingSlip").empty();
  var packingSlip;

  // Formats date
  var systemDate = new Date();
  var tokens = systemDate.toString().split(" ");
  var date = tokens[2] + " " + tokens[1] + " " + tokens[3];

  for (var i = 0; i < spreadsheetArray.length; i++) {
    slipNumber++;
    for (var j = 0; j < 2; j++) {
      packingSlip = "";
      packingSlip += '<div class="packingSlips packingFullPage">';
      // Header
      packingSlip += '<div class="row">';
      packingSlip += '<h1 class="col-10 packingTitle"><img class="logo"src="images/logo.png"> FORTUNE ENTERPRISES CO (NZ) LTD</h1>';
      packingSlip += '<strong class="col-2 packingName">Packing Slip</strong>';
      packingSlip += '</div>';
      // Left column of subheading
      packingSlip += '<div class="row packingRow"><div class="col-8">';
      packingSlip += '<p class="packingP">73 Huia Road, Otahuhu, Auckland</p>';
      packingSlip += '<p class="packingP">PO Box 9511 New Market, Auckland</p>';
      packingSlip += '<p class="packingP">Email: <a href="#">feltd@xtra.co.nz</a></p></div>';
      // Right column of subheading
      packingSlip += '<div class="col-4">';
      packingSlip += '<p class="packingP right">Phone:    (09) 276-8681</p>';
      packingSlip += '<p class="packingP right">Fax:      (09) 276-8682</p>';
      packingSlip += '<p class="packingP right">Website:  <a href="#">www.fortunenz.com </a></p></div>';
      packingSlip += '</div>';
      // Left side shop details
      packingSlip += '<div class="row packingRow"><div class="col-8">';
      packingSlip += '<p class="packingP">Deliver to:</p>';
      packingSlip += '<p class="packingP"><strong>';
      packingSlip += spreadsheetArray[i].name;
      packingSlip += '</strong></p>';
      packingSlip += '<p class="packingP">';
      packingSlip += spreadsheetArray[i].address;
      packingSlip += '</p>';
      packingSlip += '<p class="packingP">';
      packingSlip += spreadsheetArray[i].city;
      packingSlip += '</p></div>';
      // Right side date + packing slip number
      packingSlip += '<div class="col-4">';
      packingSlip += '<p class="packingP">Packing slip no.: ';
      packingSlip += slipNumber;
      packingSlip += '</p>';
      packingSlip += '<p class="packingP">Account no.: ';
      packingSlip += spreadsheetArray[i].acc;
      packingSlip += '</p>';
      packingSlip += '<p class="packingP">Date: ' + date + '</p>';
      packingSlip += '</div></div>';
      // Item details with table
      var table = '';

      table += '<table class="packingTable"><tr><th>Code</th><th>Description</th><th>Packaging</th><th>Quantity</th><th>Carton</th></tr>';
      table += buildPackingRow(spreadsheetArray[i]);
      table += '</table>';

      packingSlip += table;
      // Name and signature
      packingSlip += '<div class="packingSign">';
      packingSlip += '<p>Name: _________________________________</p><br>';
      packingSlip += '<p>Signature: ______________________________</p></div></div>';

      $("#packingSlip").append(packingSlip);
    }
  }
  var slipNumberRef = new Firebase('https://popping-torch-7294.firebaseio.com/slipNumber');
  slipNumberRef.set(slipNumber);
};

// Builds all the rows
var buildRow = function(spreadsheetArray) {
  var table = "";
  var tempTotal;
  var items = model.items;

  for (var k = 0; k < items.length; k++) {
    tempTotal = 0;
    for (var i = 0, len = spreadsheetArray.length; i < len; i++) {
      tempTotal += spreadsheetArray[i][items[k].code];
    }

    if (tempTotal > 0) {
      table += "<tr><th>" + items[k].description + "</th>";
      for (i = 0, len = spreadsheetArray.length; i < len; i++) {
        table += "<td>";
        if (spreadsheetArray[i][items[k].code] > 0) {
          table += spreadsheetArray[i][items[k].code];
        }
        table += "</td>";
      }
      table += "<td>" + tempTotal + "</td><td>" + items[k].orderAs + "</td>";
      table += "</tr>";
    }
  }

  return table;
};

var buildPackingRow = function(spreadsheetArray) {
  var table = "";
  var items = model.items;
  var quantity = 0;

  for (var k = 0; k < items.length; k++) {
    if (items[k].code in spreadsheetArray) {
      if (spreadsheetArray[items[k].code] > 0) {
        table += '<tr><td>';
        table += items[k].code;
        table += '</td>';
        table += '<td>';
        table += items[k].description;
        table += '</td>';
        table += '<td>';
        table += items[k].packaging;
        table += '</td>';
        table += '<td>';

        // Logic for displaying correct quantities
        var reQuantitiy;

        if (items[k].code.includes("RE")) {
          reQuantitiy = spreadsheetArray[items[k].code] * 1000;
          table += insertComma(reQuantitiy.toString()) + " pcs";
        } else if (items[k].unit == "1000") {
          quantity =  spreadsheetArray[items[k].code] * items[k].quantity;

          // Checks if it's a set item or just normal pcs
          if (items[k].orderAs == "ctn+ctn") {
            table += insertComma(quantity.toString()) + " sets";
          } else {
            table += insertComma(quantity.toString()) + " pcs";
          }
        } else if (items[k].unit == "Roll" && items[k].orderAs == "ctn") {
          quantity =  spreadsheetArray[items[k].code] * items[k].quantity;
          table += insertComma(quantity.toString()) + " rolls";
        } else if (items[k].unit == "Box" && items[k].orderAs == "ctn") {
          quantity =  spreadsheetArray[items[k].code] * items[k].quantity;
          table += insertComma(quantity.toString()) + " boxes";
        } else {
          table += spreadsheetArray[items[k].code] + " " + items[k].orderAs;
        }

        table += '</td>';
        table += '<td>';

        // Logic for displaying correct carton values

        // Logic for gloves
        if (items[k].code.includes("GLOVE")) {
          if (spreadsheetArray[items[k].code] < 1) {
            table += (spreadsheetArray[items[k].code] * 10)+ " boxes";
          } else if (spreadsheetArray[items[k].code].toString().includes(".")){
            table += parseInt(spreadsheetArray[items[k].code]-(spreadsheetArray[items[k].code]%1)) + " ctn + " + parseInt((spreadsheetArray[items[k].code]*10)-((spreadsheetArray[items[k].code]-(spreadsheetArray[items[k].code]%1))*10))+ " boxes";
          } else {
            table += spreadsheetArray[items[k].code] + " ctn";
          }
        // Logic for bag seal tape 12mmx66m
        } else if (items[k].code.includes("SEAL12")) {
          if (spreadsheetArray[items[k].code]%36 === 0) {
            table += (spreadsheetArray[items[k].code] / 36) + " ctn";
          } else {
            if (spreadsheetArray[items[k].code] < 36) {
              table += spreadsheetArray[items[k].code] + " rolls";
            } else {
              table += ((spreadsheetArray[items[k].code]/36)-((spreadsheetArray[items[k].code]%36)/36)) + " ctn + " + (spreadsheetArray[items[k].code] % 36)+ " rolls";
            }
          }
        // Logic for resealable bags
        } else if (items[k].code.includes("RE")) {
          if (reQuantitiy < items[k].quantity) {
            table += insertComma(reQuantitiy.toString()) + " pcs";
          } else {
            if (reQuantitiy%items[k].quantity === 0) {
              table += (reQuantitiy / items[k].quantity) + " ctn";
            } else {
              table += ((reQuantitiy/items[k].quantity)-((reQuantitiy%items[k].quantity)/items[k].quantity)) + " ctn + " + insertComma((reQuantitiy % items[k].quantity).toString())+ " pcs";
            }
          }
        } else if (items[k].orderAs == "1000") {
          quantity =  insertComma(spreadsheetArray[items[k].code].toString()) * items[k].quantity;
          table += quantity + " pcs";
        } else {
          table += spreadsheetArray[items[k].code] + ' ' + items[k].orderAs;
        }

        table += '</td>';
        table += '</tr>';
      }
    }
  }

  return table;
};
