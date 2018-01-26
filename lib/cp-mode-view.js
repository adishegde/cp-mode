'use babel';

import InputBuffer from './views/input-buffer.js';
import OutputBuffer from './views/output-buffer.js';
import CodeExecute from './code-execute.js';
import * as path from 'path';
import * as fs from 'fs';

export default class CpModeView {

    constructor(serializedState) {
        // Create root element
        this.element = document.createElement('div');
        this.element.classList.add('cp-mode');

        var container = document.createElement('div');
        this.input = new InputBuffer();
        this.output = new OutputBuffer();
        container.appendChild(this.output.view);
        container.appendChild(this.input.view);

        var runButton = document.createElement("button");
        runButton.innerHTML = "Run!";
        runButton.onclick = (()=> this.runCode());

        this.element.appendChild(runButton);
        this.element.appendChild(container);
    }

    // Returns an object that can be retrieved when package is activated
    serialize() {}

    // Tear down any state and detach
    destroy() {
        this.element.remove();
    }

    runCode() {
        // Extract objects from this
        var { input, output } = this;

        // Create object to compile and execute code
        var ce = new CodeExecute(
            atom.workspace
                .getActivePane()
                .activeItem
                .getPath(),
            'cpp'
        );

        ce.compileCode().then(() => {
            // After compilation execute code
            return ce.executeCode(
                // Pass input buffer text as parameter
                input.getInput()
            );
        }).then((result) => {
            // Execution was successful
            // Display output and warnings

            // LOG
            console.log("Result: ",  result);

            // Prepare string to display
            var display = `Output:\n ${result.stdout}`;
            if(result.stderr.length != 0)
                display += `\n\n Compiler/Interpretter Messages:\n ${result.stderr}`;

            // Display prepared string
            output.setOutput(display);
        }).catch((result) => {
            // Error in compilation or execution

            // ERROR LOG
            console.log("Error in cp-mode-view runCode: ", result);

            // Prepare string to display
            var display = `Messages:\n ${result}`;

            // Display prepared string
            output.setOutput(display);
        });
    }

    getElement() {
        return this.element;
    }
}
