/**
 * ++++++++++++++++++++++++++ Main entry point +++++++++++++++++++++++++++++++
 *
 * @returns {Array<Object>}
 * Array of component objects, each containing ComponentData and PinData

function prepareSphinx() {
    // run pinlister part
    RunPinLister();
    
    // run draftsman part
    //generateDraftsmanOutput();

}
*/
 
/**
 * ++++++++++++++++++++++++++ pinlister script +++++++++++++++++++++++++++++++
 *
 * @returns {Array<Object>}
 * Array of component objects, each containing ComponentData and PinData
 */
function RunPinLister() {
  var RELATIVE_OUTPUT_PATH;
  var WorkSpace;
  var Project;
  //var FileFullPath;
  var ProjPath;
  var run_on_jenkins;

  // get current workspace
  Workspace = GetWorkspace();
  if (Workspace == null) return;

  // Get a count of the number of currently opened projects. 
  // The script project from which this script runs must be one of these.
  projectCount = Workspace.DM_ProjectCount;

  // Loop over all the open projects.
  // NOTE: Expecting only one project to be open.
  ProjectFullPath = '';
  for (i=0; i<projectCount; i++){
      // Get reference to project # i.
      Project = Workspace.DM_Projects(i);
      // See if we found our script project.
      if (Project.DM_ProjectFullPath != 'Free Documents'){

        // Strip off project name to give us just the path.
        ProjectFullPath = Project.DM_ProjectFullPath;
      }
  }

  // Set the Project file path
  // create project path
  ProjPath = ProjectFullPath.substr(0, ProjectFullPath.length - Project.DM_ProjectFileName.length);
  
  //check for run location (jenkins or not)
  var run_on_jenkins = false;
  for(i=0;i<ProjPath.length;i++){
    var stripPath = ProjPath.substr(i,7);
    if(stripPath == "jenkins"){
      var run_on_jenkins = true;
    }
  }

  // check if logs folder exists
  var fso_log = new ActiveXObject("Scripting.FileSystemObject");
  if (!fso_log.FolderExists(ProjPath + "\\logs")) {
    // create folder structure
    fso_log.CreateFolder(ProjPath + "\\logs");
  }

  // Initialize log file
  logfileFullPath = ProjPath + "\\logs\\altium_pinlister.log";

  var logFile = fso_log.CreateTextFile(logfileFullPath, true);

  Log(logFile, ": Log start",Date().toString());
  Log(logFile, ": ProjPath: " + ProjPath,Date().toString());

  var fso = new ActiveXObject("Scripting.FileSystemObject");

  // --- check if all working folders exist ----------------
  if (!fso.FolderExists(ProjPath + 'docs')) {
    // create folder structure
    fso.CreateFolder(ProjPath + 'docs');
    Log(logFile, ": " + ProjPath + "docs folder created",Date().toString());
  }
  else Log(logFile, ": " + ProjPath + "docs folder exists",Date().toString());

  if (!fso.FolderExists(ProjPath + 'docs\\design-spec')) {
    // create folder structure
    fso.CreateFolder(ProjPath + 'docs\\design-spec');
    Log(logFile, ": " + ProjPath + "docs\\design-spec folder created",Date().toString());
  }
  else Log(logFile, ": " + ProjPath + "docs\\design-spec folder exists",Date().toString());

  if (!fso.FolderExists(ProjPath + 'docs\\design-spec\\source')) {
    // create folder structure
    fso.CreateFolder(ProjPath + 'docs\\design-spec\\source');
    Log(logFile, ": " + ProjPath + "docs\\design-spec\\source folder created",Date().toString());
  }
  else Log(logFile, ": " + ProjPath + "docs\\design-spec\\source folder exists",Date().toString());

  if (!fso.FolderExists(ProjPath + 'docs\\design-spec\\source\\_autogen')) {
    // create folder structure
    fso.CreateFolder(ProjPath + 'docs\\design-spec\\source\\_autogen');
    Log(logFile, ": " + ProjPath + "docs\\design-spec\\source\\_autogen folder created",Date().toString());
  }
  else Log(logFile, ": " + ProjPath + "docs\\design-spec\\source\\_autogen folder created",Date().toString());

  CadFolderPath = ProjPath + 'docs\\design-spec\\source\\_autogen\\CAD';
  Log(logFile, ": CadFolderPath: " + CadFolderPath,Date().toString());

  // delete CAD folder if exists to cleanup old content from previous runs
  if (fso.FolderExists(CadFolderPath)) {
    Log(logFile, ": detected CAD folder existing",Date().toString());
    fso.DeleteFolder(CadFolderPath, true);
    Log(logFile, ": CAD folder deleted",Date().toString());
  }
  else Log(logFile, ": CAD folder does not exist",Date().toString());

  // wait for folder to be deleted file operation (timeout 5sec)
  var i = 0;
  while (i < 5) {
    // if folder deleted successfully
    if (!fso.FolderExists(CadFolderPath)) {
      // create new folder
      fso.CreateFolder(CadFolderPath);
      Log(logFile, ": CAD folder created",Date().toString());

      // generate pinlist of all components where DevNote is set
      // (e.g. Parameter exists and is not empty)
      RunPackingListGenerator(logFile, CadFolderPath + '\\'); // <<-------- pinlister generator ------

      // end script
      Log(logFile, ": pinlister run successful",Date().toString());
      logFile.Close();
      if(run_on_jenkins) TerminateWithExitCode(0);
      return 0;
    }

    WaitMilliSecondDelay(1000);
    i++;
  }

  //should never be reached
  Log(logFile, ": pinlister failed: could not create CAD folder ",Date().toString());
  logFile.Close();


  //TerminateWithExitCode(1);
}
// ----------- script end --------------

