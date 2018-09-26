import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { nest } from 'd3-collection';
import { ResponsiveNetworkFrame } from 'semiotic';
import Tooltip from '../../../shared/visualization/Tooltip';
import HierarchicalDropdown from './HierarchicalDropdown';
import HorizontalLegend from '../../../shared/visualization/HorizontalLegend';
import { colorScheme } from './granularUtils';


/*
TODO: move styling out of general maybe
*/
function getNodeRelationship(clickedNode, candidate) {
  // The parent value really just means ancestor
  if (candidate.depth === 0) {
    // If it's the root
    return 'ancestor';
  }
  const candidateHeritage = candidate.heritage.join();
  const clickedHeritage = clickedNode.heritage.join();

  if (candidate.key === clickedNode.key && candidateHeritage === clickedHeritage) {
    return 'self';
  } else if (candidate.depth > clickedNode.depth &&
    candidate.heritage.indexOf(clickedNode.key) === clickedNode.depth &&
    candidateHeritage.includes(clickedHeritage)
  ) {
    return 'child';
  } else if (clickedHeritage.includes(candidateHeritage) &&
    clickedNode.heritage.indexOf(candidate.key) === candidate.depth) {
    return 'ancestor';
  }
  return null;
}

function selectedActiveDepthNodes(inputNode, activeDepth) {
  const node = Object.assign({}, inputNode);
  if (node.depth === activeDepth) {
    if (activeDepth === 0) {
      return [node];
    }
    return node;
  }
  return [].concat(...node.values
    .filter(v => v.selected)
    .map(v => selectedActiveDepthNodes(v, activeDepth))
  );
}

function selectedDataFromHierarchy(node) {
  // Given a node, return only the selected raw values
  if (!node.values) {
    if (node.selected) {
      // If it is selected and at the lowest level, return its values
      return node.allUnnestedValues;
    }
    // Return empty array to be concatenated if it's not selected
    return [];
  }
  return [].concat(...node.values
    .filter(v => v.selected)
    .map(v => selectedDataFromHierarchy(v)));
}

function getNode(inputNode, hierarchyKeyPath) {
  // inputNode-- start with the root
  // hierarchyKeyPath-- start with the root like ['All Permits', 'Permits', 'Residential']
  // If inputNode.key matches hierarchyKeyPath[depth], this is in the path
  if (inputNode.key === hierarchyKeyPath[inputNode.depth]) {
    // If the above && inputNode.depth === hierarchyKeyPath.length - 1, this is the node!!!
    if (inputNode.depth === hierarchyKeyPath.length - 1) {
      return inputNode;
    }
    // Figure out which of the child values is in the hierarhcykeypath, if any
    const nextVictim = inputNode.values.find(val => val.key === hierarchyKeyPath[val.depth]);
    if (!nextVictim) { return null; }
    return getNode(nextVictim, hierarchyKeyPath);
  }
  // Else it's a dud and don't bother
  return null;
}

class HierarchicalSelect extends Component {
  constructor(props) {
    super(props);
    const thisEdges = this.customNestEntries({
      key: 'All Permits',
      values: this.props.data,
    });

    this.state = {
      activeDepth: this.props.activeDepth,
      edges: thisEdges,
      colorfulNodes: null, // This gets set by componentWillMount
    };

    this.setActiveDepth = this.setActiveDepth.bind(this);
    this.handleNodeClick = this.handleNodeClick.bind(this);
    this.htmlAnnotationButton = this.htmlAnnotationButton.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
  }

  customNestEntries(inputNode, depth = 0) {
    /*
     * Called only in constructor
     * Input node is starter root
    */
    const node = Object.assign({}, inputNode);
    const nodeHeritage = node.heritage || [];
    node.depth = depth;
    node.selected = true;

    if (depth < this.props.hierarchyOrder.length) {
      node.allUnnestedValues = node.values;
      const childrenNest = nest()
        .key(d => d[this.props.hierarchyOrder[depth]])
        .entries(node.allUnnestedValues);

      childrenNest.sort((a, b) => b.values.length - a.values.length);

      node.values = childrenNest.map((child) => {
        const thisChild = Object.assign({}, child);
        thisChild.heritage = nodeHeritage.concat([node.key]);
        return this.customNestEntries(thisChild, depth + 1);
      });
    } else {
      node.allUnnestedValues = node.values;
      node.value = node.values.length;
      node.values = undefined;
    }
    node.selectedActiveValues = node.allUnnestedValues;
    return node;
  }

