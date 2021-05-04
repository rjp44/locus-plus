import React, { useState } from 'react';
import { Location } from '../lib/location';

function PhoneticPlus(props) {
    const [location, setLocation] = useState(0);
    let l = new Location();
    l.position
        .then(position => (console.log('setting', position), setLocation({ set: 'yes', ...position})))
        .catch(err => setLocation({ err }));


    return (
        <div>
        <div>{location.plusCode}</div>
            {location.phoneticCodes && location.phoneticCodes.map(code => (<div>{code}</div>))}
        </div>
    );

}


export default PhoneticPlus;