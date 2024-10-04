import React, { useState } from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import './NavBar.css'; // Custom CSS for styling

const NavBar: React.FC = () => {
  const [tabsVisible, setTabsVisible] = useState(true); // Tabs are open by default

  const toggleTabs = () => {
    setTabsVisible(!tabsVisible); // Toggle the visibility of tabs
  };

  return (
    <Menu
      inverted
      fixed="top"
      style={{
        background: 'linear-gradient(90deg, #2E2E3E 0%, #1F1F2E 100%)',
        height: '70px',
        border: 'none',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {/* Logo on the far left (always white) */}
      <Menu.Item
        header
        as={NavLink}
        to="/dash"
        className="no-highlight-logo" // Custom class to ensure no highlighting
        style={{ fontSize: '1.5em' }}
      >
        <Icon name="graduation" size="large" />
        EnlightDen
      </Menu.Item>

      {/* Arrow stays in place on the left, tabs roll out to the right */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
        <div className="toggle-icon" onClick={toggleTabs} style={{ cursor: 'pointer', marginRight: '0.5em' }}>
          <Icon
            name={tabsVisible ? 'chevron up' : 'chevron down'}
            size="large"
            style={{ color: '#B0B0B0' }}
            title="Toggle Tabs"
          />
        </div>

        {/* Nav Tabs that Toggle On and Off */}
        <Menu.Menu className={`nav-tabs ${tabsVisible ? 'show-tabs' : 'hide-tabs'}`} style={{ display: 'flex' }}>
          <Menu.Item
            as={NavLink}
            to="/classes"
            style={{ color: '#B0B0B0', transition: 'color 0.3s' }}
          >
            Classes
          </Menu.Item>
          <Menu.Item
            as={NavLink}
            to="/calendar"
            style={{ color: '#B0B0B0', transition: 'color 0.3s' }}
          >
            Calendar
          </Menu.Item>
          <Menu.Item
            as={NavLink}
            to="/studysession"
            style={{ color: '#B0B0B0', transition: 'color 0.3s' }}
          >
            Study Session
          </Menu.Item>
        </Menu.Menu>
      </div>

      {/* Profile on the far right */}
      <Menu.Item style={{ color: '#B0B0B0', fontSize: '1.2em' }}>
        <Icon name="user" />
        Profile
      </Menu.Item>
    </Menu>
  );
};

export default NavBar;
