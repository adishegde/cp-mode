'use babel';

import CpModeView from './cp-mode-view';
import { CompositeDisposable } from 'atom';


export default {

  cpModeView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.cpModeView = new CpModeView(state.cpModeViewState);
    this.modalPanel = atom.workspace.addBottomPanel({
      item: this.cpModeView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'cp-mode:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.cpModeView.destroy();
  },

  serialize() {
    return {
      cpModeViewState: this.cpModeView.serialize()
    };
  },

  toggle() {
    console.log('CpMode was toggled!');


    // var ce = new CodeExecute('/Users/satvikramaprasad/Desktop/test.cpp', 'cpp');
    // ce.compileCode().then(
    //     function(){
    //         return ce.executeCode(path.normalize('/Users/satvikramaprasad/Desktop/input.txt'),path.normalize('/Users/satvikramaprasad/Desktop/output.txt'));
    //     }
    // ).then(
    //     function(obj){
    //         console.log("stdout:\n" + obj.stdout);
    //     }
    // ).catch(
    //     function(obj){
    //         console.log("stderr:");
    //         console.log(obj);
    //     }
    // );



    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
  );




  }

};
