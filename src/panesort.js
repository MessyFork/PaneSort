"use babel";

import PaneSortView from "./PaneSort-view";
import { CompositeDisposable } from "atom";

const defaultLeftRegex = /\w.spec.\w/;
const defaultRightRegex = /\w\.\w/;

export default {
  PaneSortView: null,
  modalPanel: null,
  subscriptions: null,
  config: {
    leftRegex: {
      title: 'Left regex',
      description: 'Regex left pane will match to.',
      type: 'string',
      "default": '\\w.spec.\\w',
    },
    rightRegex: {
      title: 'Right regex',
      description: 'Regex right pane will match to.',
      type: 'string',
      "default": '\\w\\.\\w',
    }
  },

  activate(state) {
    this.PaneSortView = new PaneSortView(state.PaneSortViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.PaneSortView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "PaneSort:toggle": () => this.toggle()
      })
    );

    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "PaneSort:sort": () => this.sort()
      })
    );
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.PaneSortView.destroy();
  },

  serialize() {
    return {
      PaneSortViewState: this.PaneSortView.serialize()
    };
  },

  toggle() {
    return this.modalPanel.isVisible()
      ? this.modalPanel.hide()
      : this.modalPanel.show();
  },

  sort() {
    let leftRegex = new RegExp(atom.config.get('PaneSort.leftRegex'))
    let rightRegex = new RegExp(atom.config.get('PaneSort.leftRegex'))
    let panelList = atom.workspace.getPanes()
    let leftPane = panelList[0]
    console.log("panelList", panelList);

    let rightPane
    if(atom.workspace.getPanes().length < 5) {
      rightPane = leftPane.splitRight()
    } else {
      rightPane = panelList[1]
    }

    let openedEditors = atom.workspace.getTextEditors()
    for(let i = 0; i < openedEditors.length; i ++) {
      if(leftRegex.test(openedEditors[i].getTitle())){
        rightPane.moveItemToPane(openedEditors[i], leftPane)
      }else {
        leftPane.moveItemToPane(openedEditors[i], rightPane)
      }
    }


  }
};
