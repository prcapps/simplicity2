import React from 'react';
import PropTypes from 'prop-types';
import dagre from 'dagre';
import { curveBundle } from 'd3-shape';
import { ResponsiveNetworkFrame } from 'semiotic';
import { Annotation, ConnectorCurve, Note } from 'react-annotation';
import AnchorNav from './AnchorNav';
import { colorScheme } from '../volume/granularUtils';

const g = new dagre.graphlib.Graph()
g.setGraph({ rankdir:  'TB', ranker: 'network-simplex'})
g.setDefaultEdgeLabel(() => ({}))

const orderedColors = ['#FF3A3A','#749B5F','#2d93ad','#004EA3','#9B6681','#9E4F55','#073d49']
const nodeSize = 8;

const nodes = [
  {
    id: 'Pre-Application Meeting',
    description: 'Required for reasons.',
  },
  {
    id: 'Neighborhood Meeting',
    description: 'The developer must arrange a neighborhood meeting and invite property owners within 200 feet of the proposed development. The meeting must be no more than four months but at least ten days before application submission. At least ten days prior to the meeting, property must be posted and notice of the meeting mailed.'
  },
  {
    id: 'Level I',
    description: 'Projects smaller than 35,000 square feet or with fewer than 20 residential units.',
  },
  {
    id: 'Major Subdivision',
    description: 'Foo',
  },
  {
    id: 'Level II',
    description: 'Foo',
  },
  {
    id: 'Level III',
    description: 'Foo',
  },
  {
    id: 'Conditional Zoning',
    description: 'Foo',
  },
  {
    id: 'Conditional Use Permit',
    description: 'Foo',
  },
  {
    id: 'Staff Review',
    description: 'Foo',
  },
  {
    id: 'Level I Decision',
    description: 'Foo',
  },
  {
    id: 'Technical Review Committee',
    description: 'An eight-member body that ensures that the proposed project complies with standards and requirements. Consists of six staff, a representative of the Tree Commission, and a member representing the Buncombe County Metropolitan Sewer District (MSD).',
  },
  {
    id: 'Major Subdivision Decision',
    description: 'For major subdivisions that are not in a special zoning area like downtown, the Technical Review Committee either accepts or rejects the proposal.'
  },
  {
    id: 'Design Review',
    description: 'All level II, downtown subdivisions, and special zoning district L3 etc go to desgin review. The decision made in this step is a a non-binding recommendation.'
  },
  {
    id: 'Planning and Zoning Commission',
    description: 'The Commission consists of 7 members, 5 City residents appointed by City Council and 2 residents of the extra-territorial area of the City and appointed by Buncombe County Commissioners. The length of term of office is three years.',
  },
  {
    id: 'Level II and Downtown Major Subdivision Decision',
    description: 'Foo',
  },
  {
    id: 'City Council',
    description: 'Foo',
  },
  {
    id: 'City Council Decision',
    description: 'Foo',
  },
]

