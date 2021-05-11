import React, { useState } from 'react';
import Location from '../lib/location';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import { MapContainer, Circle, TileLayer, Marker, Popup } from 'react-leaflet';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    alignItems: 'stretch'
  },
  row: {
    flexGrow: 1,
    padding: theme.spacing(1),
    textAlign: 'center',
  },
  wrapper: {
    flexGrow: 1,
    height: 30,
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  buttonCenter: {
    position: 'absolute',
    top: 0,
    left: '25%',
    width: '50%'
  },
  map: {
    height: 250
  }
}));



export default function PhoneticPlus(props) {
  const classes = useStyles();
  const [location, setLocation] = useState(
    {
      holding: 'Dont have a location yet'
    }
  );
  const [index, setIndex] = useState(0);

  const getLocation = () => {
    setLocation({ ...location, fetching: true });
    let lcn = new Location();
    lcn.queryDevice().then(({ latitude, longitude }) => {
      setLocation({
        latitude,
        longitude,
        isLoaded: true,
        phoneticCode: lcn.phoneticCode,
        plusCode: lcn.plusCode,
        phoneticCodes: lcn.phoneticCodes(5),
        osGridRef: lcn.osGridRef,
        accuracy: lcn.accuracy
      });
    })
      .catch(err => setLocation({
        err: `Something went wrong, please allow location access: ${err.message}`
      }));
  };

  return (
    <div className={classes.root}>
      <Grid container>
        <Grid item xs={12} className={classes.row}>
          <Paper margin={5}>
            <Typography variant="h5" data-testid="phonetic">{location?.phoneticCodes?.[index] || location.err}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} className={classes.row}>
          {location?.phoneticCodes?.length && <Button variant="contained" color="primary" onClick={() => setIndex((index + 1) % location.phoneticCodes.length)}>Try Another Spelling</Button>}
        </Grid>
        <Grid item xs={12} className={classes.row}>
          {location.osGridRef && <p>OS Grid Ref: <b>{location.osGridRef}</b></p>}
        </Grid>

        <LocationButton
          getLocation={getLocation}
          haveLocation={location?.phoneticCode}
          fetching={location.fetching}
          className={classes.row}
        />

        <Grid item xs={12} className={classes.row}>
          {location.isLoaded && <Map {...location} />}
        </Grid>
        {location.accuracy &&
          <Grid item xs={12} className={classes.row}>
            <Typography variant="body2">Your device reports this is accurate to <b>{location.accuracy}m</b></Typography>
          </Grid>}
      </Grid>
    </div>
  );

  function Map(props) {
    return (
      <MapContainer center={[props.latitude, props.longitude]} zoom={15 - props.accuracy / 750} scrollWheelZoom={true} className={classes.map}>
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
    
  }

  function LocationButton(props) {
    return (
      <div className={classes.wrapper}>
        <Button
          variant="contained"
          color="primary"
          disabled={props.fetching}
          className={classes.buttonCenter}
          onClick={props.getLocation}>
          {(props.haveLocation) ? 'Update' : 'Get'} Location
    </Button>
        {props.fetching && <CircularProgress size={24} className={classes.buttonProgress} />}
      </div>

    );
  }


}



