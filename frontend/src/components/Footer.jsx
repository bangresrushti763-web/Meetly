import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      background: 'rgba(15, 23, 42, 0.8)',
      padding: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontSize: '0.9rem',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      marginTop: 'auto',
      flexShrink: 0
    }}>
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{ 
          width: '10px', 
          height: '10px', 
          borderRadius: '50%', 
          background: '#10b981' 
        }}></div>
        <span>© 2025 ProfessionalMeet. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;