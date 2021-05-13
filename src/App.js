import {
  HashRouter as Router,
  Route,
  useLocation
} from "react-router-dom";


import './App.css';

import MainMenu, { paths as MenuPaths } from './components/MainMenu';

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
              <LocationHeader />
            </Toolbar>
          </AppBar>
          <div className={classes.toolbar} />
          {Object.entries(MenuPaths).map(([key, value]) =>
            <Route exact={value.exact}
              path={key}
              key={key}
              component={value.component}
              children={value.children}
            />
          )}
        </>
      </Router>
    </div>
  );

  function LocationHeader() {
    const location = useLocation();
    return (<Typography variant="h6" className={classes.title}>
      {MenuPaths[location.pathname]?.title}
    </Typography>);

  }
}

export default App;
