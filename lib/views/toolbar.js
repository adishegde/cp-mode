'use babel';

import CodeExecute from '../code-execute.js';
import * as log from 'loglevel';

/*
  This file exports (default export) the constructor toolbar for the package.
  The toolbar consists of a button to run code and a dropdown list to select
  languages.

  On clicking the button the code in the active editor is tried to run.
  A toolbar object has the following properties:

  -view: The HTML of the toolbar element.
*/

export default function ToolBar(inputBuffer, outputBuffer) {
    /* Create toolbar HTML */

    // Toolbar is wrapped in a div of class "toolbar"
    var toolbarContainer = document.createElement('div');
    toolbarContainer.classList.add('toolbar');

    // List of languages for creating dropdown list
    var listLanguages = [
        {
            value: 'cpp',
            text: 'C++'
        },
        {
            value: 'c',
            text: 'C'
        },
        {
            value: 'py',
            text: 'Python'
        },
    ];

    // Create dropdown list
    var dropDownList = document.createElement('select');
    dropDownList.classList.add('lang-select');

    // Add options list from array listLanguages
    for(let lang of listLanguages) {
        let option = document.createElement('option');
        option.value = lang.value;
        option.text = lang.text;
        dropDownList.appendChild(option);
    }

    // Create run button
    var runButton = document.createElement('button');
    runButton.classList.add('run-button');
    runButton.innerHTML = "Run";
    // Bind arguments to onclick so that the required values can be retrieved
    runButton.onclick = runCode.bind(
        null,
        dropDownList,
        inputBuffer,
        outputBuffer
    );

    // Add run button to container div
    toolbarContainer.appendChild(runButton);
    // Add dropdown list to container div
    toolbarContainer.appendChild(dropDownList);

    /* Done creating HTML */

    // Add HTML to view property
    this.view = toolbarContainer;
}

// Wrapper function to run code. It retrieves the values from the passed
// arguments and calls the correct value
async function runCode(langSelect, inputBuffer, outputBuffer) {
    // Get lang code from selected language
    var lang = langSelect.options[langSelect.selectedIndex].value;

    // Get input buffer text
    var programInput = inputBuffer.getInput();

    try {
        // Editor whose code will be executed
        var editor = atom.workspace.getActivePane().activeItem;
        // Save file
        editor.save();

        log.info("Saved source code");
    } catch(err) {
        // Possible reason for error is that the text buffer has no associated
        // file
        log.error("There was error when saving the source code");
        log.debug("Error message: ", err);

        // Display message
        outputBuffer.setOutput("Message:\nPlease save source code in a file");

        // Return from function
        return;
    }


    // Try catch block to catch rejected promises
    try {
        // Create object to run program
        let runProgram = new CodeExecute(
            editor.getPath(),
            lang
        );

        // Compile C++ and C code
        if(lang === 'cpp' || lang === 'c') {
            // Wait for code to compile
            await runProgram.compileCode();
        }

        // Get output of program
        let programOutput = await runProgram.executeCode(programInput);

        log.debug("Output of program in runCode in toolbar.js: ", programOutput);

        // Prepare string to display
        let displayString = `Output:\n${programOutput.stdout}`;
        if(programOutput.stderr.length != 0)
            displayString += `\n\nCompiler/Interpretter Messages:\n${programOutput.stderr}`;

        // Display prepared string
        outputBuffer.setOutput(displayString);
    } catch (err) {
        // Log errors
        log.error("An error occurred while running code: ", err);
        log.debug("Error stderr: ", err.stderr);

        // Prepare string to display
        let displayString = `Messages:\n${err}`;

        // Display prepared string
        outputBuffer.setOutput(displayString);
    }
}
