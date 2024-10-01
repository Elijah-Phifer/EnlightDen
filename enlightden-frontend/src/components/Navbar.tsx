// src/components/Navbar.tsx

import React from 'react';
import { Menu } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <Menu inverted>
      <Menu.Item as={NavLink} to="/dash" exact>
        Dashboard
      </Menu.Item>
      <Menu.Item as={NavLink} to="/notes">
        Notes
      </Menu.Item>
      <Menu.Item as={NavLink} to="/pomodore">
        Pomodore
      </Menu.Item>
      {/* <Menu.Item as={NavLink} to="/mindmap">
        Mind Map
      </Menu.Item> */}
    </Menu>
  );
};

export default Navbar;