/**
 * ++++++++++++++++++++++++++ loggging +++++++++++++++++++++++++++++++
 *
 * writes status messages to a logfile
 */
function Log(FSO, Description, date)
{
    FSO.Write(date);
    FSO.WriteLine(Description);
}


/**
 * RunPackingListGenerator script
 *
 * Fetches component data from project and outputs information to file(s)
 * for later integration in hardware documentation (e.g. Sphinx)
 *
 * @param {String} filePath
 * Path of the output files to be written
 */
function RunPackingListGenerator(logFile, filePath) {
  var Project;
  var CompsList;

  BeginHourGlass();

  // do a compile so the logical documents get expanded into physical documents.
  Project = GetWorkspace.DM_FocusedProject;
  Project.DM_Compile;

  // get array of component objects
  // CompsList = fetchComponentListMock(Project);
  CompsList = fetchComponentList(logFile, Project);

  // write component data to one formatted file each
  for (var i = 0; i < CompsList.length; i++) {
    writeToCompFile(logFile, CompsList[i], filePath, 'rst');
  }
  
  // write bus data to one formatted file
  writeToBusFile(logFile, CompsList, filePath, 'rst');

  EndHourGlass();
}

/**
 * Iterates through components and returns filtered component list
 * with components data and nets assigned to pins as JSON array
 *
 * @returns {Array<Object>}
 * Array of component objects, each containing ComponentData and PinData
 *
 * ComponentData: { Designator, Manufacturer, PartNo, DevNote }
 *
 * PinData: { 1: { NetName, PinNote }, ... }
 */
