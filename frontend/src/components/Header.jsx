import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Button } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';

const Header = ({ showHistory = true, showLogout = true }) => {
  const navigate = useNavigate();

  return (
    <div className="navBar">
      <div style={{ display: "flex", alignItems: "center" }}>
        <h2>ProfessionalMeet</h2>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        {showHistory && (
          <>
            <IconButton 
              onClick={() => navigate("/history")}
              style={{ color: 'white', marginRight: '10px' }}
            >
              <RestoreIcon />
            </IconButton>
            <p 
              onClick={() => navigate("/history")}
              style={{ marginRight: '20px', cursor: 'pointer' }}
            >
              History
            </p>
          </>
        )}

        {showLogout && (
          <Button 
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
            variant="outlined"
            style={{ 
              color: 'white', 
              borderColor: 'rgba(255, 255, 255, 0.3)',
              textTransform: 'none'
            }}
          >
            Logout
          </Button>
        )}
      </div>
    </div>
  );
};

export default Header;