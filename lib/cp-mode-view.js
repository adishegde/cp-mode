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

        // Bind member functions
        this.setOutput = this.setOutput.bind(this);
    }

    // Returns an object that can be retrieved when package is activated
    serialize() {}

    // Tear down any state and detach
    destroy() {
        this.element.remove();
    }

    runCode() {
        var { buffer: inputBuffer } = this.input;
        var setOutput = this.setOutput;

        fs.writeFile(
            atom.workspace.getActivePane().activeItem.getPath() + "input.txt",
            inputBuffer.getText(),
            function(err) {
                if (err) {
                    // ERROR LOG
                    console.error(err);
                }

                // LOG
                console.log("The file was saved!");
            }
        );

        var ce = new CodeExecute(
            atom.workspace
                .getActivePane()
                .activeItem
                .getPath(),
            'cpp'
        );

        ce.compileCode().then(
            function() {
                return ce.executeCode(
                    path.normalize(
                        atom.workspace.
                            getActivePane().
                            activeItem.
                            getPath() + 'input.txt'
                    )
                );
            }
        ).then(
            function(obj) {
                // LOG
                console.log("stdout:\n" + obj);
                setOutput(obj);
            }
        ).catch(
            function(obj) {
                // ERROR LOG
                console.error("stderr: ", obj);
                setOutput(obj);
            }
        );
    }

    setOutput(text){
        this.output.textarea.innerHTML = text;
    }

    getElement() {
        return this.element;
    }
}
