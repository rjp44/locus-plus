import React, { useState } from 'react';
import Location from '../lib/location';

function PhoneticPlus(props) {
  const [location, setLocation] = useState(
    {
      holding: 'Dont have a location yet'
    }
  );
  const [index, setIndex] = useState(0);

  const getLocation = () => {
    setLocation({ ...location, fetching: true });
    let lcn = new Location();
    lcn.queryDevice().then(() => {
      setLocation({
        phoneticCode: lcn.phoneticCode,
        plusCode: lcn.plusCode,
        phoneticCodes: lcn.phoneticCodes(5),
        osGridRef: lcn.osGridRef
      });
    })
      .catch(err => setLocation({ err }));
  }

  return (
    <div>
      {location.phoneticCode && <h1>You are at</h1>}

      <p key="phonetic"><b data-testid="phonetic">{location?.phoneticCodes?.[index] || location.err}</b></p>
      
      {location?.phoneticCodes?.length && <button onClick={() => setIndex((index + 1) % location.phoneticCodes.length)}>Try Another Spelling</button>}
      
      {location.plusCode &&
        (<>
        <p>Full Code <b>{location.plusCode}</b></p>
        </>)
      }

      {location.osGridRef && <p>OS Grid Ref: <b>{location.osGridRef}</b></p>}
      
      <button onClick={getLocation}>{(location.phoneticCode) ? 'Update' : 'Get'} Location</button>
    </div>
  );

}


export default PhoneticPlus;