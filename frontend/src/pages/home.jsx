import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

function HomeComponent() {


    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
    const [scheduleDate, setScheduleDate] = useState("");
    const [scheduleTime, setScheduleTime] = useState("");
    const [duration, setDuration] = useState("30"); // Default 30 minutes

    const {addToUserHistory} = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    const handleScheduleMeeting = () => {
        // Generate a unique meeting ID
        const meetingId = Math.random().toString(36).substr(2, 9);
        
        // In a real application, you would send this to your backend to save the scheduled meeting
        // For now, we'll just show an alert with the details
        alert(`Meeting scheduled!
Meeting ID: ${meetingId}
Date: ${scheduleDate}
Time: ${scheduleTime}
Duration: ${duration} minutes`);
        
        // Close the dialog
        setOpenScheduleDialog(false);
        
        // Reset form fields
        setScheduleDate("");
        setScheduleTime("");
        setDuration("30");
        
        // Navigate to the meeting room
        navigate(`/${meetingId}`);
    };

    return (
        <>

            <Header showHistory={true} showLogout={true} />

            <div className="meetContainer" style={{ marginTop: '80px' }}>
                <div className="leftPanel">
                    <div>
                        <h2>Professional Video Conferencing for Modern Teams</h2>

                        <p>Connect with your team members securely with our enterprise-grade video meeting solution</p>
                        
                        <div style={{ 
                            display: 'flex', 
                            gap: "15px",
                            background: 'rgba(30, 41, 59, 0.5)',
                            padding: '20px',
                            borderRadius: '12px',
                            maxWidth: '600px'
                        }}>

                            <TextField 
                                onChange={e => setMeetingCode(e.target.value)} 
                                id="outlined-basic" 
                                label="Enter Meeting Code" 
                                variant="outlined" 
                                fullWidth
                                InputProps={{
                                    style: { color: 'white' }
                                }}
                                InputLabelProps={{
                                    style: { color: 'rgba(255, 255, 255, 0.7)' }
                                }}
                            />
                            <Button 
                                onClick={handleJoinVideoCall} 
                                variant='contained'
                                style={{
                                    padding: '15px 30px',
                                    height: '56px'
                                }}
                            >
                                Join Meeting
                            </Button>

                        </div>
                        
                        <div style={{ 
                            marginTop: '30px',
                            display: 'flex',
                            gap: '15px'
                        }}>
                            <Button 
                                variant="contained"
                                onClick={() => navigate(`/${Math.random().toString(36).substr(2, 9)}`)}
                                style={{
                                    padding: '12px 25px',
                                    background: 'linear-gradient(45deg, #38bdf8, #0ea5e9)'
                                }}
                            >
                                New Meeting
                            </Button>
                            <Button 
                                variant="outlined"
                                onClick={() => setOpenScheduleDialog(true)}
                                style={{
                                    padding: '12px 25px',
                                    color: 'white',
                                    borderColor: 'rgba(255, 255, 255, 0.3)'
                                }}
                            >
                                Schedule Meeting
                            </Button>
                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img 
                        src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
                        alt="Professional meeting" 
                        style={{
                            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
                        }}
                    />
                </div>
            </div>
            
            {/* Schedule Meeting Dialog */}
            <Dialog open={openScheduleDialog} onClose={() => setOpenScheduleDialog(false)} PaperProps={{
                style: {
                    background: 'rgba(15, 23, 42, 0.9)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }
            }}>
                <DialogTitle>Schedule a Meeting</DialogTitle>
                <DialogContent>
                    <DialogContentText style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '20px' }}>
                        Set up your meeting details
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Date"
                        type="date"
                        fullWidth
                        variant="outlined"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        InputLabelProps={{
                            style: { color: 'rgba(255, 255, 255, 0.7)' },
                            shrink: true
                        }}
                        InputProps={{
                            style: { color: 'white' }
                        }}
                        style={{ marginBottom: '20px' }}
                    />
                    <TextField
                        margin="dense"
                        label="Time"
                        type="time"
                        fullWidth
                        variant="outlined"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        InputLabelProps={{
                            style: { color: 'rgba(255, 255, 255, 0.7)' },
                            shrink: true
                        }}
                        InputProps={{
                            style: { color: 'white' }
                        }}
                        style={{ marginBottom: '20px' }}
                    />
                    <FormControl fullWidth variant="outlined" style={{ marginBottom: '20px' }}>
                        <InputLabel style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Duration</InputLabel>
                        <Select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            label="Duration"
                            style={{ color: 'white' }}
                        >
                            <MenuItem value="15">15 minutes</MenuItem>
                            <MenuItem value="30">30 minutes</MenuItem>
                            <MenuItem value="45">45 minutes</MenuItem>
                            <MenuItem value="60">1 hour</MenuItem>
                            <MenuItem value="90">1.5 hours</MenuItem>
                            <MenuItem value="120">2 hours</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenScheduleDialog(false)} style={{ color: 'white' }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleScheduleMeeting} 
                        variant="contained"
                        disabled={!scheduleDate || !scheduleTime}
                        style={{
                            background: 'linear-gradient(45deg, #38bdf8, #0ea5e9)',
                            color: 'white'
                        }}
                    >
                        Schedule
                    </Button>
                </DialogActions>
            </Dialog>
            
            <Footer />
        </>
    )
}


export default withAuth(HomeComponent)