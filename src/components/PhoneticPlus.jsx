import React, { useState } from 'react';
import Location from '../lib/location';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import LeafletMap from './LeafletMap';

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

const accuracyLevels = {
  25: { level: 'success', summary: 'great!' },
  100: { level: 'info', summary: 'good' },
  500: { level: 'warning', summary: 'may improve if you Update' },
  9999999: { level: 'error', summary: 'please click Update to try again' },
};



export default function PhoneticPlus(props) {
  const classes = useStyles();
  const [location, setLocation] = useState(
    {
      holding: 'Dont have a location yet'
    }
  );
  const [index, setIndex] = useState(0);
  const [confirmation, setConfirmation] = useState(0);

  const getLocation = () => {
    setLocation({ ...location, fetching: true });
    setConfirmation(0)
    let lcn = new Location();
    lcn.queryDevice().then(({ latitude, longitude, accuracy }) => {
      setLocation({
        latitude,
        longitude,
        accuracy: Math.ceil(accuracy),
        isLoaded: true,
        phoneticCode: lcn.phoneticCode,
        plusCode: lcn.plusCode,
        phoneticCodes: lcn.phoneticCodes(5),
        osGridRef: lcn.osGridRef
      });
      let commentary = accuracy && Object.entries(accuracyLevels)
        .find(([key, value]) => (accuracy <= key));
      let [, { level, summary }] = commentary || [null, {}];
      setConfirmation({ level, summary });

    })
      .catch(err => setLocation({
        err: `Something went wrong, please allow location access: ${err.message}`
      }));
  };

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} className={classes.row} data-testid="phonetic">
        {(location.phoneticCode || location.err) &&
          <Paper margin={5} className={classes.phoneticOutput}>
            <Typography variant="h6">{location?.phoneticCodes?.[index] || location.err}</Typography>
          </Paper>
        }
      </Grid>
      <Grid item xs={12} className={classes.row}>
        {location?.phoneticCodes?.length && <Button variant="contained" color="primary" onClick={() => setIndex((index + 1) % location.phoneticCodes.length)}>Try Another Spelling</Button>}
      </Grid>
      {!location.isLoaded && <Grid item xs={12} className={classes.row}>
        <LocationButton
          getLocation={getLocation}
          haveLocation={location?.phoneticCode}
          fetching={location.fetching}
          className={classes.row}
        />
      </Grid>}
      <Grid item xs={12} className={classes.hog}>
        {location.isLoaded && <LeafletMap {...location} />}
        {location.osGridRef && <div className={classes.gridRef}><Typography variant="h6">OS Grid Ref: <b>{location.osGridRef}</b></Typography></div>}
        {location.isLoaded && <div className={classes.locationOverlay}>
          <LocationButton
            getLocation={getLocation}
            haveLocation={location?.phoneticCode}
            fetching={location.fetching}
            className={classes.row}
          />
        </div>}
        {confirmation?.level && <MySnackbar severity={confirmation.level} setConfirmation={setConfirmation} open={true}>
          Location accuracy is <b>{location.accuracy}</b>m, {confirmation.summary}
        </MySnackbar>

        }

      </Grid>
    </Grid>
  );




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

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }


  function MySnackbar(props) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(props.open);

    const handleClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
      setOpen(false);
      props.setConfirmation(false);
    };


    return (
      <div className={classes.root}>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity={props.severity}>
            {props.children}
          </Alert>
        </Snackbar>
      </div>
    );

  }
}