function fetchComponentList(logFile, Project) {

  var enableOutput; // : Boolean;
  var Doc; //  : IDocument;
  var Comp; // : IComponent;
  var Pin; //  : IPin;
  var PinNote; // : TDynamicString;
  var Param; // : IParameter;
  var PinParam; // : IParameter;
  var CompObj; // one single object
  var CompListObj; // list of objects

  // initialize array for components
  CompListObj = [];

  // iterate through project physical documents
  for (var i = 0; i < Project.DM_PhysicalDocumentCount; i++) {
    Doc = Project.DM_PhysicalDocuments(i);

    // iterate through components
    for (var j = 0; j < Doc.DM_ComponentCount; j++) {
      enableOutput = false; // default no output if DevNote is not set
      Comp = Doc.DM_Components(j);

      // check if DevNote string is set
      for (var m = 0; m < Comp.DM_ParameterCount; m++) {
        Param = Comp.DM_Parameters(m);
        // fix for AD21.0.8: empty string param was previously undefined, but now is a string
        var StringNotEmpty;
        if (
          typeof Param.DM_Value === 'undefined' ||
          (typeof Param.DM_Value === 'string' && Param.DM_Value == '')
        ) {
          StringNotEmpty = false;
        } else {
          StringNotEmpty = true;
        }

        // if DevNote is set, add component info to CompStrings
        if (Param.DM_Name == 'DevNote' && StringNotEmpty) {
          enableOutput = true;
        }
      }
      Log(logFile, ": " + Comp.DM_PhysicalDesignator + " - enableOutput: " + enableOutput,Date().toString());

      // if DevNote param is set and component designator matches filter,
      // create component object
      if (enableOutput) {
        CompObj = {};
        CompObj["ComponentData"] = {};
        CompObj["PinData"] = {};

        // assign designator
        CompObj.ComponentData["Designator"] = Comp.DM_PhysicalDesignator;

        // assign default context 'NONE'
        CompObj.ComponentData["DevContext"] = 'NONE';

        // iterate through parameters and assign values to ComponentData
        for (var n = 0; n < Comp.DM_ParameterCount; n++) {
          Param = Comp.DM_Parameters(n);
          if (Param.DM_Name == 'Manufacturer')
            CompObj.ComponentData["Manufacturer"] = Param.DM_Value;

          if (Param.DM_Name == 'Manufacturer Part Number')
            CompObj.ComponentData["PartNo"] = Param.DM_Value;

          if (Param.DM_Name == 'DevNote')
            CompObj.ComponentData["DevNote"] = Param.DM_Value;

          if (Param.DM_Name == 'DevContext')
            CompObj.ComponentData["DevContext"] = Param.DM_Value;

          if (Param.DM_Name == 'DevAdr')
            CompObj.ComponentData["DevAdr"] = Param.DM_Value;

          if (Param.DM_Name == 'DevBus')
            CompObj.ComponentData["DevBus"] = Param.DM_Value;
        
          if (Param.DM_Name == 'Description')
            CompObj.ComponentData["Description"] = Param.DM_Value;
        }

        // iterate through component pins and assign values to PinData
        for (var k = 0; k < Comp.DM_PinCount; k++) {
          Pin = Comp.DM_Pins(k);

          // Check for (parts of a multi-part component that are not used in the project
          // add 'No Net' for unused pins...
          // if net name is ?
          // add nothing as it will else be doubled within RST file
          if (Pin.DM_FlattenedNetName != '?') {
            PinNote = '';

            // iterate through pin params and find 'Note'
            for (var p = 0; p < Pin.DM_ParameterCount; p++) {
              PinParam = Pin.DM_Parameters(p);
              if (PinParam.DM_Name == 'Note') {
                PinNote = PinParam.DM_Value;
              }
            }

            // assign to obj
            CompObj.PinData[Pin.DM_PinNumber] = {
              "NetName": Pin.DM_FlattenedNetName,
              "PinNote": PinNote
            }
          }
        }

        // add component to array
        CompListObj.push(CompObj);
      }
    }
  }

  return CompListObj;
}

/**
 * Writes component data to file
 *
 * @param {Object} component
 * Component object
 * @param {String} fullPath
 * path of the file to be written (without file name)
 * @param {String} format
 * desired output format of the file: json (default), rst
 */
