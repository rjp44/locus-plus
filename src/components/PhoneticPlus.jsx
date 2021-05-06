import React, { useState, useEffect } from 'react';
import Location from '../lib/location';

function PhoneticPlus(props) {
  const [location, setLocation] = useState(
    { phoneticCode: 'Dont know yet, please allow location access' }
  );

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
      <p key="phonetic">{location.phoneticCode || location.err}</p>
      <h2>AKA</h2>
      {
        location.phoneticCodes && location.phoneticCodes
          .filter((code, index) => index > 0)
          .map((code, index) =>
            (<p key={index}>{code}</p>))
      }
      <h3>or Just</h3>
      <p>{location.plusCode}</p>
    </div>
  );

}


export default PhoneticPlus;