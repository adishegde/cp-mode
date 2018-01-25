'use babel';

/*
  This file exports (default export) the constructor for creating input buffer
  object. The constructed object has the following keys:

  - view: The HTML for the input buffer. Basically a div element of
  class "input-buffer".
  - getInput: Returns the text in the editor as a string
*/

export default function InputBuffer() {
    /* Create input buffer HTML */

    // Wrapper div for input buffer
    var inputContainer = document.createElement('div');
    inputContainer.classList.add('input-buffer');
    inputContainer.style = "width:50%;height:250px;display:block;float:left";

    // Heading for input buffer
    var inputHeader = document.createElement("h3");
    inputHeader.appendChild(document.createTextNode("Input Buffer"));
    // Add header to wrapper div
    inputContainer.appendChild(inputHeader);

    // Create buffer for renering input
    var inputBuffer = atom.workspace.buildTextEditor();
    var inputView = atom.views.getView(inputBuffer);
    inputView.style = "height:200px;overflow:scroll";
    // Add buffer to wrapper div
    inputContainer.appendChild(inputView);

    /* Done with input buffer HTML */

    // Add inputContainer to object returned
    this.view = inputContainer;

    // The getText method is bound to the particular instance of the editor
    // since this function is called in other functions
    this.getInput = inputBuffer.getText.bind(inputBuffer);
}
