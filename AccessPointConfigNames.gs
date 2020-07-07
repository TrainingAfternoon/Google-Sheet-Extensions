function createConfigNames() {
  function insertDots(str, n) {
    //Takes a str and returns a str with dots inserted at n intervals
    var arr = [];
    str = str.toLowerCase();//we want it to be all lower case
    for (var i = 0; i < str.length; i += n) {
      arr.push(str.substring(i,i+n));
    }
    return arr.join(".")
  }
  
  function isValid(str) {
    //Functions checks to make sure device is in a building we want to work on. Add or remove building codes as needed
    str = str.toUpperCase();//ensure that all strings have proper case formatting (mostly aimed at off cases like Temp)
    if (str == "MHS" ||
        str == "HES" ||
        str == "HTE" ||//remember to have this enabled when working with MHS
        str == "EES" ||
        str == "WES" ||
        str == "TEM" ) {
      return true;
    } else {
     return false 
    }
  }
  //ASSUMES SHEET ORDER DOES NOT CHANGE from Old --> New --> Storage --> Sheet 2 --> Name Scripts --> configs
  /* sheet indices
   * 0 = old
   * 1 = new
   * 5 = dump 
   */
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheets = ss.getSheets();
  
  const configPrefix = "config ap name ";
  const dotIntervals = 4;
  var configs = [];
  var oldName;
  var newName;
  var assetSearcher;
  var rowIndex;
  var configCommand;
  
  //Sheets is 3d. [sheet][row][col]
  //oldName and newName respectively are 2d [row][col]
  
  //0 = rep. assets 1 = loc 2 = old name 
  var oldNameData = sheets[0].getRange("A2:C").getValues();

  //0 = asset (pre-stripped) 3 = mac
  var newNameData = sheets[1].getRange("B2:E").getValues();

  
  /* TEST CASES
  //New Name confirmed worked
  Logger.log(oldNameData[82][2].substring(0,oldNameData[82][2].length-4)+ String(oldNameData[82][0]));
  
  //Old Name confirmed worked
  Logger.log(oldNameData[82][0]);
  assetSearcher = sheets[1].createTextFinder(String(oldNameData[82][0]));
  
  rowIndex = assetSearcher.findNext().getRowIndex();
  Logger.log(rowIndex);
  
  Logger.log(newNameData[rowIndex-2][3]);
  Logger.log("AP" + insertDots(String(newNameData[rowIndex-2][3]),4));
  */
  
  for (var i = 0; i < oldNameData.length; i++) {
    if (isValid(oldNameData[i][2].substring(0,3)) && oldNameData[i][0] != "") {//Checks if AP is in in-scope building and that name is not empty (not done yet)
      //New Name Synthesis
      //Strips old asset tag from old name, leaving only building info, concats with new asset tag
      newName = oldNameData[i][2].substring(0,oldNameData[i][2].length-4) + String(oldNameData[i][0]);
      
      //Old Name Synthesis
      //Uses new asset to find matching MAC, dots the MAC, and concats with "AP" to form old name of AP
      assetSearcher = sheets[1].createTextFinder(String(oldNameData[i][0]));
      var results = assetSearcher.findNext();
      //checks for the no-matching-asset case, which usually happens if an AP has been removed but not replaced. Still generates a command but it purposefully sticks out
      if (results != null) {
        rowIndex = results.getRowIndex()-2;//Account for the +1 from start-at-1 and the +1 from header line
        oldName = "AP" + insertDots(String(newNameData[rowIndex][3]),dotIntervals)
      
      } else {
        oldName = "HEY SAM AND/OR NEIL REMOVE THIS ENTRY IT'S WEIRD AND POSSIBLY NONEXISTANT";
      }
      
      //Create full command + place in configs array
      configCommand = configPrefix + newName + " " + oldName;
      configs.push(configCommand);
    }
  }
  
  //Dumps all created config commands vertically in row A in scripting/dump sheet
  //Below lines "pack" configs data into a matrix [[],...] b/c getrange/setvalues only accepts multidimensional input
  //use this hack instead of sheets[5].appendRow(configs); so commands are dumped in vertically instead of horizontally
  var packedConfigs = [];
  for (var i = 0; i < configs.length; i++) {
    packedConfigs.push([configs[i]]);
  }
  sheets[5].getRange(1,1,packedConfigs.length,1).setValues(packedConfigs)
  //sheets[5].appendRow(configs); //This SHOULD horizontally insert all the config commands. Comment out above line before use
}
