import React, { useState, useEffect } from 'react';

import { MapContainer, Circle, TileLayer, Marker, Popup } from 'react-leaflet';
import Typography from '@material-ui/core/Typography';


export default React.memo(function LeafletMap(props) {
  let[map, setMap] = useState(null);
  let zoom = 15 - (props.accuracy || 0) / 750;

  function Placeholder() {
    return (<div>
      <Typography
        variant="body2">
        Map cannot display offline
          </Typography>
      {props.accuracy &&
        <Typography
          variant="body2">
          Your device reports location is accurate to <b>{props.accuracy}m</b>
        </Typography>
      }
    </div >
    );
  }

  useEffect(() => {
    console.log({ map });
    if (map) {
      map.setView([props.latitude, props.longitude], zoom);
    }
  });

  return (
    <MapContainer
      center={[props.latitude, props.longitude]}
      zoom={15 - props.accuracy / 750}
      scrollWheelZoom={true}
      style={{
        height: '100%'
      }}
      placeholder={<Placeholder />}
      whenCreated={setMap}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[props.latitude, props.longitude]}>
        <Popup>{props.plusCode}, accurate to {props.accuracy}m </Popup>
      </Marker>
      <Circle center={[props.latitude, props.longitude]} radius={props.accuracy} />
    </MapContainer>
  );

});
