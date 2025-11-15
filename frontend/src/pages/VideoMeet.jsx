import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField, Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import MeetingNotesUploader from '../components/MeetingNotesUploader';
import LiveSubtitles from '../components/LiveSubtitles';
import MeetingTracker from '../components/MeetingTracker';
import CodeCollab from '../components/CodeCollab';
import AIMeetingNotes from '../components/AIMeetingNotes';
import Polls from '../components/Polls';
import PeopleIcon from '@mui/icons-material/People';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import { useParams } from 'react-router-dom';
import server from '../environment';
import ToggleableAIMeetingNotes from '../components/ToggleableAIMeetingNotes';
import ToggleablePolls from '../components/ToggleablePolls';
import ToggleableMeetingTracker from '../components/ToggleableMeetingTracker';
import ToggleableCodeCollab from '../components/ToggleableCodeCollab';
import ToggleableLiveSubtitles from '../components/ToggleableLiveSubtitles';
import ToggleableWhiteboard from '../components/ToggleableWhiteboard';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {
    const { meetingId } = useParams();
    
    var socketRef = useRef();
    let socketIdRef = useRef();
    let [localMeetingId, setLocalMeetingId] = useState(meetingId || "");

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState(true);

    let [audio, setAudio] = useState(true);

    let [screen, setScreen] = useState(false);

    let [showModal, setModal] = useState(false);

    let [screenAvailable, setScreenAvailable] = useState(true);

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(!meetingId); // Skip username prompt if meetingId is provided

    let [username, setUsername] = useState("");

    let [showParticipants, setShowParticipants] = useState(false);

    let [copied, setCopied] = useState(false);

    let [notification, setNotification] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    useEffect(() => {
        getPermissions();
        
        // If meetingId is provided in URL, auto-join with a default username
        if (meetingId) {
            setUsername("Participant");
            setTimeout(() => {
                setAskForUsername(false);
                getMedia();
            }, 1000);
        }
    }, [meetingId])

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        console.log('getPermissions called');
        try {
            // Check if media devices are supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.log('Media devices API not supported');
                setVideoAvailable(false);
                setAudioAvailable(false);
                return;
            }

            // Try to get video permission
            if (video) {
                console.log('Requesting video permission');
                try {
                    const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoPermission) {
                        setVideoAvailable(true);
                        console.log('Video permission granted');
                        // Stop the tracks immediately to avoid using the camera until needed
                        videoPermission.getTracks().forEach(track => track.stop());
                    }
                } catch (error) {
                    console.log('Video permission denied:', error);
                    setVideoAvailable(false);
                }
            }

            // Try to get audio permission
            if (audio) {
                console.log('Requesting audio permission');
                try {
                    const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
                    if (audioPermission) {
                        setAudioAvailable(true);
                        console.log('Audio permission granted');
                        // Stop the tracks immediately to avoid using the mic until needed
                        audioPermission.getTracks().forEach(track => track.stop());
                    }
                } catch (error) {
                    console.log('Audio permission denied:', error);
                    setAudioAvailable(false);
                }
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }
            
            console.log('Permissions check completed. Video available:', videoAvailable, 'Audio available:', audioAvailable);
        } catch (error) {
            console.log('Error getting permissions:', error);
            // Reset availability flags on error
            setVideoAvailable(false);
            setAudioAvailable(false);
        }
    };

    useEffect(() => {
        if (!askForUsername && video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [askForUsername, video, audio])

    // Cleanup function for when component unmounts
    useEffect(() => {
        return () => {
            try {
                // Stop all tracks when component unmounts
                if (window.localStream) {
                    window.localStream.getTracks().forEach(track => track.stop());
                }
            } catch (e) {
                console.log('Error stopping tracks:', e);
            }
        };
    }, []);

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let getUserMediaSuccess = (stream) => {
        console.log('getUserMediaSuccess called with stream:', stream);
        try {
            // Stop existing tracks if any
            if (window.localStream) {
                console.log('Stopping existing tracks');
                window.localStream.getTracks().forEach(track => track.stop());
            }
        } catch (e) { 
            console.log('Error stopping existing tracks:', e);
        }

        // Set new stream
        window.localStream = stream;
        console.log('Setting window.localStream to:', stream);
        if (localVideoref.current) {
            console.log('Setting srcObject to stream');
            localVideoref.current.srcObject = stream;
            
            // Ensure the video element is playing
            localVideoref.current.play()
                .then(() => console.log('Video play successful'))
                .catch(e => {
                    console.log('Error playing video:', e);
                    // Try to handle the play error
                    if (e.name === 'NotAllowedError') {
                        console.log('Play not allowed, likely due to browser autoplay policies');
                    }
                });
        }

        // Update connections with new stream
        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
                console.log(description);
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                    })
                    .catch(e => console.log(e));
            });
        }

        // Handle track ending
        stream.getTracks().forEach(track => {
            track.onended = () => {
                console.log('Track ended:', track);
                if (track.kind === 'video') {
                    setVideo(false);
                } else if (track.kind === 'audio') {
                    setAudio(false);
                }

                try {
                    let tracks = localVideoref.current?.srcObject?.getTracks();
                    tracks?.forEach(track => track.stop());
                } catch (e) { 
                    console.log(e);
                }

                // Create black silence stream
                let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                window.localStream = blackSilence();
                if (localVideoref.current) {
                    localVideoref.current.srcObject = window.localStream;
                }

                // Update connections with black silence stream
                for (let id in connections) {
                    connections[id].addStream(window.localStream);

                    connections[id].createOffer().then((description) => {
                        connections[id].setLocalDescription(description)
                            .then(() => {
                                socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                            })
                            .catch(e => console.log(e));
                    });
                }
            };
        });
    }

    let getUserMedia = () => {
        console.log('getUserMedia called. Video:', video, 'Video available:', videoAvailable, 'Audio:', audio, 'Audio available:', audioAvailable);
        
        // Check if media devices are supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.log('Media devices API not supported');
            return;
        }
        
        // Improved media constraints
        const constraints = {
            video: video && videoAvailable ? { 
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } : false,
            audio: audio && audioAvailable
        };
        
        console.log('Constraints:', constraints);

        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia(constraints)
                .then(getUserMediaSuccess)
                .catch((e) => {
                    console.error("Error accessing media devices:", e);
                    // Update state to reflect that video is not available
                    if (video && videoAvailable) {
                        setVideoAvailable(false);
                    }
                    // Create a black stream as fallback
                    let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                    let fallbackStream = blackSilence();
                    window.localStream = fallbackStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = fallbackStream;
                    }
                })
        } else {
            try {
                let tracks = localVideoref.current?.srcObject?.getTracks()
                tracks?.forEach(track => track.stop())
                // Create a black stream as fallback
                let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                let fallbackStream = blackSilence();
                window.localStream = fallbackStream;
                if (localVideoref.current) {
                    localVideoref.current.srcObject = fallbackStream;
                }
            } catch (e) { 
                console.log(e);
            }
        }
    }

    let getDislayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()
        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketIdRef.current = socketRef.current.id;
            setLocalMeetingId(socketRef.current.id);

            socketRef.current.emit('join-call', window.location.href)

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    connections[socketListId].onaddstream = (event) => {
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };

                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        let stream = canvas.captureStream(0); // 0 FPS to reduce CPU usage
        let track = stream.getVideoTracks()[0];
        if (track) {
            track.enabled = false;
        }
        return track || stream.getVideoTracks()[0];
    };

    let handleVideo = () => {
        const newVideoState = !video;
        console.log('handleVideo called. New video state:', newVideoState);
        setVideo(newVideoState);
        
        if (!newVideoState) {
            // Turn off video
            console.log('Turning off video');
            try {
                let tracks = localVideoref.current?.srcObject?.getVideoTracks();
                tracks?.forEach(track => {
                    console.log('Stopping track:', track);
                    track.stop();
                });
            } catch (e) { 
                console.log(e);
            }
        } else {
            // Turn on video - Improved video handling
            console.log('Turning on video');
            getPermissions().then(() => {
                if (videoAvailable) {
                    console.log('Video is available, calling getUserMedia');
                    // First, stop any existing tracks
                    try {
                        let tracks = localVideoref.current?.srcObject?.getTracks();
                        tracks?.forEach(track => {
                            console.log('Stopping existing track:', track);
                            track.stop();
                        });
                    } catch (e) { 
                        console.log(e);
                    }
                    
                    // Then request new media stream
                    getUserMedia();
                } else {
                    console.log('Video is not available');
                    // Try to get permissions again
                    getPermissions().then(() => {
                        if (videoAvailable) {
                            getUserMedia();
                        }
                    });
                }
            });
        }
    }
    
    let handleAudio = () => {
        setAudio(!audio)
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen]);
    
    let handleScreen = () => {
        // Only allow screen sharing if we have permission
        if (!screenAvailable) {
            console.log('Screen sharing not available');
            return;
        }
        
        const newScreenStatus = !screen;
        setScreen(newScreenStatus);
        
        // If turning off screen sharing, switch back to camera
        if (!newScreenStatus) {
            getUserMedia();
        }
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current?.srcObject?.getTracks()
            tracks?.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    
    let closeChat = () => {
        setModal(false);
    }
    
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

    let sendMessage = () => {
        socketRef.current.emit('chat-message', message, username)
        setMessage("");
    }

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    const copyMeetingId = () => {
        if (!localMeetingId) {
            setNotification("Meeting ID not available yet. Please wait...");
            return;
        }
        navigator.clipboard.writeText(localMeetingId);
        setCopied(true);
        setNotification("Meeting ID copied to clipboard!");
        setTimeout(() => {
            setCopied(false);
            setNotification("");
        }, 3000);
    }

    const toggleParticipants = () => {
        setShowParticipants(!showParticipants);
    }

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh' 
        }}>
            {askForUsername ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                    background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                    color: 'white'
                }}>
                    <h2 style={{ marginBottom: '30px', fontSize: '2rem' }}>Enter Meeting Lobby</h2>
                    <div style={{ 
                        backgroundColor: 'rgba(30, 41, 59, 0.7)', 
                        padding: '30px', 
                        borderRadius: '15px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                        width: '400px',
                        textAlign: 'center'
                    }}>
                        <TextField 
                            id="outlined-basic" 
                            label="Your Name" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                            variant="outlined" 
                            fullWidth
                            style={{ marginBottom: '20px', backgroundColor: 'white', borderRadius: '4px' }}
                        />
                        <Button 
                            variant="contained" 
                            onClick={connect}
                            style={{ 
                                background: 'linear-gradient(45deg, #38bdf8, #0ea5e9)', 
                                padding: '12px 30px', 
                                fontSize: '1.1rem',
                                borderRadius: '8px'
                            }}
                            disabled={!username.trim()}
                        >
                            Join Meeting
                        </Button>
                    </div>

                    <div style={{ marginTop: '30px' }}>
                        {videoAvailable && (
                            <video ref={localVideoref} autoPlay muted style={{ 
                                width: '300px', 
                                height: '200px', 
                                borderRadius: '10px',
                                border: '2px solid rgba(255, 255, 255, 0.2)'
                            }}></video>
                        )}
                    </div>
                </div>
            ) : (
                <div className={styles.meetVideoContainer} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Meeting Header */}
                    <div className={styles.meetingHeader}>
                        <div className={styles.meetingInfo}>
                            <h2>Professional Meeting</h2>
                            <p>ID: {localMeetingId ? localMeetingId.substring(0, 8) : 'Generating...'}...</p>
                        </div>
                        <div className={styles.meetingActions}>
                            <Button 
                                variant="outlined" 
                                startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                                onClick={copyMeetingId}
                                style={{ 
                                    color: 'white', 
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    textTransform: 'none'
                                }}
                                disabled={!localMeetingId}
                            >
                                {copied ? "Copied!" : "Copy ID"}
                            </Button>
                            <Button 
                                variant="outlined" 
                                startIcon={<PeopleIcon />}
                                onClick={toggleParticipants}
                                style={{ 
                                    color: 'white', 
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    textTransform: 'none'
                                }}
                            >
                                Participants ({videos.length + 1})
                            </Button>
                        </div>
                    </div>

                    {/* Notification */}
                    {notification && (
                        <div className={styles.notification}>
                            <InfoIcon />
                            <span>{notification}</span>
                        </div>
                    )}

                    {/* Participants Panel */}
                    {showParticipants && (
                        <div className={styles.meetingParticipants}>
                            <h3>Meeting Participants</h3>
                            <ul className={styles.participantList}>
                                <li>{username} (You)</li>
                                {videos.map((video, index) => (
                                    <li key={video.socketId}>Participant {index + 1}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Chat Window */}
                    {showModal ? (
                        <div className={styles.chatRoom}>
                            <div className={styles.chatContainer}>
                                <h1>Meeting Chat</h1>
                                <div className={styles.chattingDisplay}>
                                    {messages.length !== 0 ? messages.map((item, index) => (
                                        <div key={index}>
                                            <p>{item.sender}</p>
                                            <p>{item.data}</p>
                                        </div>
                                    )) : <p style={{ textAlign: 'center', opacity: 0.7 }}>No messages yet</p>}
                                </div>
                                <div className={styles.chattingArea}>
                                    <TextField 
                                        value={message} 
                                        onChange={(e) => setMessage(e.target.value)} 
                                        id="outlined-basic" 
                                        label="Type your message" 
                                        variant="outlined" 
                                        fullWidth
                                    />
                                    <Button 
                                        variant='contained' 
                                        onClick={sendMessage}
                                        style={{ 
                                            background: 'linear-gradient(45deg, #38bdf8, #0ea5e9)',
                                            height: '56px'
                                        }}
                                    >
                                        Send
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <MeetingNotesUploader meetingId={localMeetingId} />
                    <ToggleableWhiteboard roomId={window.location.href} />
                    <ToggleableAIMeetingNotes />
                    <ToggleablePolls roomId={window.location.href} isHost={true} />
                    <ToggleableMeetingTracker userId={socketIdRef.current} username={username} />
                    <ToggleableCodeCollab />
                    <ToggleableLiveSubtitles targetLang="es" />
                    {/* Main Content Area */}
                    <div style={{ 
                        flex: 1, 
                        marginTop: '80px', 
                        marginBottom: '80px', 
                        overflowY: 'auto',
                        position: 'relative'
                    }}>
                        <div className={styles.conferenceView}>
                            {videos.map((video) => (
                                <div key={video.socketId}>
                                    <video
                                        data-socket={video.socketId}
                                        ref={(ref) => {
                                            if (ref && video.stream) {
                                                ref.srcObject = video.stream;
                                                // Ensure remote videos play
                                                ref.play().catch(e => console.log('Error playing remote video:', e));
                                            }
                                        }}
                                        autoPlay
                                        playsInline
                                        style={{
                                            width: '100%',
                                            height: '150px',
                                            borderRadius: '8px',
                                            background: '#000',
                                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            objectFit: 'cover'
                                        }}
                                    >
                                    </video>
                                </div>
                            ))}
                        </div>
                        
                        {/* Local video in corner - only show when video is enabled */}
                        {video && videoAvailable && (
                            <div style={{
                                position: 'fixed',
                                bottom: '120px',
                                right: '20px',
                                width: '200px',
                                height: '150px',
                                zIndex: 10,
                                borderRadius: '8px',
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'block'
                            }}>
                                <video
                                    ref={localVideoref}
                                    autoPlay
                                    muted
                                    playsInline
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '8px',
                                        background: '#000',
                                        objectFit: 'cover'
                                    }}
                                    onPlay={() => console.log('Local video is playing')}
                                    onError={(e) => console.log('Local video error:', e)}
                                >
                                </video>
                            </div>
                        )}
                    </div>

                    {/* Control Buttons */}
                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: video ? "white" : "red" }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleEndCall} style={{ color: "white", background: "red", borderRadius: "50%", marginLeft: "20px", marginRight: "20px" }}>
                            <CallEndIcon  />
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{ color: audio ? "white" : "red" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        {/* Live Subtitles Icon */}
                        <IconButton 
                            onClick={() => {
                                // Trigger the live subtitles component
                                document.dispatchEvent(new CustomEvent('toggleLiveSubtitles'));
                            }}
                            style={{ 
                                color: "white", 
                                marginLeft: "10px",
                                background: 'rgba(56, 189, 248, 0.2)',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            className="icon-button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                <polyline points="17 6 23 6 23 12"></polyline>
                            </svg>
                        </IconButton>

                        {/* Upload & Process Icon */}
                        <IconButton 
                            onClick={() => {
                                // Trigger the meeting notes uploader component
                                document.dispatchEvent(new CustomEvent('toggleMeetingNotesUploader'));
                            }}
                            style={{ 
                                color: "white", 
                                marginLeft: "10px",
                                background: 'rgba(56, 189, 248, 0.2)',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            className="icon-button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                        </IconButton>

                        {/* AI Meeting Notes Icon */}
                        <IconButton 
                            onClick={() => {
                                // Trigger the AI meeting notes component
                                document.dispatchEvent(new CustomEvent('toggleAIMeetingNotes'));
                            }}
                            style={{ 
                                color: "white", 
                                marginLeft: "10px",
                                background: 'rgba(56, 189, 248, 0.2)',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            className="icon-button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                        </IconButton>

                        {screenAvailable === true ? (
                            <IconButton onClick={handleScreen} style={{ color: screen ? "#38bdf8" : "white", marginLeft: "20px" }}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton>
                        ) : null}
                            
                        {/* Whiteboard Toggle Button */}
                        <IconButton 
                            onClick={() => {
                                document.dispatchEvent(new CustomEvent('toggleWhiteboard'));
                            }} 
                            style={{ color: "white", marginLeft: "20px" }}
                            className="icon-button"
                        >
                            <EditIcon />
                        </IconButton>

                        <Badge badgeContent={newMessages} max={999} color='primary' style={{ marginLeft: "20px" }}>
                            <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
                                <ChatIcon />                        
                            </IconButton>
                        </Badge>

                        {/* Live Code Collaboration Button */}
                        <IconButton 
                            onClick={() => {
                                // Trigger the code collaboration component
                                document.dispatchEvent(new CustomEvent('toggleCodeCollab'));
                            }}
                            style={{ 
                                color: 'white', 
                                marginLeft: "10px",
                                background: 'rgba(56, 189, 248, 0.2)',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="16 18 22 12 16 6"></polyline>
                                <polyline points="8 6 2 12 8 18"></polyline>
                            </svg>
                        </IconButton>

                        {/* Live Polls & Quizzes Button */}
                        <IconButton 
                            onClick={() => {
                                // Trigger the polls component
                                document.dispatchEvent(new CustomEvent('togglePolls'));
                            }}
                            style={{ 
                                color: 'white', 
                                marginLeft: "10px",
                                background: 'rgba(56, 189, 248, 0.2)',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                        </IconButton>

                        {/* Participation Dashboard Button */}
                        <IconButton 
                            onClick={() => {
                                // Trigger the meeting tracker component
                                document.dispatchEvent(new CustomEvent('toggleMeetingTracker'));
                            }}
                            style={{ 
                                color: 'white', 
                                marginLeft: "10px",
                                background: 'rgba(56, 189, 248, 0.2)',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </IconButton>
                    </div>

                    {/* Footer */}
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        padding: '15px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        fontSize: '0.8rem',
                        backdropFilter: 'blur(10px)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        flexShrink: 0
                    }}>
                        <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{ 
                                width: '8px', 
                                height: '8px', 
                                borderRadius: '50%', 
                                background: '#10b981' 
                            }}></div>
                            <span>© 2025 ProfessionalMeet. All rights reserved.</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}