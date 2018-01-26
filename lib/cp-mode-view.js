'use babel';

import InputBuffer from './views/input-buffer.js';
import OutputBuffer from './views/output-buffer.js';
import Toolbar from './views/toolbar.js';

// Combines individual views to create the package view
export default class CpModeView {

    constructor(serializedState) {
        // Create root element
        this.element = document.createElement('div');
        this.element.classList.add('cp-mode');

        var container = document.createElement('div');

        this.input = new InputBuffer();
        this.output = new OutputBuffer();
        this.toolbar = new Toolbar(this.input, this.output);

        container.appendChild(this.output.view);
        container.appendChild(this.input.view);

        this.element.appendChild(this.toolbar.view);
        this.element.appendChild(container);
    }

    // Returns an object that can be retrieved when package is activated
    serialize() {}

    // Tear down any state and detach
    destroy() {
        this.element.remove();
    }

    getElement() {
        return this.element;
    }
}
