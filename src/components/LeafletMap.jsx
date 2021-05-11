import React from 'react';

import { MapContainer, Circle, TileLayer, Marker, Popup } from 'react-leaflet';

export default React.memo(function LeafletMap(props) {
  return (
    <MapContainer
      center={[props.latitude, props.longitude]}
      zoom={15 - props.accuracy / 750}
      scrollWheelZoom={true}
      style={{ height: props.height + 'px' }}>
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
