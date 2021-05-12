import { Link as RouterLink, useHistory } from 'react-router-dom';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import GitHubIcon from '@material-ui/icons/GitHub';
import Slide from '@material-ui/core/Slide';
import Link from '@material-ui/core/Link';

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  toolbar: theme.mixins.toolbar
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function About(props) {
  const classes = useStyles();
  const [, setOpen] = React.useState(true);
  const history = useHistory();

  const handleClose = () => {
    setOpen(false);
    history.goBack();
  };

  return (

    <Dialog fullScreen open={props.match} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose} component={RouterLink} to='/' aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            About
            </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.toolbar} />
      <Paper className={classes.paper}>
        <Typography variant="body1">
          Locus Plus is a Progressive Web Application which gives the user the NATO alphabet pronunciation of the Open Location Code for their current device location.
        </Typography>
      </Paper>
      <Paper className={classes.paper}>
        <Typography variant="h6">Source Code</Typography>
        <Typography variant="body1">
          This demo is hosted for convenience at <b>locus.plus</b> but the source code is available to anyone to use and modify under the very permissive BSD open source licence. You can download it here:
        </Typography>
        <Typography><GitHubIcon /><Link href="https://github.com/rjp44/locus-plus/" target="_blank" rel="noopener">rjp44/locus-plus</Link></Typography>
      </Paper>
      <Paper className={classes.paper}>
        <Typography variant="h6">Privacy</Typography>
        <Typography variant="body1">
          This is a client side only application. We don't use cookies or collect any information at all from your device that we then send anywhere. A log of IP addresses requesting the application exists on our systems but this is only used for diagnostic purposes. We do not log any transactions or any information about your location.
      </Typography>
        <Typography variant="body1">
          The only external database we use is <Link href="https://www.openstreetmap.org/about" target="_blank" rel="noopener">Open Streetmap</Link> from which the application requests map tiles,
      when being used in online mode. I guess it is feasible that your location could be infered by someone who has access to their logs, so don't do this if you have any reason to be paranoid.
      </Typography>
        <Typography variant="body1">
          The privacy claims may be verified by inspecting the source code. The application code served at <Link hreaf="https://locus.plus/" target="_blank" rel="noopener">locus.plus</Link> is the last commit on the head of the <b>main</b> branch at <Link href="https://github.com/rjp44/locus-plus#main">GitHub</Link> (subject to CI test passing, check the status).
        </Typography>
      </Paper>
      <Paper className={classes.paper}>
        <Typography variant="h6">Contact</Typography>
        <Typography variant="body1">
          The author is <Link href="mailto:rob@pickering.org" target="_blank" rel="noopener">rob@pickering.org</Link>. If you are reporting issues or looking for enhancements then raise an issue on <Link href="https://github.com/rjp44/locus-plus/" target="_blank" rel="noopener">Github</Link>.
        </Typography>

      </Paper>
    </Dialog>

  );
}