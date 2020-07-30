/*
*  Copyright (C) 1998-2020 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import * as React from 'react';

import './Diagram.css';
import { createElement } from 'react';

interface DiagramProps {
  nodeDataArray: Array<go.ObjectData>;
  skipsDiagramUpdate: boolean;
  onDiagramEvent: (e: go.DiagramEvent) => void;
  onModelChange: (e: go.IncrementalData) => void;
}

export class DiagramWrapper extends React.Component<DiagramProps, {}> {
  /**
   * Ref to keep a reference to the Diagram component, which provides access to the GoJS diagram via getDiagram().
   */
  private diagramRef: React.RefObject<ReactDiagram>;

  /** @internal */
  constructor(props: DiagramProps) {
    super(props);
    this.diagramRef = React.createRef();
  }

  /**
   * Get the diagram reference and add any desired diagram listeners.
   * Typically the same function will be used for each listener, with the function using a switch statement to handle the events.
   */
  public componentDidMount() {
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (diagram instanceof go.Diagram) {
      diagram.addDiagramListener('ChangedSelection', this.props.onDiagramEvent);
    }
  }

  /**
   * Get the diagram reference and remove listeners that were added during mounting.
   */
  public componentWillUnmount() {
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (diagram instanceof go.Diagram) {
      diagram.removeDiagramListener('ChangedSelection', this.props.onDiagramEvent);
    }
  }

  /**
   * Diagram initialization method, which is passed to the ReactDiagram component.
   * This method is responsible for making the diagram and initializing the model, any templates,
   * and maybe doing other initialization tasks like customizing tools.
   * The model's data should not be set here, as the ReactDiagram component handles that.
   */
  private initDiagram(): go.Diagram {
    var $ = go.GraphObject.make;  // for conciseness in defining templates

    // some constants that will be reused within templates
    var mt8 = new go.Margin(8, 0, 0, 0);
    var mr8 = new go.Margin(0, 8, 0, 0);
    var ml8 = new go.Margin(0, 0, 0, 8);
    var roundedRectangleParams = {
      parameter1: 2,  // set the rounded corner
      spot1: go.Spot.TopLeft, spot2: go.Spot.BottomRight  // make content go all the way to inside edges of rounded corners
    };

    const myDiagram =
      $(go.Diagram,
        {
          // Put the diagram contents at the top center of the viewport
          initialDocumentSpot: go.Spot.TopCenter,
          initialViewportSpot: go.Spot.TopCenter,
          // OR: Scroll to show a particular node, once the layout has determined where that node is
          // "InitialLayoutCompleted": function(e) {
          //  var node = e.diagram.findNodeForKey(28);
          //  if (node !== null) e.diagram.commandHandler.scrollToPart(node);
          // },
          layout:
            $(go.TreeLayout,  // use a TreeLayout to position all of the nodes
              {
                isOngoing: false,  // don't relayout when expanding/collapsing panels
                treeStyle: go.TreeLayout.StyleLastParents,
                // properties for most of the tree:
                angle: 90,
                layerSpacing: 80,
                // properties for the "last parents":
                alternateAngle: 0,
                alternateAlignment: go.TreeLayout.AlignmentStart,
                alternateNodeIndent: 15,
                alternateNodeIndentPastParent: 1,
                alternateNodeSpacing: 15,
                alternateLayerSpacing: 40,
                alternateLayerSpacingParentOverlap: 1,
                alternatePortSpot: new go.Spot(0.001, 1, 20, 0),
                alternateChildPortSpot: go.Spot.Left
              })
        });

    // This function provides a common style for most of the TextBlocks.
    // Some of these values may be overridden in a particular TextBlock.
    function textStyle(field: string) {
      return [
        {
          font: "12px Roboto, sans-serif", stroke: "rgba(0, 0, 0, .60)",
          visible: false  // only show textblocks when there is corresponding data for them
        },
        new go.Binding("visible", field, function(val) { return val !== undefined; })
      ];
    }

    // define Converters to be used for Bindings
    function theNationFlagConverter(nation: string) {
      return "https://www.nwoods.com/images/emojiflags/" + nation + ".png";
    }

    // define the Node template
    myDiagram.nodeTemplate =
      $(go.Node, "Auto",
        {
          locationSpot: go.Spot.TopCenter,
          isShadowed: true, shadowBlur: 1,
          shadowOffset: new go.Point(0, 1),
          shadowColor: "rgba(0, 0, 0, .14)",
          selectionAdornmentTemplate:  // selection adornment to match shape of nodes
            $(go.Adornment, "Auto",
              $(go.Shape, "RoundedRectangle", roundedRectangleParams,
                { fill: null, stroke: "#7986cb", strokeWidth: 3 }
              ),
              $(go.Placeholder)
            )  // end Adornment
        },
        $(go.Shape, "RoundedRectangle", roundedRectangleParams,
          { name: "SHAPE", fill: "#ffffff", strokeWidth: 0 },
          // bluish if highlighted, white otherwise
          new go.Binding("fill", "isHighlighted", function(h) { return h ? "#e8eaf6" : "#ffffff"; }).ofObject()
        ),
        $(go.Panel, "Vertical",
          $(go.Panel, "Horizontal",
            { margin: 8 },
            $(go.Picture,  // flag image, only visible if a nation is specified
              { margin: mr8, visible: false, desiredSize: new go.Size(50, 50) },
              new go.Binding("source", "nation", theNationFlagConverter),
              new go.Binding("visible", "nation", function(nat) { return nat !== undefined; }),
            ),
            $(go.Panel, "Table",
              $(go.TextBlock,
                {
                  row: 0, alignment: go.Spot.Left,
                  font: "16px Roboto, sans-serif",
                  stroke: "rgba(0, 0, 0, .87)",
                  maxSize: new go.Size(160, NaN)
                },
                new go.Binding("text", "name")
              ),
              $(go.TextBlock, textStyle("title"),
                {
                  row: 1, alignment: go.Spot.Left,
                  maxSize: new go.Size(160, NaN)
                },
                new go.Binding("text", "title")
              ),
              $("PanelExpanderButton", "INFO",
                { row: 0, column: 1, rowSpan: 2, margin: ml8 }
              )
            ),
          ),
          $(go.Shape, "LineH",
            {
              stroke: "rgba(0, 0, 0, .60)", strokeWidth: 1,
              height: 1, stretch: go.GraphObject.Horizontal
            },
            new go.Binding("visible").ofObject("INFO")  // only visible when info is expanded
          ),
          $(go.Panel, "Vertical",
            {
              name: "INFO",  // identify to the PanelExpanderButton
              stretch: go.GraphObject.Horizontal,  // take up whole available width
              margin: 8,
              defaultAlignment: go.Spot.Left,  // thus no need to specify alignment on each element
            },
            $(go.TextBlock, textStyle("headOf"),
              new go.Binding("text", "headOf", function(head) { return "Head of: " + head; })
            ),
            $(go.TextBlock, textStyle("boss"),
              new go.Binding("margin", "headOf", function(_head) { return mt8; }), // some space above if there is also a headOf value
              new go.Binding("text", "boss", function(id: number) {
                var boss = myDiagram.model.findNodeDataForKey(id);
                if (boss !== null) {
                  return "Reporting to: " + boss.name;
                }
                return "";
              })
            )
          )
        )
      );

    // define the Link template, a simple orthogonal line
    myDiagram.linkTemplate =
      $(go.Link, go.Link.Orthogonal,
        { corner: 5, selectable: false },
        $(go.Shape, { strokeWidth: 3, stroke: "#424242" }));  // dark gray, rounded corner links

    // create the Model with data for the tree, and assign to the Diagram
    myDiagram.model =
      $(go.TreeModel,
        {
          nodeParentKeyProperty: "boss"  // this property refers to the parent node data
        });
 
    return myDiagram;
  }

  public render() {
    return (
      <ReactDiagram
        ref={this.diagramRef}
        divClassName='diagram-component'
        initDiagram={this.initDiagram}
        nodeDataArray={this.props.nodeDataArray}
        onModelChange={this.props.onModelChange}
        skipsDiagramUpdate={this.props.skipsDiagramUpdate}
      />
    );
  }
}

