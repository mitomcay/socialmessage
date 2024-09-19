// src/components/Header.js
import React from 'react';
import './Header.css'; // Nếu có

const Header = () => {
  return (
    <header>
      <h1 style={{width: '20%'}}>Video Player App</h1>
      <div style={{width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
        <input type='text' placeholder='Search...' style={{ width: '70%', padding: '10px', fontSize: '16px' }} />
        <input type='button' value='Search' style={{ width: '10%', padding: '10px', fontSize: '16px' }} />
      </div>
      <div style={{width: '30%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
        <button style={{ padding: '10px', fontSize: '16px' }} > list</button>
        <button style={{ padding: '10px', fontSize: '16px' }} > history</button>
        <button style={{ padding: '10px', fontSize: '16px' }} > Favourist</button>
        <button style={{ padding: '10px', fontSize: '16px' }} > login</button>
      </div>
    </header>
  );
};

export default Header;