function writeToCompFile(logFile, component, fullPath, format) {
  // build file name from designator and human readable name
  var fileName = '_autogen_' +
                  component.ComponentData.DevContext +
                  '_' +
                  component.ComponentData.Designator +
                  '_' +
                  component.ComponentData.DevNote;

  // replace spaces/invalid chars in fileName with underscore
  fileName = fileName.replace(/[\\\/\:\*\?"<> \|]/g, '_');

  // add absolute path to fileName
  fileNameFull = fullPath + fileName;
  
  // parse component data file format
  var compString;
  if (format == 'rst') {
    compString = parseCompRST(component);

    // set file extension
    fileNameFull += '.rst';
  } else {
    // JSON stringify crashes Altium, thus use simple workaround implementation
    compString = parseJSON(component);

    // set file extension
    fileNameFull += '.json';
  }

  Log(logFile, ": file to write: " + fileNameFull,Date().toString());

  // create report file
  var fso = new ActiveXObject("Scripting.FileSystemObject");
  //ShowMessage(fileNameFull);
  var reportFile = fso.CreateTextFile(fileNameFull, true);

  // write file
  reportFile.WriteLine(compString);
  
  //write log
  Log(logFile, ": file written: " + fileName + "." + format,Date().toString());
  
  reportFile.Close();

}


/**
 * Writes component data to file
 *
 * @param {Object} component
 * Component object
 * @param {String} fullPath
 * path of the file to be written (without file name)
 * @param {String} format
 * desired output format of the file: json (default), rst
 */
function writeToBusFile(logFile, components, fullPath, format) {
    
  // initialize arrays for busses
  var busComps = []; //array
  var busDict = {}; //object
    
  // collect all bus entries
  for (var comp in components){
    
    // if bus entry exists
    if(components[comp].ComponentData.DevBus != ''){

      // push component to new list
      busComps.push(components[comp]);
      //ShowMessage("RefDes: "+busComps[busComps.length - 1].ComponentData.Designator+
      //    "\nBus: "+busComps[busComps.length - 1].ComponentData.DevBus+
      //    "\nAddr: "+busComps[busComps.length - 1].ComponentData.DevAdr);
    }
  }
  

  /* ------- lege Struktur busDict an: -----------
  
  var busDict = {
  "I2C2": [["X7.1","11h"],
           ["X7.1","34h"],
           ["X10.1","54h"]],
  "I2C3": [["X4.1","10h"],
           ["IC13.1","27h"],
           ["IC20.1","40h"]],
  "I2C4": [["X3.3","27h"],
           ["X7.1","27h"]]
  };
  */

  // für jede komponente in der busliste
  for (item in busComps){
    //  ShowMessage("RefDes: "+busComps[item].ComponentData.Designator+
    //    "\nBus: "+busComps[item].ComponentData.DevBus+
    //    "\nAddr: "+busComps[item].ComponentData.DevAdr);
      
    //check for multibus and multiaddress entry
    var busses = busComps[item].ComponentData.DevBus.split(",");
    
    // adressen können in der form vorliegen [11h,34h];[27h];...
    // dabei gehören adressen in der ersten [] zum ersten bus, zweite klammer zum 2. bus etc
    var allAddresses = busComps[item].ComponentData.DevAdr.split(";");
    
    // remove all "[" and "]"
    for(key in allAddresses){
      allAddresses[key] = allAddresses[key].replace('[','');
      allAddresses[key] = allAddresses[key].replace(']','');
    }
    
    // splitte adressen
    for(key in busses){
      // splitte, wenn mehrere adressen pro bus vorhanden
      var addresses = allAddresses[key].split(",");
      
      // bus schon im dictionary vorhanden?
      if(busses[key] in busDict){
        // schreibe eine zeile für jede adresse
        for(addr in addresses){
          busDict[busses[key]].push([busComps[item].ComponentData.Designator,addresses[addr],busComps[item].ComponentData.DevNote]);
        }
      };
      // bus noch nicht im dict
      else{
        // add key
        busDict[busses[key]]=[];
        // schreibe eine zeile für jede adresse
        for(addr in addresses){
          //ShowMessage("address: "+addresses[addr]);
          busDict[busses[key]].push([busComps[item].ComponentData.Designator,addresses[addr],busComps[item].ComponentData.DevNote]);
        }
      };
    };
  };
  
  // write a file for every bus
  for (bus in busDict){
    //ShowMessage("bus: "+bus+"= "+busDict[bus]);
    //ShowMessage("länge: "+busDict[bus].length);
    /*ShowMessage("bus0: "+busDict[bus][0]+
              "\nbus1: "+busDict[bus][1]+
              "\nbus2: "+busDict[bus][2]+
              "\nbus3: "+busDict[bus][3]+
              "\nbus4: "+busDict[bus][4]+
              "\nbus5: "+busDict[bus][5]);
    */
    
    // build file name from designator and human readable name
    var fileName = '_autogen_busses_' + bus;
      
    // replace spaces/invalid chars in fileName with underscore
    fileName = fileName.replace(/[\\\/\:\*\?"<> \|]/g, '_');

    // add absolute path to fileName
    fileNameFull = fullPath + fileName;
  
    // parse component data file format
    var busString;
    if (format == 'rst') {
      busString = parseBusRST(bus,busDict);
  
      // set file extension
      fileNameFull += '.rst';
    } else {
      // JSON stringify crashes Altium, thus use simple workaround implementation
      //debug busString = parseJSON(component);
  
      // set file extension
      fileNameFull += '.json';
    }
  
    Log(logFile, ": file to write: " + fileNameFull,Date().toString());
  
    // create report file
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    //ShowMessage(fileNameFull);
    var reportFile = fso.CreateTextFile(fileNameFull, true);
  
    // write file
    reportFile.WriteLine(busString);
    
    //write log
    Log(logFile, ": file written: " + fileName + "." + format,Date().toString());
    
    reportFile.Close();
  
  };
};



/**
 * simple helper implementation of JSON.stringify,
 * reduced to JScript compatibility
 *
 * @param {Object} compObj
 * Object to stringify
 * @returns {String}
 * Stringified JSON object
 */
function parseJSON(compObj) {
  var objString = '';
  if (typeof compObj === 'object') {
      // We add the first curly brace
      objString += '{';
      for (var key in compObj) {
          objString += "\"" + key + "\":" + parseJSON(compObj[key]);

          // We add the comma
          // if (key !== lastKey) {
              objString += ',';
          // }
      }
      // We add the last curly brace
      objString += '}';
  } else if (typeof compObj === 'string') {
      objString += "\"" + compObj + "\"";
  } else if (typeof compObj === 'number') {
      objString += compObj;
  }
  return objString;
}

/**
 * reStructuredText parser for component files
 *
 * @param {Object} compObj
 * Object to parse
 * @returns {String}
 * string representation of rst formatted component
 */
function parseCompRST(compObj) {
  var objString = '';
  var header = '';
  if (typeof compObj === 'object') {

    // build header
    header += compObj.ComponentData.Designator;
    header += ' - ';
    header += compObj.ComponentData.DevNote;

    // build meta data
    objString += header + '\r\n';
    objString += repeatString('-', header.length) + '\r\n';
    objString += '\r\n';
    objString += '.. line-block::' + '\r\n';
    objString += '   **Information**:' + '\r\n';
    if (compObj.ComponentData.Manufacturer != "")
      objString += '   Manufacturer: ' + compObj.ComponentData.Manufacturer + '\r\n';
    if (compObj.ComponentData.PartNo != "")
      objString += '   Part Number: ' + compObj.ComponentData.PartNo + '\r\n';
    if (compObj.ComponentData.DevAdr != "")
      objString += '   Address: ' + compObj.ComponentData.DevAdr + '\r\n';
    if (compObj.ComponentData.DevBus != "") {
      objString += '   Bus: ' + compObj.ComponentData.DevBus + '\r\n';
    }
    objString += '\r\n';
    objString += '.. line-block::' + '\r\n';
    objString += '   **Description**:' + '\r\n';
    objString += '   ' + compObj.ComponentData.Description + '\r\n';
    objString += '\r\n';
    objString += '.. list-table:: ' + header + '\r\n';
    objString += '   :name: ' + header + '\r\n';
    objString += '   :class: longtable' + '\r\n';
    objString += '   :align: center' + '\r\n';
    objString += '   :widths: 10 60 60' + '\r\n';
    objString += '   :header-rows: 1' + '\r\n';
    objString += '   :stub-columns: 1' + '\r\n';
    objString += '\r\n';
    objString += '   * - Pin' + '\r\n';
    objString += '     - Net name' + '\r\n';
    objString += '     - Note' + '\r\n';

    // build pin data
    var p = compObj.PinData;
    for (var key in p) {
      objString += '   * - ' + key + '\r\n';
      objString += '     - ' + p[key].NetName + '\r\n';
      objString += '     - ' + p[key].PinNote + '\r\n';
    }

    objString += '\r\n';

  }
  return objString;
}


/**
 * reStructuredText parser for bus files
 *
 * @param {string} bus
 * @param {obj} busDict
 * Object to parse
 * @returns {String}
 * string representation of rst formatted component
 */
function parseBusRST(bus,busDict) {
  var objString = '';
  var header = '';


    // build header
    header += bus;
    
    objString += header + '\r\n';
    objString += repeatString('-', header.length) + '\r\n';
    objString += '\r\n';

    objString += '.. list-table:: ' + header + '\r\n';
    objString += '   :name: ' + header + '\r\n';
    objString += '   :class: longtable' + '\r\n';
    objString += '   :align: center' + '\r\n';
    objString += '   :widths: 60 60 60' + '\r\n';
    objString += '   :header-rows: 1' + '\r\n';
    objString += '   :stub-columns: 1' + '\r\n';
    objString += '\r\n';
    objString += '   * - RefDes' + '\r\n';
    objString += '     - Address' + '\r\n';
    objString += '     - DevNote' + '\r\n';

    // build bus data
    for (item in busDict[bus]) {
      objString += '   * - ' + busDict[bus][item][0] + '\r\n';
      objString += '     - ' + busDict[bus][item][1] + '\r\n';
      objString += '     - ' + busDict[bus][item][2] + '\r\n';
    }

    objString += '\r\n';

  
  return objString;
}

/**
 * simple helper implementation of string.repeat,
 * reduced to JScript compatibility
 *
 * @param {String} string
 * string to repeat
 * @param {Number} times
 * number of times to repeat
 * @returns {String}
 * repeated string
 */
function repeatString(string, times) {
  var repeatedString = "";
  while (times > 0) {
    repeatedString += string;
    times--;
  }
  return repeatedString;
}

/**
 * Mockup for components data object
 *
 * @returns {Array<Object>}
 * Array of component objects, each containing ComponentData and PinData
 */
function fetchComponentListMock(Project, filterDesignator) {
  return [
    {
      "ComponentData":
      {
        "Designator": "X1.10",
        "Manufacturer": "Molex",
        "PartNo": "12345",
        "DevNote": "This is the connector human readable name",
        "DevContext": "NONE"
      },
      "PinData":
      {
        "1":
        {
          "NetName": "VCC",
          "PinNote": "Power Net"
        },
        "2":
        {
          "NetName": "GND",
          "PinNote": "Power Net"
        },
        "3":
        {
          "NetName": "Net3",
          "PinNote": "Note3"
        },
        "4":
        {
          "NetName": "Net4",
          "PinNote": "Note4"
        },
        "5":
        {
          "NetName": "Net5",
          "PinNote": ""
        }
      }
    },
    {
      "ComponentData":
      {
        "Designator": "IC1.1",
        "Manufacturer": "STM",
        "PartNo": "98765",
        "DevNote": "This is an example IC with address",
        "DevAddress": "0x01 (00000001b)",
        "DevUsage": "example usage string",
        "DevContext": "ABC"
      },
      "PinData":
      {
        "1":
        {
          "NetName": "VCC",
          "PinNote": "Power Net"
        },
        "2":
        {
          "NetName": "GND",
          "PinNote": "Power Net"
        }
      }
    }
  ]
}


// ######### functions used as entry points from OutJobs #######################
// see Altium Example Scripts\Delphiscript Scripts\WSM\Export To Agile

/**
 * Generate is the entry point when running a Script Output from an
 * OutJob document.
 *
 * @param {String} Parameters
 * The settings to use are supplied from OutJob as a parameter string.
 */
/*
function Generate(Parameters) {
  // SetState_FromParameters(Parameters);
  RunPinlister();
}
*/

/**
 * Configure is the entry point for the right-click Configure command
 * in an OutJob document.  It shows the form with the supplied settings
 * (encoded as a parameter string), and, if the user clicks OK, it returns
 * the new settings. These new settings will be saved by OutJob, and applied
 * in subsequent invocations of the Generate procedure.
 *
 * @param {String} Parameters
 * The settings to use are supplied from OutJob as a parameter string.
 * @returns {String}
 */
/*
function Configure(Parameters) {
  // SetState_FromParameters(Parameters);
  return '';
}
*/

/**
 * PredictOutputFileNames is an entry point called from Boards view.
 * It should returns the full path names of all files that will be generated by
 * the Generate procedure, without actually generating them. The file names
 * should be returned via string, separated by '|' characters.
 *
 * @param {String} Parameters
 * @returns {String}
 */
 /*
function PredictOutputFileNames(Parameters) {
  return 'xxx.rst';
}
*/

/**
 * ++++++++++++++++++++++++++ output generator +++++++++++++++++++++++++++++++
 *
 * 
 * 
 */
function generateDraftsmanOutput() {

    var Project;         //IProject
    var scriptsFullPath = '';     //TDynamicString
    var projectPath = '';     //TDynamicString
    var logfileFullPath = '';     //TDynamicString
    var projectCount;    //Integer
    // MOCK
    //var projectPath = 'E:\\WDIR\\workspace\\playground\\v6-freya-compat\\Freya-Compatibility-Shield\\Freya_Compatibility_Shield.PrjPcb';

    var SourcesName = 'Sources.OutJob' // name of sources output job
    var outFolderPath = '';
    var enableCrossRefs = true; // enable addition of project schematic cross references prior to output
    var ProjectDoc; //IDocument
    var ServerDoc;  //IServerDocument
    var OutJobsArray = []; // output job file paths array

    // Get a count of the number of currently opened projects.
    // The script project from which this script runs must be one of these.
    projectCount = GetWorkspace.DM_ProjectCount;

    // Loop over all the open projects.
    // NOTE: Expecting only one project to be open.
    for (var i = 0; i <= projectCount - 1; i++) {
        // Get reference to project # i.
        Project = GetWorkspace.DM_Projects(i);
        // See if we found our script project.
        if (Project.DM_ProjectFullPath != 'Free Documents') {
            // Strip off project name to give us just the path.
            scriptsFullPath = Project.DM_ProjectFullPath;
            // set correct project as current
            Project.DM_SetAsCurrentProject;
        }
    }
    
    // create project path
    projectPath = scriptsFullPath.substr(0, scriptsFullPath.length - Project.DM_ProjectFileName.length);
    
    //check for run location (jenkins or not)
    var run_on_jenkins = false;
    for(i=0;i<projectPath.length;i++){
      var stripPath = projectPath.substr(i,7);
      if(stripPath == "jenkins"){
        var run_on_jenkins = true;
      }
    }
    
    // check if logs folder exists
    var fso_log = new ActiveXObject("Scripting.FileSystemObject");
    if (!fso_log.FolderExists(projectPath + "\\logs")) {
        // create folder structure
        fso_log.CreateFolder(projectPath + "\\logs");
        //ShowMessage("logs folder created");
    }

    // Initialize log file
    logfileFullPath = projectPath + "\\logs\\altium_GenerateOutput.log";
    //ShowMessage("logfileFullPath: " + logfileFullPath);
    var logFile = fso_log.CreateTextFile(logfileFullPath, true);
    Log(logFile, ": Log start",Date().toString());
    var fso = new ActiveXObject("Scripting.FileSystemObject");

    outFolderPath = projectPath + 'GeneratedOutput';
    
    // delete GeneratedOutput folder if exists to cleanup old content from previous runs
    if (fso.FolderExists(outFolderPath)) {
        //ShowMessage("detected GeneratedOutput folder existing");
        Log(logFile, ": detected GeneratedOutput folder existing",Date().toString());
        fso.DeleteFolder(outFolderPath, true);
        //ShowMessage("GeneratedOutput folder deleted");
        Log(logFile, ": GeneratedOutput folder deleted",Date().toString());
    }

    //open project
    ResetParameters();
    AddStringParameter('ObjectKind', 'Project');
    AddStringParameter('FileName', projectPath);
    RunProcess('WorkSpaceManager:OpenObject')
    //if (Project == null) return;

    // compile project if needs compilation
    if (Project.DM_NeedsCompile) Project.DM_Compile();


    // ----------- find all outjobs and get file paths -------------------------------
    // iterate over all project documents
    for (var i = 0; i <= Project.DM_LogicalDocumentCount - 1; i++) {
        ProjectDoc = Project.DM_LogicalDocuments(i);
        if (ProjectDoc != null) {
            // if current document is an output job file
            //ShowMessage(ProjectDoc.DM_FileName);
            if ((ProjectDoc.DM_DocumentKind == 'OUTPUTJOB') && (ProjectDoc.DM_FileName == 'DraftsMan.OutJob')){
                // get full file name/path and push to Array
                OutJobsArray.push(ProjectDoc.DM_FullPath);
            }
        }
    }

    //--------------- find all other outjobs and generate outputs -----------------------
    for(var k = 0; k < OutJobsArray.length; k++) {
        // get full path and check if it is NOT "Sources" outjob
        if (OutJobsArray[k].indexOf(SourcesName) == -1) {
            // open document
            ServerDoc = Client.OpenDocument('OUTPUTJOB', OutJobsArray[k]);

            // if opened successfully
            if (ServerDoc != null) {
                generateSingleOutput(ServerDoc);
                Log(logFile, ": file " + OutJobsArray[k] + " executed",Date().toString());
            }
        }
    }

    // -------------- Show message when finished
    //ShowMessage('Generating outputs finished successfully!');

    // Close Altium Designer
    Log(logFile, ": script finished",Date().toString());
    if(run_on_jenkins) TerminateWithExitCode(0);
};

/**
 * ++++++++++++++++++++++++++ helper for output generator+++++++++++++++++++++++++++++++
 *
 *
 *
 */
function generateSingleOutput(ServerDoc) {
  // show/focus document
  Client.ShowDocument(ServerDoc);

  //Process    = 'WorkspaceManager:Print';
  //Parameters = 'Action=PrintDocument|ObjectKind=OutputBatch';
  //Process    = 'WorkspaceManager:Print';
  //Parameters = 'Action=PublishToPDF|DisableDialog=True|ObjectKind=OutputBatch';
  //Process    = 'WorkspaceManager:Print';
  //Parameters = 'Action=PublishMultimedia|DisableDialog=True|ObjectKind=OutputBatch';
  //Process    = 'WorkspaceManager:GenerateReport';
  //Parameters = 'Action=Run|ObjectKind=OutputBatch';

  try {
    // set parameters for outputs
    ResetParameters();
    AddStringParameter('Action', 'Run');
    AddStringParameter('DisableDialog', 'True');
    AddStringParameter('OpenOutput' ,'False');
    AddStringParameter('ObjectKind', 'OutputBatch');
    RunProcess('WorkspaceManager:GenerateReport');
  } catch (e) {
    // if error occurs, show warning and continue
    ShowWarning(e);
  } finally {
    // close output job document
    Client.CloseDocument(ServerDoc);
  }
};
