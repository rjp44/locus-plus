import React, { useState, useEffect } from 'react';
import Location from '../lib/location';

function PhoneticPlus(props) {
  const [location, setLocation] = useState(
    {
      holding: 'Dont know yet, please allow location access',
      phoneticCodes: []
    }
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // When we are mounted, instantiate a location object and update state when we get a value
    let lcn = new Location();
    lcn.queryDevice().then(() => {
      setLocation({
        phoneticCode: lcn.phoneticCode,
        plusCode: lcn.plusCode,
        phoneticCodes: lcn.phoneticCodes(5)
      });
    })
      .catch(err => setLocation({ err }));
  }, []);

  return (
    <div>
      <h1>You are at</h1>
      <p key="phonetic">{location?.phoneticCodes?.[index] || location.holding || location.err}</p>
      {location?.phoneticCodes?.length && <button onClick={() => setIndex((index + 1) % location.phoneticCodes.length)}>Try Another Spelling</button>}
      <h3>or Just</h3>
      <p>{location.plusCode}</p>
    </div>
  );

}


export default PhoneticPlus;