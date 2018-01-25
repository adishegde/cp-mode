'use babel';

/*
  This file exports (default export) the constructor for creating input buffer
  object. The constructed object has the following keys:

  - view: The HTML for the input buffer. Basically a div element of
  class "input-buffer".
  - buffer: The text editor instance used by the input buffer.
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
    // buffer key provides access to text editor instance
    // of input buffer
    this.buffer = inputBuffer;
}
