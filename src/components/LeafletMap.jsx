import React, { useRef, useEffect, useState } from 'react';

import { MapContainer, Circle, TileLayer, Marker, Popup } from 'react-leaflet';
import Typography from '@material-ui/core/Typography';

export default React.memo(function LeafletMap(props) {
  const ref = useRef();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current?.offsetTop) {
      // This is totally hooky, but react-leaflet wants a fixed size parent div always before 
      //  it is added to the DOM so our flex layout doesn't work.
      // There *must* be a better way.
      setHeight(Math.max(100, window.innerHeight - ref.current.offsetTop - 30));
    }
  }, []);

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

  return (
    <div ref={ref} style={{ height: height + 'px' }}>
      {height && <MapContainer
        center={[props.latitude, props.longitude]}
        zoom={15 - props.accuracy / 750}
        scrollWheelZoom={true}
        style={{
          height: height + 'px'
        }}
        placeholder={<Placeholder />}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[props.latitude, props.longitude]}>
          <Popup>{props.plusCode}, accurate to {props.accuracy}m </Popup>
        </Marker>
        <Circle center={[props.latitude, props.longitude]} radius={props.accuracy} />
        {props.accuracy &&
          <Typography
            variant="body2"
            style={
              {
                position: 'absolute',
                left: 10,
                bottom: 10,
                zIndex: 1000
              }
            }>
            Your device reports location is accurate to <b>{props.accuracy}m</b>
          </Typography>}
      </MapContainer>}
    </div>
  );

});
