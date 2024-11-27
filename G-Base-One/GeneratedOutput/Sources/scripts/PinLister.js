/**
 * ++++++++++++++++++++++++++ Main script +++++++++++++++++++++++++++++++
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
  //ShowMessage("ProjectFullPath: " + ProjectFullPath);
  // create project path
  ProjPath = ProjectFullPath.substr(0, ProjectFullPath.length - Project.DM_ProjectFileName.length);
  //ShowMessage("ProjPath: " + ProjPath);

  // check if logs folder exists
  var fso_log = new ActiveXObject("Scripting.FileSystemObject");
  if (!fso_log.FolderExists(ProjPath + "\\logs")) {
    // create folder structure
    fso_log.CreateFolder(ProjPath + "\\logs");
    //ShowMessage("logs folder created");
  }

  // Initialize log file
  logfileFullPath = ProjPath + "\\logs\\altium_pinlister.log";
  //ShowMessage("logfileFullPath: " + logfileFullPath);

  var logFile = fso_log.CreateTextFile(logfileFullPath, true);

  Log(logFile, ": Log start",Date().toString());
  Log(logFile, ": ProjPath: " + ProjPath,Date().toString());

  var fso = new ActiveXObject("Scripting.FileSystemObject");

  // --- check if all working folders exist ----------------
  if (!fso.FolderExists(ProjPath + 'docs')) {
    // create folder structure
    fso.CreateFolder(ProjPath + 'docs');
    //ShowMessage("docs folder created");
    Log(logFile, ": " + ProjPath + "docs folder created",Date().toString());
  }
  else Log(logFile, ": " + ProjPath + "docs folder exists",Date().toString());

  if (!fso.FolderExists(ProjPath + 'docs\\design-spec')) {
    // create folder structure
    fso.CreateFolder(ProjPath + 'docs\\design-spec');
    //ShowMessage("design-spec folder created");
    Log(logFile, ": " + ProjPath + "docs\\design-spec folder created",Date().toString());
  }
  else Log(logFile, ": " + ProjPath + "docs\\design-spec folder exists",Date().toString());

  if (!fso.FolderExists(ProjPath + 'docs\\design-spec\\source')) {
    // create folder structure
    fso.CreateFolder(ProjPath + 'docs\\design-spec\\source');
    //ShowMessage("source folder created");
    Log(logFile, ": " + ProjPath + "docs\\design-spec\\source folder created",Date().toString());
  }
  else Log(logFile, ": " + ProjPath + "docs\\design-spec\\source folder exists",Date().toString());

  if (!fso.FolderExists(ProjPath + 'docs\\design-spec\\source\\_autogen')) {
    // create folder structure
    fso.CreateFolder(ProjPath + 'docs\\design-spec\\source\\_autogen');
    //ShowMessage("_autogen folder created");
    Log(logFile, ": " + ProjPath + "docs\\design-spec\\source\\_autogen folder created",Date().toString());
  }
  else Log(logFile, ": " + ProjPath + "docs\\design-spec\\source\\_autogen folder created",Date().toString());

  CadFolderPath = ProjPath + 'docs\\design-spec\\source\\_autogen\\CAD';
  Log(logFile, ": CadFolderPath: " + CadFolderPath,Date().toString());

  // delete CAD folder if exists to cleanup old content from previous runs
  if (fso.FolderExists(CadFolderPath)) {
    //ShowMessage("detected CAD folder existing");
    Log(logFile, ": detected CAD folder existing",Date().toString());
    fso.DeleteFolder(CadFolderPath, true);
    //ShowMessage("CAD folder deleted");
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
      //ShowMessage("CAD folder created");
      Log(logFile, ": CAD folder created",Date().toString());

      // generate pinlist of all components where DevNote is set
      // (e.g. Parameter exists and is not empty)
      RunPackingListGenerator(logFile, CadFolderPath + '\\'); // <<-------- script start ------

      // end script
      //ShowMessage("script run successful");
      Log(logFile, ": pinlister run successful",Date().toString());
      logFile.Close();
      TerminateWithExitCode(0);
      return 0;
    }

    WaitMilliSecondDelay(1000);
    i++;
  }

  //should never be reached
  //ShowError('script run NOT successful');
  Log(logFile, ": pinlister failed: could not create CAD folder ",Date().toString());
  logFile.Close();

  //TerminateWithExitCode(1);
}
// ----------- script end --------------

/*..............................................................................*/
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
    writeToFile(logFile, CompsList[i], filePath, 'rst');
  }

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
  var CompObj;
  var CompListObj;

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

//ShowMessage(Comp.DM_PhysicalDesignator + " - " + enableOutput);

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
          //ShowMessage(Param.DM_Name);
          if (Param.DM_Name == 'Manufacturer')
            CompObj.ComponentData["Manufacturer"] = Param.DM_Value;

          if (Param.DM_Name == 'Manufacturer Part Number')
            CompObj.ComponentData["PartNo"] = Param.DM_Value;

          if (Param.DM_Name == 'DevNote')
            CompObj.ComponentData["DevNote"] = Param.DM_Value;

          if (Param.DM_Name == 'DevContext')
            CompObj.ComponentData["DevContext"] = Param.DM_Value;

          if (Param.DM_Name == 'DevAddress')
            CompObj.ComponentData["DevAddress"] = Param.DM_Value;

          if (Param.DM_Name == 'DevUsage')
            CompObj.ComponentData["DevUsage"] = Param.DM_Value;
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
function writeToFile(logFile, component, fullPath, format) {
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
    compString = parseRST(component);

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

}

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
 * reStructuredText parser
 *
 * @param {Object} compObj
 * Object to parse
 * @returns {String}
 * string representation of rst formatted component
 */
function parseRST(compObj) {
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
    if (typeof compObj.ComponentData.Manufacturer !== 'undefined')
      objString += '   Manufacturer: ' + compObj.ComponentData.Manufacturer + '\r\n';
    if (typeof compObj.ComponentData.PartNo !== 'undefined')
      objString += '   Part Number: ' + compObj.ComponentData.PartNo + '\r\n';
    if (typeof compObj.ComponentData.DevAddress !== 'undefined')
      objString += '   Address: ' + compObj.ComponentData.DevAddress + '\r\n';
    if (typeof compObj.ComponentData.DevUsage !== 'undefined') {
      objString += '\r\n';
      objString += '.. line-block::' + '\r\n';
      objString += '   **Usage**:' + '\r\n';
      objString += '   ' + compObj.ComponentData.DevUsage + '\r\n';
    }
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
function Generate(Parameters) {
  // SetState_FromParameters(Parameters);
  RunPinlister();
}

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
function Configure(Parameters) {
  // SetState_FromParameters(Parameters);
  return '';
}

/**
 * PredictOutputFileNames is an entry point called from Boards view.
 * It should returns the full path names of all files that will be generated by
 * the Generate procedure, without actually generating them. The file names
 * should be returned via string, separated by '|' characters.
 *
 * @param {String} Parameters
 * @returns {String}
 */
function PredictOutputFileNames(Parameters) {
  return 'xxx.rst';
}