  setActiveDepth(newDepth) {
    const selectedNodes = selectedActiveDepthNodes(this.state.edges, newDepth);
    const colorfulNodes = HierarchicalSelect.setNodeDisplayOpts(
      selectedNodes,
      this.props.colorScheme,
    );

    this.setState({
      activeDepth: newDepth,
      colorfulNodes,
    });

    this.props.onFilterSelect(
      this.state.edges.selectedActiveValues,
      colorfulNodes,
      this.props.hierarchyOrder[newDepth - 1],
    );
  }

  handleNodeClick(inputNode) {
    const clickedNode = Object.assign({}, inputNode);
    const newEdges = this.toggleHierarchy(clickedNode, this.state.edges);
    const selectedNodes = selectedActiveDepthNodes(newEdges, this.state.activeDepth);
    const colorfulNodes = HierarchicalSelect.setNodeDisplayOpts(
      selectedNodes,
      this.props.colorScheme,
    );

    this.setState({
      activeDepth: this.state.activeDepth,
      colorfulNodes,
      edges: newEdges,
    });

    this.props.onFilterSelect(
      newEdges.selectedActiveValues,
      colorfulNodes,
      this.props.hierarchyOrder[this.state.activeDepth - 1],
    );
  }

  toggleHierarchy(clickedNode, inputNode) {
    const node = Object.assign({}, inputNode);
    const relationship = getNodeRelationship(clickedNode, node);
    // Don't iterate if they have nothing to do with each other
    if (relationship) {
      if (clickedNode.selected) {
        // If clicked node was already selected, deselect itself and its children
        if (relationship === 'self' || relationship === 'child') {
          node.selected = false;
        } else if (relationship === 'ancestor') {
          // If input node is parent of clicked and the only selected child got deselected
          // If clicked was only child at that depth, deselect
          const childrenAtDepth = this.activeDescendentsAtDepth(inputNode, clickedNode.depth);
          if (childrenAtDepth.length === 1) {
            const relationshipWithClicked = getNodeRelationship(clickedNode, childrenAtDepth[0]);
            // Deselect if self or if parent
            node.selected = !(relationshipWithClicked === 'self');
          }
        }
      } else if (!clickedNode.selected) {
        // If clicked node is being selected, select itself and its children and parent
        node.selected = true;
      }
      if (node.values) {
        node.values = inputNode.values.map(child =>
          this.toggleHierarchy(clickedNode, child));
      }
    }
    node.selectedActiveValues = selectedDataFromHierarchy(node, this.state.activeDepth);
    return node;
  }

  activeDescendentsAtDepth(node, depth) {
    if (node.depth === depth && node.selected) {
      return [node];
    }
    return [].concat(...node.values
      .filter(v => v.selected)
      .map(v => this.activeDescendentsAtDepth(v, depth)));
  }

  getNodeColor(d) {
    // TODO: also use this in hierarchicalDropdown
    let color = '#a6a6a6';
    if (d.depth === this.state.activeDepth && d.selected) {
      const colorfulNode = this.state.colorfulNodes.find(candidate => candidate.key === d.key
        && candidate.heritage.join() === d.heritage.join());
      if (colorfulNode) {
        // For some reason there is still a colorful node for an unselected node
        // But only if its child was unselected first???
        // Maybe some react rendering order nonsense
        color = colorfulNode.color;
      }
    }
    return color;
  }

  static setNodeDisplayOpts(nodesToDisplay, colors, maxNodes = 6) {
    // Needs output from selectedActiveDepthNodes
    return nodesToDisplay
      .sort((a, b) => b.selectedActiveValues.length - a.selectedActiveValues.length)
      .map((d, i) => {
        const rVal = Object.assign({}, d);
        let colorIndex = i;
        if (i > maxNodes - 1) {
          colorIndex = maxNodes;
          rVal.othered = true;
        }
        rVal.color = colors[colorIndex];
        return rVal;
      });
  }

  componentWillMount() {
    // Filter out services by default
    const servicesNode = getNode(this.state.edges, ['All Permits', 'Services']);
    this.handleNodeClick(servicesNode);
  }

