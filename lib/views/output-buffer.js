'use babel';

/*
  This file exports (default export) the constructor for creating output buffer
  object. The constructed object has the following keys:

  - view: The HTML for the output buffer. Basically a div element of
  class "output-buffer".
  - textarea: Provides easy access to the "textarea" element.
*/

export default function OutputBuffer() {
    /* Create output buffer HTML */

    // outputContainer is a wrapper div for output buffer
    var outputContainer = document.createElement('div');
    outputContainer.classList.add('output-buffer');
    outputContainer.style = "width:50%;height:250px;display:block;float:right";

    // Create the title for output buffer and add to wrapper
    var outputHeader = document.createElement("h3");
    outputHeader.appendChild(document.createTextNode("Output Buffer"));
    outputContainer.appendChild(outputHeader);

    // Create textarea to display output
    var outputView = document.createElement("TEXTAREA");
    outputView.style="width:100%;height:100%;border:none;background:inherit";
    outputContainer.appendChild(outputView);

    /* Done with output buffer HTML */

    // Add outputContainer to object returned
    this.view = outputContainer;
    // textarea key provides easy access to textarea element
    this.textarea = outputView;
}
