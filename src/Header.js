import React from 'react';
import './Header.css';
import logo from './logo.png';
import lg2 from './lg2.png';
function Header() {
  return (
    <header className="Header">
        <img style={{marginTop:"0px"}}src={lg2} width={90} alt="Logo" className="logo" />
      <h1>PAPER CONSUMPTION </h1>
      <img src={logo} width={150} alt="Logo" className="logo" /> {/* Moved the logo after the h1 */}
    </header>
  );
}

export default Header;