const links = [
  {
    source: 'Pre-Application Meeting',
    target: 'Level I',
    color: orderedColors[0],
  },
  {
    source: 'Neighborhood Meeting',
    target: 'Level I',
    color: orderedColors[0],
  },
  {
    source: 'Pre-Application Meeting',
    target: 'Major Subdivision',
    color: orderedColors[1],
  },
  {
    source: 'Neighborhood Meeting',
    target: 'Major Subdivision',
    color: orderedColors[1],
  },
  {
    source: 'Pre-Application Meeting',
    target: 'Level II',
    color: orderedColors[2],
  },
  {
    source: 'Neighborhood Meeting',
    target: 'Level II',
    color: orderedColors[2],
  },
  {
    source: 'Pre-Application Meeting',
    target: 'Level III',
    color: orderedColors[3],
  },
  {
    source: 'Neighborhood Meeting',
    target: 'Level III',
    color: orderedColors[3],
  },
  {
    source: 'Pre-Application Meeting',
    target: 'Conditional Zoning',
    color: orderedColors[4],
  },
  {
    source: 'Neighborhood Meeting',
    target: 'Conditional Zoning',
    color: orderedColors[4],
  },
  {
    source: 'Pre-Application Meeting',
    target: 'Conditional Use Permit',
    color: orderedColors[5],
  },
  {
    source: 'Neighborhood Meeting',
    target: 'Conditional Use Permit',
    color: orderedColors[5],
  },
  {
    source: 'Level I',
    target: 'Staff Review',
    color: orderedColors[0],
  },
  {
    source: 'Major Subdivision',
    target: 'Staff Review',
    color: orderedColors[1],
  },
  {
    source: 'Level II',
    target: 'Staff Review',
    color: orderedColors[2],
  },
  {
    source: 'Level III',
    target: 'Staff Review',
    color: orderedColors[3],
  },
  {
    source: 'Conditional Zoning',
    target: 'Staff Review',
    color: orderedColors[4],
  },
  {
    source: 'Conditional Use Permit',
    target: 'Staff Review',
    color: orderedColors[5],
  },
  {
    source: 'Staff Review',
    target: 'Level I Decision',
    color: orderedColors[0],
  },
  {
    source: 'Staff Review',
    target: 'Technical Review Committee',
    parallelEdges: [
      { color: orderedColors[1], weight: 3 },
      { color: orderedColors[2], weight: 3 },
      { color: orderedColors[3], weight: 3 },
      { color: orderedColors[4], weight: 3 },
      { color: orderedColors[5], weight: 3 },
    ]
  },
  {
    source: 'Technical Review Committee',
    target: 'Major Subdivision Decision',
    color: orderedColors[1],
  },
  {
    source: 'Technical Review Committee',
    target: 'Design Review',
    // All level II, downtown subdivisions, and special district L3 etc go to desgin review?
    parallelEdges: [
      { color: 'gray', weight: 3 },
      { color: orderedColors[2], weight: 3 },
    ]
  },
  {
    source: 'Design Review',
    target: 'Planning and Zoning Commission',
    parallelEdges: [
      { color: 'gray', weight: 3 },
      { color: orderedColors[2], weight: 3 },
    ]
  },
  {
    source: 'Technical Review Committee',
    target: 'Planning and Zoning Commission',
    parallelEdges: [
      { color: orderedColors[3], weight: 3 },
      { color: orderedColors[4], weight: 3 },
      { color: orderedColors[5], weight: 3 },
    ]
  },
  {
    source: 'Planning and Zoning Commission',
    target: 'Level II and Downtown Major Subdivision Decision',
    parallelEdges: [
      { color: 'gray', weight: 3 },
      { color: orderedColors[2], weight: 3 },
    ]
  },
  {
    source: 'Planning and Zoning Commission',
    target: 'City Council',
    parallelEdges: [
      { color: orderedColors[3], weight: 3 },
      { color: orderedColors[4], weight: 3 },
      { color: orderedColors[5], weight: 3 },
    ]
  },
  {
    source: 'City Council',
    target: 'City Council Decision',
    parallelEdges: [
      { color: orderedColors[3], weight: 3 },
      { color: orderedColors[4], weight: 3 },
      { color: orderedColors[5], weight: 3 },
    ]
  },
]

nodes.forEach(node => {
  g.setNode(
    node.id,
    {
      label: node.id,
      width: node.width || nodeSize,
      height: node.height || nodeSize,
      description: node.description,
      color: node.color ? node.color : 'gray',
    }
  );
})

function calculateEdges(link) {
  const weight = 1.5;
  if (link.parallelEdges) {
    return link.parallelEdges.map(e => {
      const thisEdge = Object.assign({}, e);
      thisEdge.weight = weight;
      return thisEdge;
    })
  }
  return [{ color: link.color ? link.color : 'gray', weight: weight}];
}

links.forEach(link => {
  g.setEdge(
    link.source,
    link.target,
    {
      parallelEdges: calculateEdges(link),
    }
  );
})

