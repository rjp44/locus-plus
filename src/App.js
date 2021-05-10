import PhoneticPlus from './components/PhoneticPlus';
import './App.css';

import GitHubIcon from '@material-ui/icons/GitHub'
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Drawer, Toolbar, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'stretch'
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
}));


function App() {
  const classes = useStyles();
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Your Location
          </Typography>
        </Toolbar>
      </AppBar>
      <PhoneticPlus />
      <Drawer anchor="bottom" variant="permanent">
        <div><GitHubIcon /> <a href="https://github.com/rjp44/locus-plus"> rjp44/locus-plus </a></div>
      </Drawer>
</div>
  );
}

export default App;
