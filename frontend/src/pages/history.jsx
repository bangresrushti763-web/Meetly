import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import { IconButton } from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import "../App.css";

export default function History() {


    const { getHistoryOfUser } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([])


    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch {
                // IMPLEMENT SNACKBAR
            }
        }

        fetchHistory();
    }, [getHistoryOfUser])

    let formatDate = (dateString) => {

        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();

        return `${day}/${month}/${year}`

    }

    return (
        <div>
            <Header showHistory={false} showLogout={true} />

            <div style={{ marginTop: '100px', padding: '20px' }}>
                <IconButton onClick={() => {
                    routeTo("/home")
                }} style={{ color: 'white', marginBottom: '20px' }}>
                    <HomeIcon />
                </IconButton >
                {
                    (meetings.length !== 0) ? meetings.map((e, i) => {
                        return (

                            <Card key={i} variant="outlined" style={{ 
                                background: 'rgba(15, 23, 42, 0.8)', 
                                color: 'white', 
                                marginBottom: '20px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>


                                <CardContent>
                                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                        Code: {e.meetingCode}
                                    </Typography>

                                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                        Date: {formatDate(e.date)}
                                    </Typography>

                                </CardContent>


                            </Card>


                        )
                    }) : (
                        <div style={{ 
                            textAlign: 'center', 
                            color: 'white', 
                            marginTop: '50px',
                            fontSize: '1.2rem'
                        }}>
                            No meeting history found
                        </div>
                    )

                }
            </div>

            <Footer />
        </div>
    )
}