dagre.layout(g)

const nodeValues = Object.values(g._nodes);
nodeValues.forEach(d => {
  d.coincidents = nodeValues.filter(val => val.y === d.y)
  d.indexInCoincidents = d.coincidents.findIndex(c => c.label === d.label)
})
const annotations = nodeValues.map(d => {
  const rVal = {
    id: d.label,
    coincidents: d.coincidents,
    indexInCoincidents: d.indexInCoincidents,
    description: d.description,
    color: 'black',
    connector: { end: 'none' },
    disable: 'subject',
    type: 'node',
  };
  return rVal;
})

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

class MajorDevelopmentDashboard extends React.Component {
  constructor(){
    super();

    const anchorNavLinks = [
      {
        linkId: 'about',
        linkName: 'About',
        selected: true,
      },
      {
        linkId: 'notifications',
        linkName: 'Get Notifications',
      },
      {
        linkId: 'data',
        linkName: 'Current Projects'
      },
      {
        linkId: 'calendar',
        linkName: 'Public Events'
      },
      {
        linkId: 'faq',
        linkName: 'Frequently Asked Questions',
      },
    ].map((d, i) => {
      const rObj = Object.assign({}, d);
      rObj.color = colorScheme[i];
      rObj.ref = React.createRef();
      return rObj;
    })

    this.state = {
      anchorNavLinks,
    }

    this.handleScroll = debounce(this.handleScroll.bind(this), 250)
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll(event) {
    const changePoint = document.documentElement.clientHeight * 0.75;
    let closestDistanceToChange = null;
    let closestNavLinkId = null;

    this.state.anchorNavLinks.forEach(navLink => {
      const thisRef = navLink.ref.current.getBoundingClientRect();

      if (thisRef.top < changePoint && (!closestDistanceToChange || thisRef.top > closestDistanceToChange)) {
        // If the top of this ref is above the bottom of the screen
        // AND
        // If there isn't already a closest distance assigned
        // OR
        // If it's above below the current closest ref, make it the selected one
        closestNavLinkId = navLink.linkId;
        closestDistanceToChange = thisRef.top;
      }
    })

    const newAnchorNavLinks = this.state.anchorNavLinks.map(navLink => {
      const rObj = Object.assign({}, navLink)
      if (navLink.linkId !== closestNavLinkId) {
        rObj.selected = false;
        return rObj;
      }
      rObj.selected = true;
      return rObj;
    })

    this.setState({
      anchorNavLinks: newAnchorNavLinks,
    });
  }

  render() {

    // TODO:
    // put ref on outer div of each section
    // USE SECTION ELEMENT?


    // Make colors/types of project into key val pair to avoid insanity later
    // Why is H1 smaller than H2 on mobile?
    // spread things out horizontally more on desktop, vertically more on mobile
    const screenWidth = document.documentElement.clientWidth;
    const sideMargin = Math.min(screenWidth / 6, 40);
    const height = document.documentElement.clientHeight * Math.min((1024 / screenWidth), 2.5)
    const verticalMargin = document.documentElement.clientHeight * 0.25;
    const fontSize = screenWidth < 750 ? 12 : 14;

    return (<div id="majorDevDash" style={{ width: 'inherit' }}>
      {/* Highlight/anchor nav button bar */}
      <AnchorNav
        links={this.state.anchorNavLinks}
      />
      <div style={{ height: '4em' }}></div>
      <div
        id="about"
        className="col-md-12"
        style={{
          margin: '0 auto',
          width: 'inherit',
          display: 'block',
          padding: 0,
        }}
        ref={this.state.anchorNavLinks.find(d => d.linkId === 'about').ref}
      >
        <h1>Major Development in Asheville</h1>
        <p>The Unified Development Ordinance defines six types of large scale development in Asheville.</p>
      </div>
      <div style={{ width: '100%', height: height, display: 'inline-block', fontSize }}>
        <ResponsiveNetworkFrame
          size={[320, 1000]}
          margin={{top: verticalMargin, right: sideMargin, bottom: 0, left: sideMargin }}
          responsiveWidth
          responsiveHeight
          graph={g}
          annotations={annotations}
          // annotationSettings={{
          //   layout: { type: 'bump' }
          // }}
          svgAnnotationRules={(d) => {
            const offsetY = fontSize * 3;
            const offsetX = fontSize;
            let wrap = screenWidth / 3;
            let thisY = - offsetY;
            let thisX = offsetX;
            let alignment = null;
            let curveBeta = 0.25;

            const midpoint = d.networkFrameState.adjustedSize[0] / 2;

            // if it's the only one, position it on whatever side has more room
            if (d.d.coincidents.length === 1) {
              alignment = 'middle';
              thisY = offsetY / 2;
              // if x is greater than midpoint, position it to the left
              if (d.d.x > d.networkFrameState.adjustedSize[0] / 2) {
                thisX = - offsetX * 3;
              } else {
                // if x is less than midpoint, position it to the right
                thisX = offsetX * 3;
              }
            }

            if (d.d.coincidents.length === 2) {
              thisY *= 0.25;
              if (d.d.indexInCoincidents === 0) {
                // If it's the first of two, position it to the left
                thisX = - offsetX;
              }
            }

            // split into rows
            if (d.d.coincidents.length > 2) {
              alignment = 'middle';
              wrap = screenWidth / 4;
              curveBeta = 0.75;
              if (d.d.indexInCoincidents < d.d.coincidents.length / 2) {
                thisY = - offsetY;
                thisX = d.d.indexInCoincidents * wrap - sideMargin;
              } else {
                thisY = offsetY;
                thisX = - (d.d.coincidents.length - d.d.indexInCoincidents - 1) * wrap + sideMargin;
              }

              if (d.d.indexInCoincidents % (d.d.coincidents.length / 2) === 1) {
                thisY *= 2.5;
              }
            }

            return (<Annotation
              x={d.d.x}
              y={d.d.y}
              dy={thisY}
              dx={thisX}
              color="gray"
              title={d.d.label}
              label={d.d.description}
              className="show-bg"
              disable="subject"
              key={`${d.d.label}-annotation`}
            >
              <ConnectorCurve
                curve={curveBundle.beta(curveBeta)}
              />
              <Note
                align={alignment}
                orientation={"topBottom"}
                bgPadding={fontSize}
                padding={fontSize}
                titleColor={"gray"}
                lineType={null}
                wrap={wrap}
              />
            </Annotation>)
          }}
          networkType={{
            type: 'dagre',
            zoom: 'true',
          }}
          edgeStyle={d => ({ stroke: 'white', fill: d.color, strokeWidth: 1 })}
          customNodeIcon={(d) => {
            return (<circle
              cx={d.d.x}
              cy={d.d.y}
              r={nodeSize}
              style={{ fill: '#d9d9d9', stroke: 'gray' }}
            />)
          }}
        />
      </div>
      {/* Get notifications */}
      <h2
        id="notifications"
        ref={this.state.anchorNavLinks.find(d => d.linkId === 'notifications').ref}
      >
        Sign up for Notifications
      </h2>
      <br/>
      <br/>
      <br/>
      <br/>
      {/* Data - table and map */}
      <h2 id="data" ref={this.state.anchorNavLinks.find(d => d.linkId === 'data').ref}>Current Projects</h2>
      <br/>
      <br/>
      <br/>
      <br/>
      {/* Calendar */}
      <h2 id="calendar" ref={this.state.anchorNavLinks.find(d => d.linkId === 'calendar').ref}>Upcoming Public Events</h2>
      <br/>
      <br/>
      <br/>
      <br/>
      {/* FAQ */}
      <h2 id="faq" ref={this.state.anchorNavLinks.find(d => d.linkId === 'faq').ref}>FAQ</h2>
    </div>);
  }

}

export default MajorDevelopmentDashboard;
