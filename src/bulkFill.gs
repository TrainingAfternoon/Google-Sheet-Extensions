function onOpen() {
  var ui = SpreadsheetApp.getUi();
  
  ui.createMenu("Trawler")
  .addItem("Enable autofill", "enableAutofill")
  .addItem("Disable autofill", "disableAutofill")
  .addItem("Bulk Fill", "pullInformationBulk")
  .addToUi();
}

//Autofill coming soon to a spreadsheet near you
function enableAutofill() {
  
}

function disableAutofill() {
  
}

function pullInformationBulk() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  //sheets[sheet][row][col]
  var sheets = ss.getSheets();
  
  /* sheets indices
   * 0 = computers
   * 1 = server blades
   * 2 = trimmed info
   * 3 = assets
   */  
  var assets = sheets[3].getRange("A2:A").getValues();
  assets = assets.filter(x => x[0] != '');
  
  /* deviceData[row][col] col indices
   * 0 = asset
   * 1 = s/n
   * 2 = model
   * 3 = device type
   * 4 = ram
   * 5 = processor name
   * 6 = storage + stor type
   */
  var deviceData = sheets[2].getRange("A2:G").getValues();
  
  var boilerplateSpecs = new Map();
  boilerplateSpecs.set("DAKTECH DISCOVERY 81 DESKTOP", {processor: "Intel Corei5-4570 @ 3.20GHz 4core", motherboard: "ASUS H81M-C"});
  boilerplateSpecs.set("DELL LATITUDE 15 5000 SERIES 15\"", {processor: "Intel Corei5-4210U @ 1.70GHz 2core", motherboard: "Dell 0MF4VX"});
  boilerplateSpecs.set("DELL LATITUDE 5000 SERIES 15\"", {processor: "Intel Corei5-4200U @1.60GHz 2core", motherboard: "Dell 0TG93N"});
  boilerplateSpecs.set("DELL LATITUDE E5530 15\"", {processor: "Intel Corei5-3230M @ 2.60GHz 2core", motherboard: "Dell 91C4N"});
  boilerplateSpecs.set("DELL OPTIPLEX 3010", {processor: "Intel Corei5-3470 @ 3.20GHz 4core ", motherboard: "Dell 042P49"});
  
  //row is built as asset / dtype / model / s/n / stortype / stor / RAM / proc / moth
  var builtRow = [];
  var storage = [];
  var specs = [];
  var assetFinder;
  var assetIndex;
  var results;
  var processor;
  var motherboard;
  
  //Test Cases
  //Logger.log(assets);
  /*sheets[0].appendRow(['test','test','test','test','test','test','test','test','test']);
  let tmp = [['test','test','test','test','test','test','test','test','test']];
  sheets[0].appendRow(tmp[0]);
  let tmp2 = [];
  for (var i = 0; i < 3; i++) {
    tmp2.push([]);
    for (var j = 0; j < 9; j++) {
     tmp2[i].push('test'); 
    }
  }
  sheets[0].appendRow(tmp2[0]);
  let obj = new Map();
  obj.set('t',{testo: 'testi'});
  let tmp3 = [];
  for (var k = 0; k < 9; k++) {
    let spec = obj.get('t');
    tmp3.push(spec.testo);
  }
  sheets[0].appendRow(tmp3);*/
  
  for (var i = 0; i < assets.length; i++) {
    results = null;
    for (var j = 0; j < deviceData.length; j++) {
      if (assets[i][0] == deviceData[j][0]) {//Concat 0 on to asset to deal with scanner failure to show leading zeroes IF NECESSARY
       results = j; 
       break;
      }
    }
    
    let build = [];
    if (results != null) {
      assetIndex = results;//results.getRowIndex()-2;//accounts for the +1 from start-at-1 and the +1 from header
      
      storage = deviceData[assetIndex][6].split(" ");//0 = stor | 1 = stortype
      if (storage.length < 2) {//If there is no stortype specifier in string, index 1 will be nonexistant, so storage.length == 1. In this case, we assume stortype is HDD
        storage.push("HDD");
      }
      
      if (boilerplateSpecs.has(String(deviceData[assetIndex][2]))) {
        let specObj = boilerplateSpecs.get(String(deviceData[assetIndex][2]));
        processor = specObj.processor;
        motherboard = specObj.motherboard; 
      } else {
        processor = "N\A";
        motherboard = "N\A";
      }
      
      
      
      build.push(deviceData[assetIndex][0]);//asset
      build.push(deviceData[assetIndex][3]);//Device type
      switch(deviceData[assetIndex][2]) {//Model -- case/switch handles wierd model names from info sheet (case/switch to be easily expandable, compared to if/else)
        case "DELL LATITUDE 5000 SERIES 15\"":
          build.push("DELL LATITUDE 15 E5540 15\"");
          break;
        case "DELL LATITUDE 15 5000 SERIES 15\"":
          build.push("DELL LATITUDE E5540 15\"");
          break;
        default:
          build.push(deviceData[assetIndex][2]);
          break;
      }
      build.push(deviceData[assetIndex][1]);//s/n
      build.push(storage[1]);//stortype
      build.push(storage[0]);//stor
      build.push(deviceData[assetIndex][4]);//ram
      build.push(processor);
      build.push(motherboard);
      
    } else {
      Logger.log("Row " + (i+2) + " left unbuilt because asset " + assets[i] + " does not exit in info!");
      build = [assets[i][0],'','','','','','','',''];
    }
    
    builtRow.push(build);
  }
  Logger.log(builtRow);
  for (var i = 0; i < builtRow.length; i++) {
    sheets[0].appendRow(builtRow[i]);
  }
  
  sheets[3].insertColumnBefore(1);//Kicks all the scanned assets out of the read column so repeat bulk fills will not pull from them
  sheets[3].getRange("A1").setValue("Milton Asset #");
  sheets[3].getRange("B1").setValue("Read Asset #");
}
