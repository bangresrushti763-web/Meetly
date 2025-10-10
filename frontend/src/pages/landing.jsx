import React from 'react'
import "../App.css"
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'

export default function LandingPage() {
    const router = useNavigate();

    return (
        <div className='landingPageContainer'>
            <div>
                {/* Navigation content */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '1.2rem',
                    marginBottom: '1rem'
                }}>
                    <div className='navHeader'>
                        <h2>ProfessionalMeet</h2>
                    </div>
                    <div className='navlist' style={{ display: 'flex', gap: '1.6rem', cursor: 'pointer', alignItems: 'center' }}>
                        <p onClick={() => {
                            router("/auth")
                        }}>Join Meeting</p>
                        <p onClick={() => {
                            router("/auth")
                        }}>Register</p>
                        <div onClick={() => {
                            router("/auth")
                        }} role='button' style={{ 
                            background: 'linear-gradient(45deg, #38bdf8, #0ea5e9)',
                            padding: '8px 16px',
                            borderRadius: '8px'
                        }}>
                            <p style={{ margin: 0 }}>Login</p>
                        </div>
                    </div>
                </div>
                
                <div className="landingMainContainer">
                    <div>
                        <h1><span style={{ background: 'linear-gradient(45deg, #38bdf8, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Professional Video Meetings</span> for Modern Teams</h1>

                        <p>Experience crystal-clear video, advanced security, and powerful collaboration tools designed for the modern workplace.</p>
                        
                        <div role='button'>
                            <Link to={"/auth"}>Get Started</Link>
                        </div>
                    </div>
                    <div>
                        <img 
                            src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
                            alt="Professional meeting" 
                        />
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}