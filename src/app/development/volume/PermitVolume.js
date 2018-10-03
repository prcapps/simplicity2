import React from 'react';
import PropTypes from 'prop-types';
import PermitDataQuery from './PermitDataQuery';
import TimeSlider from './TimeSlider';

class GranularVolume extends React.Component {
  constructor() {
    super();

    this.state = {
      timeSpan: [ // AKA brush extent
        new Date().getTime() - 2678400000,
        // between today and today minus 31 days
        new Date().getTime(),
      ],
      dateField: 'applied_date',
    };

    this.onTimeBrushEnd = this.onTimeBrushEnd.bind(this);
  }

  onTimeBrushEnd(e) {
    // TODO: REJECT NEW TIMESPAN IF IT IS BAD
    this.setState({
      timeSpan: e,
    });
  }

  render() {
    /* TODO:
      bin by week if it's over 6 weeks, by month if it's over 1 year
        do binning on server? is this going to be slow AF?
      group header things-- make it smaller?
        fixed pos? to keep updated vs opened, date range, and permit type in view
      add tooltip to dotbin pieces
      allow users to drill into permits with click/modal behavior
        todo: make modal faster-- put on individual visualizations?
      update URL to allow bookmarking
      props validation
    */

    const isGranularVolumePath = this.props.location.pathname.includes('granular_volume');
    const thirtyDays = 2678400000;
    let defaultBrushExtent = [
      new Date().getTime() - thirtyDays,
      new Date().getTime(),
    ]
    if (isGranularVolumePath) {
      defaultBrushExtent[0] = defaultBrushExtent[1] - thirtyDays * 6
    }

    return (<div>
      <h1 style={{ width: '62.5%', display: 'inline-block' }} >Permits by <select
        style={{ fontSize: '0.85em' }}
        value={this.state.dateField}
        onChange={e => this.setState({ dateField: e.target.value })}
      >
        <option value="applied_date">Date Opened</option>
        <option value="status_date">Date Updated</option>
      </select>
      </h1>
      <div className="col-md-12">
        <TimeSlider
          onBrushEnd={this.onTimeBrushEnd}
          defaultBrushExtent={defaultBrushExtent}
        />
      </div>
      <div>
        <PermitDataQuery
          timeSpan={this.state.timeSpan}
          dateField={this.state.dateField}
          location={this.props.location}
        />
      </div>
    </div>);
  }
}

export default GranularVolume;