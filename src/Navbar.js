import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faDatabase, faChartBar } from '@fortawesome/free-solid-svg-icons'; // Import necessary icons
import './Navbar.css';

function Navbar() {
  return (
    <nav className="Sidebar">
      <Link to="/" className="nav-link">
        <div className="nav-item">
          <FontAwesomeIcon icon={faChartBar} className="nav-icon" />
          <span style={{marginLeft:"15px"}} className="nav-text">Charts</span>
        </div>
      </Link>
      <Link to="/Add" className="nav-link">
        <div className="nav-item">
          <FontAwesomeIcon icon={faPlus} className="nav-icon" />
          <span style={{marginLeft:"15px"}}className="nav-text">Insert</span>
        </div>
      </Link>
      <Link to="/data" className="nav-link">
        <div className="nav-item">
          <FontAwesomeIcon icon={faDatabase} className="nav-icon" />
          <span style={{marginLeft:"15px"}}className="nav-text">Data</span>
        </div>
      </Link>
      <footer className="sidebar-footer">
        <p>&copy; {new Date().getFullYear()} Sumitomo Electric Bordnetze</p>
      </footer>
    </nav>
  );
}

export default Navbar;
