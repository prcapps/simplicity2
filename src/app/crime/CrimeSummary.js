import React from 'react';
import SpatialEventTopicSummary from '../spatial_event_topic_summary/SpatialEventTopicSummary';

const CrimeSummary = props => (
  <div className="col-xs-12">
    <SpatialEventTopicSummary spatialEventTopic="crime" query={props.location.query} />
  </div>
);

CrimeSummary.propTypes = {
  location: React.PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

CrimeSummary.defaultProps = {
  location: {
    query: { entity: 'address', label: '123 Main street' },
  },
};

export default CrimeSummary;