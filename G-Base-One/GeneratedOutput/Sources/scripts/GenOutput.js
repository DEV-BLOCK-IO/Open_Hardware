// log file writing
function Log(FSO, Description, date)
{
    FSO.Write(date);
    FSO.WriteLine(Description);
}


// main entry point
function generateOutput() {

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

    // add schematic cross references if enabled
    if (enableCrossRefs) {
        // Client.BeginDocumentLoad();
        for(var idx = 0; idx <= Project.DM_LogicalDocumentCount - 1; idx++) {
            ProjectDoc = Project.DM_LogicalDocuments(idx);
            if (ProjectDoc != null) {
                // if current document is a schematic file
                if (ProjectDoc.DM_DocumentKind == 'SCH') {
                    // open document
                    ServerDoc = Client.OpenDocumentShowOrHide(ProjectDoc.DM_DocumentKind, ProjectDoc.DM_FullPath, true);
                    Client.ShowDocument(ServerDoc);
                }
            }
        }

        // FIXME: Hack to get cross refs working correctly. If not applied, cross refs
        //        are always applied to the left of the port, but if this user interaction
        //        is there, then everything works perfectly well. Also see
        //        https://forum.live.altium.com/posts/241969#posts/241969/749185
        //        Use AutoClose_OutputOK.exe as headless workaround.
        //ShowInfoWithCaption('StartOutput', 'Ready to start output');

        ResetParameters();
        AddStringParameter('Action', 'RemoveFromProject');
        RunProcess('Sch:CrossReference');

        ResetParameters();
        AddStringParameter('Action', 'AddToProject');
        RunProcess('Sch:CrossReference');

        //Client.StopServer('SCH');
    }

    // ----------- find all outjobs and get file paths -------------------------------
    // iterate over all project documents
    for (var i = 0; i <= Project.DM_LogicalDocumentCount - 1; i++) {
        ProjectDoc = Project.DM_LogicalDocuments(i);
        if (ProjectDoc != null) {
            // if current document is an output job file
            if (ProjectDoc.DM_DocumentKind == 'OUTPUTJOB') {
                // get full file name/path and push to Array
                OutJobsArray.push(ProjectDoc.DM_FullPath);
            }
        }
    }

    // ------------ find Sources outjob first, so that copied files do not include generated outputs
    for(var j = 0; j < OutJobsArray.length; j++) {
        // get full path and check if it is "Sources" outjob
        if (OutJobsArray[j].indexOf(SourcesName) != -1) {
            // open document
            ServerDoc = Client.OpenDocument('OUTPUTJOB', OutJobsArray[j]);

            //ShowInfoWithCaption('StartOutput', 'Ready to start output');

            // if opened successfully
            if (ServerDoc != null) {
                generateSingleOutput(ServerDoc);
                Log(logFile, ": file " + OutJobsArray[j] + " executed",Date().toString());
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
    TerminateWithExitCode(0);
};


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

// TODO: currently not implemented
// function deleteDirectory(path) {
//   var CommandLine = 'cmd.exe /C if exist ' + path + ' (echo Directory ' + path + ' already exists! && del ' + path + ')';
//   var ErrorCode = RunApplication(CommandLine);
//   if (ErrorCode != 0) {
//     ShowError('System cannot start : ' + CommandLine + '\n' + GetErrorMessage(ErrorCode));
//   }
// };

