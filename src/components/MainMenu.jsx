import React from 'react';

import { IconButton, MenuItem, Menu} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { Link as RouterLink } from 'react-router-dom';

import PhoneticPlus from './PhoneticPlus';
import About from './About';
import Console from './Console';

export let paths = {
  '/': { title: 'Location', exact: true, children: (props) => <PhoneticPlus {...props} /> },
  '/console': { title: 'Operator Console', component: Console },
  '/about': { title: 'About', component: About }
}


export default function MainMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton aria-controls="main-menu" aria-haspopup="true" onClick={handleClick} edge="start" color="inherit" aria-label="menu">
        <MenuIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {Object.entries(paths).map(([key, value]) =>
          <MenuItem onClick={handleClose} component={RouterLink} to={key} key={key}>
            {value.title}
          </MenuItem>
        )}
      </Menu>
    </div>
  );
}

