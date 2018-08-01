import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { nest } from 'd3-collection';
import { histogram } from 'd3-array';
import { ResponsiveOrdinalFrame } from 'semiotic';
import LoadingAnimation from '../../../shared/LoadingAnimation';
import ZoomableCirclepack from './ZoomableCirclepack';
import { colorSchemes } from '../../../shared/visualization/colorSchemes';
import { labelOrder } from '../../../shared/visualization/visUtilities';


const colorScheme = colorSchemes.bright_colors.concat(colorSchemes.bright_colors_2);
const otherGroupCutoff = 5;

class GranularVolume extends React.Component {
  constructor() {
    super();

    this.state = {
      timeSpan: [new Date(2018, 6, 1), new Date()],
      focusNodeOrderedPath: [
        // { level: 'permit_group', selected: null },
        { level: 'permit_type', selected: true },
        { level: 'permit_subtype', selected: null },
        { level: 'permit_category', selected: null },
      ],
    }
  }

  adjustTimespan(newTimeSpan) {
    this.setState({ timeSpan: newTimeSpan });
  }

  selectedHierarchy(levelsToUse, rollup = false) {
    const thisNest = nest();
    levelsToUse.forEach(level => thisNest.key(d => d[level]));
    if (rollup) {
      thisNest.rollup(d => d.length);
    }
    return thisNest
      .entries(this.props.data.permits_by_address);
  }

  render() {
    if (this.props.data.loading) {
      return <LoadingAnimation />;
    }

    // TODO: roll small categories into "other", have asterisk with what is included in other?
    // or let user choose how many go in other?
    // Also, will this all break with nested-- yes, but need to put actual selected value into path

    // Are we viewing permit type, subtype, or category?
    const selectedLevels = this.state.focusNodeOrderedPath
      .filter(nodeLevel => nodeLevel.selected)
      .map(nodeLevel => nodeLevel.level);

    // Data sorted into as many levels as are selected
    const currentHierarchy = this.selectedHierarchy(selectedLevels)
      .sort((a, b) => b.values.length - a.values.length);

    const hierarchyToUse = currentHierarchy.slice(0, otherGroupCutoff);

    const others = [].concat(...currentHierarchy.slice(
      otherGroupCutoff,
      currentHierarchy.length - 1
    ).map(d => d.values));

    hierarchyToUse.push({
      key: 'Other',
      values: others,
    });

    hierarchyToUse.sort((a, b) => b.values.length - a.values.length);

    console.log(hierarchyToUse)

    // Determine what colors each key within that hierarchy should be
    const nodeColors = {};
    hierarchyToUse.forEach((hierarchyLevel, i) => {
      nodeColors[hierarchyLevel.key] = colorScheme[i];
    });

    // Standard date format for comparison
    const dateOptions = {
      weekday: 'short',
      year: '2-digit',
      month: 'short',
      day: 'numeric',
    };

    // What dates are we even including?
    const includedDates = this.props.data.permits_by_address
      .map(d => new Date(d.applied_date))
      .sort((a, b) => a - b)
      .map(d => d.toLocaleDateString('en-US', dateOptions))
      .filter((d, i, a) => a.indexOf(d) === i)
      .map(d => new Date(d));

    const includedDatesMilliseconds = includedDates.map(d => d.getTime());
    let checkDate = includedDatesMilliseconds[0];
    // TODO: have checkdate start at query date-- maybe just fill an array with all the dates until we're at the end date?

    while (checkDate < includedDatesMilliseconds[includedDatesMilliseconds.length - 1]) {
      if (includedDatesMilliseconds.indexOf(checkDate) < 0) {
        includedDates.push(new Date(checkDate));
      }
      checkDate += (24 * 60 * 60 * 1000);
    }
    includedDates.sort((a, b) => a - b);

    const rolledUpHierarchy = this.selectedHierarchy(selectedLevels, true);

    const histFunc = histogram(this.props.data.permits_by_address)
      .value(d => new Date(d.applied_date))
      .thresholds(includedDates);

    const ordinalData = [].concat(...hierarchyToUse
      .map((hierarchyType) => {
        const binnedValues = histFunc(hierarchyType.values);
        return binnedValues.map(bin => ({
          key: hierarchyType.key,
          count: bin.length,
          binStartDate: new Date(bin.x0),
        }));
      }));

    return (<div>
      <h1>Permit Volume II</h1>
      <div id="vol-controls" className="row">
        {/* Permit hierarchy filter buttons */}
        <div style={{ margin: '1%' }} >
          {this.state.focusNodeOrderedPath.map(pathOption =>
            // if it and the pathoption before it has a value, then show it
            (<div
              style={{
                display: 'inline-block',
                padding: '0 1%',
                textTransform: 'capitalize',
              }}
              key={pathOption.level}
            >
              {pathOption.level.replace('_', ' ')}: dropdown here
            </div>)
          )}
        </div>
        {/* Checkbox legend - more like checkboxes-- only show top 3 - 5 by volume by default */}
        <div className="col-md-9">
          <ResponsiveOrdinalFrame
            responsiveWidth
            data={ordinalData}
            size={[500, 200]}
            projection="vertical"
            type="bar"
            margin={{
              top: 10,
              right: 10,
              bottom: 50,
              left: 20,
            }}
            oLabel={(d) => {
              const dateString = new Date(d).toLocaleDateString('en-US', dateOptions);
              return (
                <text
                  textAnchor={'end'}
                  transform={'rotate(-45)'}
                >
                  {dateString}
                </text>
              )
            }}
            oAccessor="binStartDate"
            oPadding={5}
            rAccessor="count"
            style={d => ({ fill: nodeColors[d.key] })}
          />
        </div>
        <div className="col-md-3">
          <ZoomableCirclepack
            data={{ key: 'root', values: rolledUpHierarchy }}
            highlightLevel={selectedLevels.length}
            colorKeys={nodeColors}
          />
        </div>
      </div>
      <div id="permitValue">
        <h2>Value</h2>
      </div>
      <div id="permitFees">
        <h2>Fees</h2>
      </div>
      <div id="openClosedIssued">
        <h2>Open, Closed, Issued</h2>
      </div>
      <div id="inspections">
        <h2>Inspections</h2>
      </div>
      <div id="pacVolume">
        <h2>PAC Traffic</h2>
      </div>
      <div id="percentOnline">
        <h2>Percent Opened Online</h2>
      </div>
    </div>);
  }
}

// TODO: PROPS VALIDATION

const getPermitsQuery = gql`
  query getPermitsQuery($civicaddress_id: Int!, $radius: Int, $after: String) {
    permits_by_address(civicaddress_id: $civicaddress_id, radius: $radius, after: $after) {
        permit_number
        permit_group
        permit_type
        permit_subtype
        permit_category
        permit_description
        applicant_name
        applied_date
        status_current
        status_date
        civic_address_id
        address
        x
        y
    }
  }
`;

export default graphql(getPermitsQuery, {
  options: {
    variables: {
      civicaddress_id: 9688,
      radius: 52800,
      after: 'Jun 30 2018',
    },
  },
})(GranularVolume);
