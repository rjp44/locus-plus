import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import LeafletMap from './LeafletMap';
import GeoInput from './GeoInput';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    flexDirection: 'column'
  },
  row: {
    flex: '0 1 auto',
    padding: theme.spacing(1),
    textAlign: 'center',
  },
  hog: {
    position: 'relative',
    flex: '1 1 auto',
    padding: theme.spacing(1),
    textAlign: 'center',
  },
  wrapper: {
    flexGrow: 1,
    height: 18,
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
    marginTop: -12,
    width: '100%',
    left: 0
  },
  map: {
    height: 200
  },
  phoneticOutput: {
    minHeight: '4rem'
  },
  locationOverlay: {
    position: 'absolute',
    top: 80,
    width: '70%',
    left: '15%',
    zIndex: 1000
  },
  gridRef: {
    position: 'absolute',
    top: 25,
    width: '70%',
    right: '15%',
    background: 'rgba(255, 255, 255, 0.6)',
    zIndex: 1000
  },
  accuracyOverlay: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    zIndex: 1000,
    background: 'rgba(255, 255, 255, 0.6)'
  }
}));




export default function Console(props) {
  const classes = useStyles();
  const [location, setLocation] = useState(0);



  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} className={classes.row} data-testid="phonetic">
        <GeoInput setLocation={setLocation}/>
      </Grid>
      <Grid item xs={12} className={classes.hog}>
        {location?.latitude ?
          <LeafletMap latitude={location.latitude} longitude={location.longitude} accuracy={0} />
          : <div>
            <Typography variant="h6">Enter a valid location string in the input area above to see a map location</Typography>
            <Typography variant="body1">This can be a short pluscode from the locator app with completions like:<br />
              <b>G8+7GV, Hoxton, England</b>,<br />
              a long pluscode like:<br />
              <b>85GCQ2XF+C84</b><br />
              or an OS Grid reference like:<br />
              <b>NS 01823 35892</b>.
            </Typography>
            </div>}
        {location?.osGridRef && <div className={classes.gridRef}><Typography variant="h6">OS Grid Ref: <b>{location.osGridRef}</b></Typography></div>}
      </Grid>
    </Grid>
  );


  
}