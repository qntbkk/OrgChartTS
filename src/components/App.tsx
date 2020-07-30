/*
*  Copyright (C) 1998-2020 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as go from 'gojs';
import { produce } from 'immer';
import * as React from 'react';

import { DiagramWrapper } from './Diagram';
import { SelectionInspector } from './SelectionInspector';

import '../ui/OrgAssistantChartTS.css';
import { createElement } from 'react';

/**
 * No linkDataArray since we'll be using a TreeModel.
 * Don't need modelData if there won't be any shared state in the model.
 */
interface AppState {
  nodeDataArray: Array<go.ObjectData>;
  selectedData: go.ObjectData | null;
  skipsDiagramUpdate: boolean;
}

class App extends React.Component<{}, AppState> {
  // Maps to store key -> arr index for quick lookups
  private mapNodeKeyIdx: Map<go.Key, number>;

  constructor(props: object) {
    super(props);
    this.state = {
      nodeDataArray: [
      { key: 0, name: "Ban Ki-moon 반기문", nation: "SouthKorea", title: "Secretary-General of the United Nations", headOf: "Secretariat" },
      { key: 1, boss: 0, name: "Patricia O'Brien", nation: "Ireland", title: "Under-Secretary-General for Legal Affairs and United Nations Legal Counsel", headOf: "Office of Legal Affairs" },
      { key: 3, boss: 1, name: "Peter Taksøe-Jensen", nation: "Denmark", title: "Assistant Secretary-General for Legal Affairs" },
      { key: 9, boss: 3, name: "Other Employees" },
      { key: 4, boss: 1, name: "Maria R. Vicien - Milburn", nation: "Argentina", title: "General Legal Division Director", headOf: "General Legal Division" },
      { key: 10, boss: 4, name: "Other Employees" },
      { key: 5, boss: 1, name: "Václav Mikulka", nation: "CzechRepublic", title: "Codification Division Director", headOf: "Codification Division" },
      { key: 11, boss: 5, name: "Other Employees" },
      { key: 6, boss: 1, name: "Sergei Tarassenko", nation: "Russia", title: "Division for Ocean Affairs and the Law of the Sea Director", headOf: "Division for Ocean Affairs and the Law of the Sea" },
      { key: 12, boss: 6, name: "Alexandre Tagore Medeiros de Albuquerque", nation: "Brazil", title: "Chairman of the Commission on the Limits of the Continental Shelf", headOf: "The Commission on the Limits of the Continental Shelf" },
      { key: 17, boss: 12, name: "Peter F. Croker", nation: "Ireland", title: "Chairman of the Committee on Confidentiality", headOf: "The Committee on Confidentiality" },
      { key: 31, boss: 17, name: "Michael Anselme Marc Rosette", nation: "Seychelles", title: "Vice Chairman of the Committee on Confidentiality" },
      { key: 32, boss: 17, name: "Kensaku Tamaki", nation: "Japan", title: "Vice Chairman of the Committee on Confidentiality" },
      { key: 33, boss: 17, name: "Osvaldo Pedro Astiz", nation: "Argentina", title: "Member of the Committee on Confidentiality" },
      { key: 34, boss: 17, name: "Yuri Borisovitch Kazmin", nation: "Russia", title: "Member of the Committee on Confidentiality" },
      { key: 18, boss: 12, name: "Philip Alexander Symonds", nation: "Australia", title: "Chairman of the Committee on provision of scientific and technical advice to coastal States", headOf: "Committee on provision of scientific and technical advice to coastal States" },
      { key: 35, boss: 18, name: "Emmanuel Kalngui", nation: "Cameroon", title: "Vice Chairman of the Committee on provision of scientific and technical advice to coastal States" },
      { key: 36, boss: 18, name: "Sivaramakrishnan Rajan", nation: "India", title: "Vice Chairman of the Committee on provision of scientific and technical advice to coastal States" },
      { key: 37, boss: 18, name: "Francis L. Charles", nation: "TrinidadAndTobago", title: "Member of the Committee on provision of scientific and technical advice to costal States" },
      { key: 38, boss: 18, name: "Mihai Silviu German", nation: "Romania", title: "Member of the Committee on provision of scientific and technical advice to costal States" },
      { key: 19, boss: 12, name: "Lawrence Folajimi Awosika", nation: "Nigeria", title: "Vice Chairman of the Commission on the Limits of the Continental Shelf" },
      { key: 20, boss: 12, name: "Harald Brekke", nation: "Norway", title: "Vice Chairman of the Commission on the Limits of the Continental Shelf" },
      { key: 21, boss: 12, name: "Yong-Ahn Park", nation: "SouthKorea", title: "Vice Chairman of the Commission on the Limits of the Continental Shelf" },
      { key: 22, boss: 12, name: "Abu Bakar Jaafar", nation: "Malaysia", title: "Chairman of the Editorial Committee", headOf: "Editorial Committee" },
      { key: 23, boss: 12, name: "Galo Carrera Hurtado", nation: "Mexico", title: "Chairman of the Training Committee", headOf: "Training Committee" },
      { key: 24, boss: 12, name: "Indurlall Fagoonee", nation: "Mauritius", title: "Member of the Commission on the Limits of the Continental Shelf" },
      { key: 25, boss: 12, name: "George Jaoshvili", nation: "Georgia", title: "Member of the Commission on the Limits of the Continental Shelf" },
      { key: 26, boss: 12, name: "Wenzhang Lu", nation: "China", title: "Member of the Commission on the Limits of the Continental Shelf" },
      { key: 27, boss: 12, name: "Isaac Owusu Orudo", nation: "Ghana", title: "Member of the Commission on the Limits of the Continental Shelf" },
      { key: 28, boss: 12, name: "Fernando Manuel Maia Pimentel", nation: "Portugal", title: "Member of the Commission on the Limits of the Continental Shelf" },
      { key: 7, boss: 1, name: "Renaud Sorieul", nation: "France", title: "International Trade Law Division Director", headOf: "International Trade Law Division" },
      { key: 13, boss: 7, name: "Other Employees" },
      { key: 8, boss: 1, name: "Annebeth Rosenboom", nation: "Netherlands", title: "Treaty Section Chief", headOf: "Treaty Section" },
      { key: 14, boss: 8, name: "Bradford Smith", nation: "UnitedStates", title: "Substantive Legal Issues Head", headOf: "Substantive Legal Issues" },
      { key: 29, boss: 14, name: "Other Employees" },
      { key: 15, boss: 8, name: "Andrei Kolomoets", nation: "Russia", title: "Technical/Legal Issues Head", headOf: "Technical/Legal Issues" },
      { key: 30, boss: 15, name: "Other Employees" },
      { key: 16, boss: 8, name: "Other Employees" },
      { key: 2, boss: 0, name: "Heads of Other Offices/Departments" }
      ],
      selectedData: null,
      skipsDiagramUpdate: false
    };
    // init maps
    this.mapNodeKeyIdx = new Map<go.Key, number>();
    this.refreshNodeIndex(this.state.nodeDataArray);
    // bind handler methods
    this.handleDiagramEvent = this.handleDiagramEvent.bind(this);
    this.handleModelChange = this.handleModelChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  /**
   * Update map of node keys to their index in the array.
   */
  private refreshNodeIndex(nodeArr: Array<go.ObjectData>) {
    this.mapNodeKeyIdx.clear();
    nodeArr.forEach((n: go.ObjectData, idx: number) => {
      this.mapNodeKeyIdx.set(n.key, idx);
    });
  }

  /**
   * Handle any relevant DiagramEvents, in this case just selection changes.
   * On ChangedSelection, find the corresponding data and set the selectedData state.
   * @param e a GoJS DiagramEvent
   */
  public handleDiagramEvent(e: go.DiagramEvent) {
    const name = e.name;
    switch (name) {
      case 'ChangedSelection': {
        const sel = e.subject.first();
        this.setState(
          produce((draft: AppState) => {
            if (sel) {
              if (sel instanceof go.Node) {
                const idx = this.mapNodeKeyIdx.get(sel.key);
                if (idx !== undefined && idx >= 0) {
                  const nd = draft.nodeDataArray[idx];
                  draft.selectedData = nd;
                }
              }
            } else {
              draft.selectedData = null;
            }
          })
        );
        break;
      }
      default: break;
    }
  }

  /**
   * Handle GoJS model changes, which output an object of data changes via Model.toIncrementalData.
   * This method iterates over those changes and updates state to keep in sync with the GoJS model.
   * @param obj a JSON-formatted string
   */
  public handleModelChange(obj: go.IncrementalData) {
    const insertedNodeKeys = obj.insertedNodeKeys;
    const modifiedNodeData = obj.modifiedNodeData;
    const removedNodeKeys = obj.removedNodeKeys;

    // maintain maps of modified data so insertions don't need slow lookups
    const modifiedNodeMap = new Map<go.Key, go.ObjectData>();
    this.setState(
      produce((draft: AppState) => {
        let narr = draft.nodeDataArray;
        if (modifiedNodeData) {
          modifiedNodeData.forEach((nd: go.ObjectData) => {
            modifiedNodeMap.set(nd.key, nd);
            const idx = this.mapNodeKeyIdx.get(nd.key);
            if (idx !== undefined && idx >= 0) {
              narr[idx] = nd;
              if (draft.selectedData && draft.selectedData.key === nd.key) {
                draft.selectedData = nd;
              }
            }
          });
        }
        if (insertedNodeKeys) {
          insertedNodeKeys.forEach((key: go.Key) => {
            const nd = modifiedNodeMap.get(key);
            const idx = this.mapNodeKeyIdx.get(key);
            if (nd && idx === undefined) {
              this.mapNodeKeyIdx.set(nd.key, narr.length);
              narr.push(nd);
            }
          });
        }
        if (removedNodeKeys) {
          narr = narr.filter((nd: go.ObjectData) => {
            if (removedNodeKeys.includes(nd.key)) {
              return false;
            }
            return true;
          });
          draft.nodeDataArray = narr;
          this.refreshNodeIndex(narr);
        }

        draft.skipsDiagramUpdate = true;  // the GoJS model already knows about these updates
      })
    );
  }

  /**
   * Handle inspector changes, and on input field blurs, update node/link data state.
   * @param path the path to the property being modified
   * @param value the new value of that property
   * @param isBlur whether the input event was a blur, indicating the edit is complete
   */
  public handleInputChange(path: string, value: string, isBlur: boolean) {
    this.setState(
      produce((draft: AppState) => {
        const data = draft.selectedData as go.ObjectData;  // only reached if selectedData isn't null
        data[path] = value;
        if (isBlur) {
          const key = data.key;
          const idx = this.mapNodeKeyIdx.get(key);
          if (idx !== undefined && idx >= 0) {
            draft.nodeDataArray[idx] = data;
            draft.skipsDiagramUpdate = false;
          }
        }
      })
    );
  }

  /**
   * Handle changes to the checkbox on whether to allow relinking.
   * @param e a change event from the checkbox
   */
  public render() {
    const selectedData = this.state.selectedData;
    let inspector;
    if (selectedData !== null) {
      inspector = <SelectionInspector
                    selectedData={this.state.selectedData}
                    onInputChange={this.handleInputChange}
                  />;
    }

    return (
      <div>
        <DiagramWrapper
          nodeDataArray={this.state.nodeDataArray}
          skipsDiagramUpdate={this.state.skipsDiagramUpdate}
          onDiagramEvent={this.handleDiagramEvent}
          onModelChange={this.handleModelChange}
        />
        {inspector}
      </div>
    );
  }
}

export default App;

