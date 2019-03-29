import React from 'react';
import TypePuck from './TypePuck';
import { trcProjectTypes } from '../utils';

const PermitTypeCards = () => (
  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', flexWrap: 'wrap' }}>
    {Object.keys(trcProjectTypes).map(type => {
      const projectType = trcProjectTypes[type];
      return (
        <div
          key={`card-${type}`}
          style={{
            width: window.innerWidth > 760 ? '25%': '40%',
            flexGrow: 1,
            border: `5px solid ${projectType.color}`,
            backgroundColor: 'white',
            padding: '1em',
            borderRadius: '6px',
            margin: '1em',
            top: '0px',
          }}
          className={type}
        >
          <div style={{ textAlign: 'center' }}>
            <TypePuck
              color={projectType.color}
              text={projectType.short}
            />
          </div>
          <div
            style={{
              width: '100%',
              fontWeight: 'bold',
              textAlign: 'center',
              padding: '0.5em 0'
            }}
          >
            {type}
          </div>
          <div>{projectType.description}</div>
        </div>
      )
    })}
  </div>
)

export default PermitTypeCards;