  htmlAnnotationButton(d, leftMargin) {
    if (d.d.type !== 'custom') {
      return null;
    }
    const sameDepthNode = d.nodes.find(node => node.depth === d.d.depth);
    const buttonHeight = sameDepthNode.y1 - sameDepthNode.y0 - 2;
    return (<div
      className="input-group"
      key={d.d.key}
    >
      <div
        className="input-group-btn"
        style={{
          cursor: 'pointer',
          pointerEvents: 'all',
          fontSize: '0.75em',
          position: 'absolute',
          top: `${sameDepthNode.y0}px`,
          left: `-${leftMargin}px`,
          color: d.d.depth === this.state.activeDepth ? '#00a4f6' : 'inherit',
        }}
      >
        <button
          type="button"
          style={{
            height: buttonHeight,
            borderRadius: 6,
          }}
          onClick={() => this.setActiveDepth(d.d.depth)}
        >
          {d.d.key}
        </button>
      </div>
    </div>);
  }

  handleDoubleClick(node) {
    console.log(node)
    // this.setState({
    //   edges: node,
    // })
  }

  render() {
    const margin = {
      top: 5,
      right: 0,
      bottom: 5,
      left: 50,
    };
    const annotations = [
      {
        depth: 1,
        key: 'Module',
        type: 'custom',
      },
      {
        depth: 2,
        key: 'Type',
        type: 'custom',
      },
      {
        depth: 3,
        key: 'Subtype',
        type: 'custom',
      },
      {
        depth: 4,
        key: 'Category',
        type: 'custom',
      },
    ]
    const legendLabelItems = this.state.colorfulNodes
      .filter((d, i, array) => !d.othered || array.findIndex(datum => datum.othered) === i)
      .map((entry) => {
        const heritage = entry.heritage.slice(1);
        heritage.push(entry.key);
        const title = heritage.join(' > ');
        return {
          label: entry.othered ? 'Other' : title,
          color: entry.color,
        };
      });

    return (
      <div className="interactiveAnnotation">
        <HierarchicalDropdown
          hierarchy={this.state.edges}
          activeSelectedNodes={this.state.colorfulNodes}
          onNodeClick={node => this.handleNodeClick(node)}
        />
        <ResponsiveNetworkFrame
          size={[1000, 125]}
          margin={margin}
          responsiveWidth
          edges={this.state.edges}
          annotations={annotations}
          htmlAnnotationRules={d => this.htmlAnnotationButton(d, margin.left)}
          nodeStyle={(d) => {
            const color = this.getNodeColor(d);
            return {
              fill: color,
              stroke: 'white',
              fillOpacity: d.selected ? 1 : 0.5,
            };
          }}
          filterRenderedNodes={(d) => {
            if (d.key === 'All Permits') {
              return false;
            }
            return true;
          }}
          nodeIDAccessor="key"
          hoverAnnotation
          tooltipContent={(d) => {
            const heritage = d.heritage.slice(1);
            heritage.push(d.key);
            const title = heritage.join(' > ');
            // TODO: darker gray for get node color-- optionally pass in default
            return (<Tooltip
              style={{
                minWdith: title.length * 5,
                color: this.getNodeColor(d),
              }}
              textLines={[
                { text: title },
                { text: `${d.selectedActiveValues.length} of ${d.value} selected` },
              ]}
            />);
          }}
          networkType={{
            type: 'partition',
            projection: 'vertical',
            hierarchyChildren: d => d.values,
            hierarchySum: d => d.value,
          }}
          customClickBehavior={d => this.handleNodeClick(d.data)}
          customDoubleClickBehavior={d => this.handleDoubleClick(d)}
        />
        <HorizontalLegend
          style={{
            textAlign: 'center',
          }}
          labelItems={legendLabelItems}
        />
      </div>
    );
  }
}

HierarchicalSelect.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  hierarchyOrder: PropTypes.arrayOf(PropTypes.string),
  activeDepth: PropTypes.number,
  defaultSelected: PropTypes.arrayOf(PropTypes.object),
  onFilterSelect: PropTypes.func,
  colorScheme: PropTypes.arrayOf(PropTypes.string),
};

HierarchicalSelect.defaultProps = {
  data: [],
  hierarchyOrder: [
    'permit_group',
    'permit_type',
    'permit_subtype',
    'permit_category',
  ],
  activeDepth: 2,
  defaultSelected: [
    {
      level: 'permit_group',
      keys: [
        'Permits',
        'Planning',
      ],
    },
  ],
  onFilterSelect: (selectedData, selectedNodes, selectedHierarchyLevel) => {
    console.log(selectedData, selectedNodes, selectedHierarchyLevel);
  },
  colorScheme: colorScheme,
};

export default HierarchicalSelect;
