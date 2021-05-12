import {
  HashRouter as Router,
  Route,
} from "react-router-dom";

import PhoneticPlus from './components/PhoneticPlus';
import About from './components/About';
import './App.css';

import MainMenu from './components/MainMenu';

import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    position: 'center'
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  toolbar: theme.mixins.toolbar
}));


function App() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Router>
        <>
          <AppBar position="fixed">
            <Toolbar>
              <MainMenu />
              <Typography variant="h6" className={classes.title}>
                Your Location
          </Typography>
            </Toolbar>
          </AppBar>
          <div className={classes.toolbar} />
          <Route exact path="/" children={() => <PhoneticPlus />} />
          <Route path="/about" component={About} />
        </>
      </Router>
    </div>
  );
}

export default App;
