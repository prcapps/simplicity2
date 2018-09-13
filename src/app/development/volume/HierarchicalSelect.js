import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { nest } from 'd3-collection';
import { ResponsiveNetworkFrame } from 'semiotic';
import Tooltip from '../../../shared/visualization/Tooltip';

// given hierarchical data, make selecty categories
// use callback to set current data for parent element
// include circlepack
const select = function(inputNode, selected) {
  const node = Object.assign({}, inputNode);
  if (typeof selected ==='function') {
    node.selected = selected(node);
  } else {
    node.selected = selected;
  }
  if (node.values) {
    node.values = inputNode.values.map((child) => {
      return select(child, selected);
    })
  }
  return node;
}

const labelDepth = function(inputNode, depth) {
  const node = Object.assign({}, inputNode);
  node.depth = depth;
  const nodeHeritage = node.heritage || [];
  if (node.values) {
    node.values = inputNode.values.map((child) => {
      const thisChild = Object.assign({}, child);
      thisChild.heritage = nodeHeritage.concat([node.key])
      return labelDepth(thisChild, depth + 1);
    })
  }
  return node;
}

const getSemioticNodeHeritage = function(d) {
  const heritage = [d.key];
  let nextParent = d.parent;
  while (nextParent) {
    if (nextParent.key === 'All Permits') {
      nextParent = null;
    } else {
      heritage.push(nextParent.key);
      nextParent = nextParent.parent;
    }
  }
  return heritage.reverse();
}


class HierarchicalSelect extends Component {
  constructor(props) {
    super(props);

    const thisNest = nest();
    this.props.hierarchyOrder.forEach(level => thisNest.key(d => d[level]))
    thisNest.rollup(d => d.length)

    let thisEdges = {
      key: 'All Permits',
      values: thisNest.entries(this.props.data).map(v => {
        if (v.key === 'Services') {
          return select(v, false);
        }
        return select(v, true);
      })
    }
    thisEdges = labelDepth(thisEdges, 0)

    this.state = {
      activeDepth: 2,
      edges: thisEdges,
    };

    this.setActiveDepth = this.setActiveDepth.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  setActiveDepth(newDepth) {
    this.setState({
      activeDepth: newDepth,
    });
  }

  handleClick(d) {
    const clickedNode = d.data;

    const isNodeDeselected = (candidate) => {
      console.log(clickedNode.key, clickedNode.depth, candidate.heritage)
      const isNode = candidate.key === clickedNode.key && candidate.depth === clickedNode.depth;
      if (isNode || candidate.depth > clickedNode.depth && candidate.heritage.includes(clickedNode.key)) {
        return false;
      }
      return true;
    }

    const isNodeSelected = (activatedNode) => {
      // is input clickedNode a child of activated clickedNode?
      if (clickedNode.heritage.indexOf(activatedNode.key) === activatedNode.depth) {
        return true;
      }
      // is input node a parent/grandparent of activated node?
      // console.log(activatedNode.heritage)
      if (activatedNode.heritage.indexOf(clickedNode.key) === clickedNode.depth) {
        return true;
      }
      return false;
    }

    let newEdges = this.state.edges;
    if (clickedNode.selected) {
      newEdges = select(this.state.edges, isNodeDeselected)

    }
    else {
      newEdges = select(this.state.edges, isNodeSelected)
    }

    this.setState({
      edges: newEdges,
    })
  }


  render() {
    /*
    if there's nothing in defaultSelected for that level, then assume all


    whatever level is visualized should receive colors
    if there are too many selected in the active group, roll the rest into "other"
    still show them separately, just make them the same color
    inactive ones should be lighter
    add labels

    children are automatically active if parent is active
    children are automatically deactivated if parent is deactivated
    if a move will activate or deactivate other nodes, highlight those nodes
      as well on hover
    */

    const margin = {
      top: 5,
      right: 0,
      bottom: 5,
      left: 50,
    };

    return (
      <div className="interactiveAnnotation">
        <ResponsiveNetworkFrame
          size={[1000, 100]}
          margin={margin}
          responsiveWidth
          edges={this.state.edges}
          annotations={[
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
          ]}
          htmlAnnotationRules={(d) => {
            if (d.d.type !== 'custom') {
              return null;
            }
            const sameDepthNode = d.nodes.find(node => node.depth === d.d.depth);
            const buttonHeight = sameDepthNode.y1 - sameDepthNode.y0;
            return (<div className="input-group"
              key={d.d.key}
            >
              <div
                className='input-group-btn'
                style={{
                  cursor: 'pointer',
                  pointerEvents: 'all',
                  fontSize: '0.75em',
                  position: 'absolute',
                  top: `${sameDepthNode.y0}px`,
                  left: `-${margin.left}px`,
                  color: d.d.depth === this.state.activeDepth ? '#00a4f6' : 'inherit',
                }}
              >
                <button
                  type="button"
                  style={{
                    height: buttonHeight
                  }}
                  onClick={() => this.setActiveDepth(d.d.depth)}
                >
                  {d.d.key}
                </button>
                <button
                  type="button"
                  style={{
                    height: buttonHeight,
                  }}
                >
                  <span className="caret"></span>
                </button>
                <ul className="dropdown-menu dropdown-menu-right">
                  <li>foo</li>
                  <li>baz</li>
                </ul>
              </div>
            </div>)
          }}
          nodeStyle={(d, i) => {
            const atActiveDepth = d.depth === this.state.activeDepth ? 1 : 0;
            return {
              fill: atActiveDepth ? 'pink' : 'gray',
              stroke: 'white',
              fillOpacity: d.data.selected ? 1 : 0.5,
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
            const heritage = getSemioticNodeHeritage(d);
            const title = heritage.join(' > ');
            return (<Tooltip
              title={title}
              style={{ minWdith: title.length * 5 }}
            />)
          }}
          networkType={{
            type: 'partition',
            projection: 'vertical',
            hierarchyChildren: d => d.values,
            hierarchySum: d => d.value,
          }}
          customClickBehavior={d => this.handleClick(d)}
        />
      </div>
    );
  }
}

HierarchicalSelect.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  hierarchyOrder: PropTypes.arrayOf(PropTypes.string),
  onSelect: PropTypes.func,
  defaultSelected: PropTypes.object,
};

HierarchicalSelect.defaultProps = {
  data: [],
  hierarchyOrder: ['permit_group', 'permit_type', 'permit_subtype', 'permit_category'],
  defaultSelected: {
    permit_group: ['Permits', 'Planning'],
    key: 'root',
    selected: 'true',
    selectedChildren: [
      {
        key: 'Permits',
        depth: 1,
      },
      {
        key: 'Planning',
        depth: 1,
      }
    ],
  },
  onSelect: data => console.log(data),
};

export default HierarchicalSelect;
