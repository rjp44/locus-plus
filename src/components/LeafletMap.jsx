import React, { useState, useEffect } from 'react';

import { MapContainer, Circle, TileLayer, Marker, Popup } from 'react-leaflet';
import Typography from '@material-ui/core/Typography';


export default React.memo(function LeafletMap(props) {
  let [map, setMap] = useState(null);
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

  function GoogleLink({ plusCode }) {
    return plusCode &&
      <>
        <a
          href={`https://www.google.com/maps/place/${encodeURIComponent(plusCode)}`}
          target="_blank"
          rel="noreferrer">
          Open in Google Maps
    </a>
      </>;
  }

  function Accuracy({ accuracy }) {
    return accuracy ?
      <>
        Accurate to {accuracy}m
      </>
      :
      '';
  }
  function OSLink({ latitude, longitude, osGridRef }) {
    console.log({ latitude, longitude, osGridRef });
    return osGridRef ?
      <>
        <a
          href={`https://osmaps.ordnancesurvey.co.uk/${latitude},${longitude},18/pin`}
          target="_blank"
          rel="noreferrer">
          Open in OSMaps
        </a>
      </>
      : '';
  }


  useEffect(() => {
    // MapContainer doesn't re-render to reset any user induced pan/zoom when
    //  we re-render it with the same props, so updates may or may not re-centre the map.
    // To fix this, we re-centre the map whenever a terminal state update completes even if same props.
    if (map && !props.fetching) {
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
        <Popup>
          {props.plusCode} {props.mapLinks && <GoogleLink {...props} />}<br />
          {props.osGridRef} {props.mapLinks && <OSLink {...props} />}<br />
          <Accuracy {...props} />
        </Popup>
      </Marker>
      <Circle center={[props.latitude, props.longitude]} radius={props.accuracy} />
    </MapContainer>
  );

});
