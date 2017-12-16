'use babel';

import CodeExecute from './code-execute.js'
import * as path from "path";

export default class CpModeView {

    constructor(serializedState) {
        // Create root element
        this.element = document.createElement('div');
        this.element.classList.add('cp-mode');


        let container = document.createElement('div');

        let input_container = document.createElement('div');
        var inputHeader = document.createElement("h3");
        inputHeader.appendChild(document.createTextNode("Input Buffer"))

        this.inputBuffer = atom.workspace.buildTextEditor();
        console.log(this.inputBuffer)
        input_container.appendChild(inputHeader)
        input_container.appendChild(atom.views.getView(this.inputBuffer))
        input_container.style = "width:50%;height:250px;display:block;float:left"

        let output_container = document.createElement('div');
        output_container.style = "width:50%;height:250px;display:block;float:right"

        var outputHeader = document.createElement("h3");
        outputHeader.appendChild(document.createTextNode("Output Buffer"))
        let runButton = document.createElement("button");
        runButton.innerHTML = "Run!"
        // runButton.classList.add("btn")
        runButton.onclick = ()=> {this.runCode()}; //function(){console.log("run")}

        outputHeader.appendChild(runButton)
        this.outputView = document.createElement("TEXTAREA");
        this.outputView.style="width:100%;height:100%;border:none;background:inherit"
        output_container.appendChild(outputHeader)
        output_container.appendChild(this.outputView)

        container.appendChild(input_container);
        container.appendChild(output_container);

        this.element.appendChild(container)


    }

    // Returns an object that can be retrieved when package is activated
    serialize() {}

    // Tear down any state and detach
    destroy() {
        this.element.remove();
    }

    runCode() {
        var setOutput = this.setOutput.bind(this)


        var fs = require('fs');
        fs.writeFile("/Users/satvikramaprasad/Desktop/input.txt", this.inputBuffer.getText(), function(err) {
            if (err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });

        var ce = new CodeExecute(atom.workspace.getActivePane().activeItem.getPath(), 'cpp');

        ce.compileCode().then(
            function() {
                return ce.executeCode(path.normalize('/Users/satvikramaprasad/Desktop/input.txt'));

            }
        ).then(
            function(obj) {
                console.log("stdout:\n" + obj);
                setOutput(obj)
            }
        ).catch(
            function(obj) {
                console.log("stderr:");
                console.log(obj);
                setOutput(obj)

            }
        );
    }
    setOutput(text){
        this.outputView.innerHTML = text
    }
    getElement() {
        return this.element;
    }

}
