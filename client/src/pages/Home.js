import React, { useState,useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import GhostCursor from '../utils/GhostCursor'; 
import './Home.css';

function Home() {
    const { authData } = useContext(AuthContext);
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get('http://localhost:5000/events');
                setEvents(res.data);
                setLoadingEvents(false);
            }catch(err){
                console.error("Error fetching events:",err);
                setLoadingEvents(false);
            }
        };
        fetchEvents();
    }, []);
    const getEventDateParts = (dateString) => {
        if(!dateString) return {month : 'TBA', day: '--'};
        const date = new Date(dateString);
        return {
            month: date.toLocaleString('default', { month: 'short'}).toUpperCase(),
            day: date.getDate().toString().padStart(2,'0')
        };
    };  
    
    // --- STATE: Excuse Generator ---
    const [jargon, setJargon] = useState("System Ready. Awaiting Input...");
    
    // --- STATE: Ticker Items ---
    const tickerItems = [
        "CAFFEINE LEVELS: CRITICAL ⚠",
        "GPA VOLATILITY: HIGH 〽",
        "SLEEP HOURS: ⁴⁰⁴ NOT FOUND ✗",
        "ASSIGNMENT BACKLOG: BULLISH ⤴",
        "SOCIAL LIFE: DEPRECATED 🗑",
        "IMPULSE BUYING: OPTIMIZED $",
        "MOTIVATION: BUFFERING ⟲",
        "HOTEL: TRIVAGO ⛱"
    ];

    const generateExcuse = () => {
        const myExcuses = [
            "Can't, i have to sleep.",
            "Im not even supposed to be here today.",
            "I need to return some videotapes.",
            "Someone stole my cat.",
            "I have 2 kids you know how it is.",
            "Diarrhea.",
            "(scratches head)* What ha..happened.",
            "It wasn't me.",
            "I was adopted.",
            "Hang on i was just looking for something here...hmmm maybe its here.(walks out of the room)*",
            "I gotta hang out with my dog.",
            "gomu gomu noooo"
        ];
        const intros = [
            "Okay, so hear me out, I was literally just about to start working, but then ",
            "I swear to god I am not making this up, but basically ",
            "I know this sounds like a lie, but honestly ",
            "Look, I was fully prepared to be a responsible adult today, but ",
            "I’m gonna be real with you, everything was going fine until ",
            "You are not gonna believe this, but ",
            "I am so sorry, but the universe hates me because ",
            "I was actually walking out the door, and then "
        ];

        const middles = [
            "my roommate decided to microwave aluminum foil and set the fire alarm off ",
            "I took a 'five minute nap' that somehow lasted for six hours ",
            "my laptop decided to do a system update for no reason and it's been stuck at 99% forever ",
            "I went to get an iced coffee and got stuck in line for forty minutes ",
            "I realized I left my brain at home and had to go back to find it ",
            "I saw a really cute dog and I got distracted for way too long ",
            "my wifi crashed because my neighbor is stealing it again ",
            "I stared at a blank Word doc until I started hallucinating ",
            "I accidentally got on the wrong bus and now I am in a different city "
        ];

        const ends = [
            "so basically, I’m not gonna make it.",
            "so yeah, I think I just need to lie down and cry.",
            "and honestly, I don't even know what day it is anymore.",
            "so I guess I'll just accept my zero and move on.",
            "and now I’m just sitting here eating cereal instead of coming to class.",
            "so I’m gonna need like, 24 more hours to fix my life.",
            "which means I’m probably gonna be late. Like, very late.",
            "so I'm just gonna go back to sleep. Sorry."
        ];

        const r = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const showCustom = Math.random() < 0.5; 

        if (showCustom) {
            setJargon(r(myExcuses));
        } else {
            setJargon(`${r(intros)} ${r(middles)} ${r(ends)}`);
        }
        
    };

    // --- LOGIC: Alumni Data (Added more for smoother Marquee) ---
    const testimonials = [
        { 
            name: "Rohit Sharma.", 
            role: "Intern at (generic indian startup*)", 
            quote: "I successfully liquidated 3 textbooks the college provided without breaking the seal. Pure ROI.",   
        },
        { 
            name: "Ashok J.", 
            role: "Crisis Lead", 
            quote: "The 'Consensus Nodes' confirmed I wasn't the only one failing. Shared trauma is the best networking.",     
        },
        { 
            name: "Karthik R.", 
            role: "Proxy Specialist", 
            quote: "Found a roommate who doesn't snore. This platform provides critical stability to my sleep architecture at the lowest price.",
        },
        { 
            name: "Pratibha Bhoi.", 
            role: "Student", 
            quote: "Traded my old calculus notes for a functioning coffee maker. Best trade deal in the history of trade deals.",
             
        },
        { 
            name: "Marcus T.", 
            role: "Ops Director", 
            quote: "Used the excuse generator for my chem lab. Professor actually laughed and suspended me. 10/10 would def reccommend.",
        },
        { 
            name: "Priya L.", 
            role: "Logistics", 
            quote: "Found a ride home for the weekend in 5 minutes. Krayaa is faster than Uber and cheaper than the bus.",
        }
        
        
    ];
    const featuredEvent = events.length > 0 ? events[0] : null;
    const listEvents = events.length > 1 ? events.slice(1) : [];

    return (
        <div className="home-container">
            
            {/* --- LAYER 1: GHOST CURSOR BACKGROUND --- */}
            <GhostCursor 
                bloomStrength={0.00000000000002} 
                bloomRadius={0.000001} 
                grainIntensity={0.00008}
            />
             

            {/* --- LAYER 2: CONTENT --- */}
            <div className="content-layer">
                
                {/* 1. HERO SECTION */}
                <header className="hero-box">
                    <p className="top-tag">/// EST. 2026 • INTELLECTUAL PROPERTY ///</p>
                    <h1 className="giant-title">KRAYAA</h1>
                    <h2 className="sub-title">The Student <span className="highlight">Synergy</span> Protocol</h2>
                    
                    <p className="hero-desc">
                        A proprietary network for horizontal networking, asset liquidation, 
                        and strategic knowledge sharing. <br/>
                        <span className="satire-note">(A silk road to complain about exams.)</span>
                    </p>

                    <div className="hero-buttons">
                        {!authData.isLoggedIn ? (
                            <button className="btn-glitch" onClick={() => navigate('/login')}>
                                Initiate Onboarding
                            </button>
                        ) : (
                            <button className="btn-glitch" onClick={() => navigate('/dashboard')}>
                                Access Dashboard
                            </button>
                        )}
                        <button className="btn-hollow" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>
                            Read Manifesto
                        </button>
                    </div>
                </header>

                {/* 2. VOLATILITY TICKER */}
                <div className="ticker-wrap">
                    <div className="ticker">
                        {tickerItems.map((item, i) => <span key={i} className="ticker-item">{item}</span>)}
                        {tickerItems.map((item, i) => <span key={`dup-${i}`} className="ticker-item">{item}</span>)}
                    </div>
                </div>

                {/* 3. CORE VERTICALS (Grid) */}
                <section className="verticals-grid">
                    <Link to="/forums" className="vertical-card">
                        <div className="card-top">
                            <span className="card-id">01</span>
                            <div className="ps-icon ps-triangle"></div>
                        </div>
                        <h3>Consensus Nodes</h3>
                        <p>Engage in distributed decision making regarding why the cafeteria food tastes like cardboard.</p>
                        <div className="card-meta">
                            <span>Traffic: <span className="green-text">HEAVY</span></span>
                        </div>
                    </Link>

                    <Link to="/buy-sell" className="vertical-card">
                        <div className="card-top">
                            <span className="card-id">02</span>
                            <div className="ps-icon ps-shifter"></div>
                        </div>
                        <h3>Asset Liquidation</h3>
                        <p>Offload depreciating assets (textbooks) to improve your personal liquidity ratios.</p>
                        <div className="card-meta">
                            <span>Market: <span className="green-text">VOLATILE</span></span>
                        </div>
                    </Link>

                    <Link to="/resources" className="vertical-card">
                        <div className="card-top">
                            <span className="card-id">03</span>
                            <div className="ps-icon ps-cross"></div>
                        </div>
                        <h3>Legacy Archives</h3>
                        <p>Access classified documents (notes) from previous operational cycles (semesters).</p>
                        <div className="card-meta">
                            <span>Access: <span className="green-text">GRANTED</span></span>
                        </div>
                    </Link>
                </section>

                {/* 4. INTERACTIVE TOOL: EXCUSE GENERATOR */}
                <section className="tool-section">
                    <div className="tool-box">
                        <h4 className="tool-header">
                            <span className="icon">⚙️</span> 
                            PROFESSIONAL EXCUSE GENERATOR V1.0
                        </h4>
                        <div className="console-display">
                            &gt; {jargon}
                            <span className="cursor-blink">_</span>
                        </div>
                        <button onClick={generateExcuse} className="btn-tool">
                            GENERATE EXCUSE
                        </button>
                        <p className="tool-sub">Use this when you miss a deadline. Works 60% of the time, every time.</p>
                    </div>
                </section>
                
                {/* 5. SUCCESS METRICS MARQUEE (UPDATED) */}
                <section className="testimonials-section">
                    <h2 className="section-header">SUCCESS METRICS</h2>
                    
                    {/* The Wrapper handles the overflow hiding */}
                    <div className="metrics-marquee-wrapper">
                        {/* The Track handles the sliding animation */}
                        <div className="metrics-track">
                            {/* ORIGINAL SET */}
                            {testimonials.map((t, i) => (
                                <div key={i} className="alumni-card">
                                     
                                    <div className="quote">"{t.quote}"</div>
                                    <div className="person">
                                        {t.name} <br/>
                                        <span className="role">{t.role}</span>
                                    </div>
                                </div>
                            ))}
                            
                            {/* DUPLICATE SET (For seamless loop) */}
                            {testimonials.map((t, i) => (
                                <div key={`dup-${i}`} className="alumni-card">
                                    <div className="test-metric">{t.metric}</div>
                                    <div className="quote">"{t.quote}"</div>
                                    <div className="person">
                                        {t.name} <br/>
                                        <span className="role">{t.role}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
             {/* --- 6. EVENTS SECTION (DYNAMIC DATA) --- */}
                <section className="events-section">
                    <div className="section-header-row">
                        <h2 className="section-header">UPCOMING OPERATIONS</h2>
                        <span className="live-badge">● LIVE FEED</span>
                    </div>

                    {loadingEvents ? (
                        <div className="empty-state">Loading Intel...</div>
                    ) : (
                        <div className="events-layout">
                            
                            {/* LEFT: FEATURED CARD (Takes the 1st event from backend) */}
                            {featuredEvent ? (
                                <div className="event-featured">
                                    <div className="event-img-wrapper">
                                        <img 
                                            src={featuredEvent.imageUrl || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070"} 
                                            alt={featuredEvent.title} 
                                            className="featured-img" 
                                        />
                                        <div className="img-overlay"></div>
                                        <div className="featured-badge">FEATURED</div>
                                    </div>
                                    <div className="featured-content">
                                        <div className="featured-date">
                                            {new Date(featuredEvent.eventDate).toDateString()}
                                        </div>
                                        <h3>{featuredEvent.title}</h3>
                                        <p>{featuredEvent.description}</p>
                                        {featuredEvent.registrationLink && (
                                            <a 
                                                href={featuredEvent.registrationLink} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="btn-event-action"
                                            >
                                                RSVP NOW_
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="event-featured">
                                    <div className="featured-content">
                                        <h3>No Operations Scheduled.</h3>
                                        <p>The system is currently dormant.</p>
                                    </div>
                                </div>
                            )}

                            {/* RIGHT: LIST OF EVENTS (Takes the rest) */}
                            <div className="events-list-container">
                                {listEvents.length > 0 ? listEvents.map((event) => {
                                    const { month, day } = getEventDateParts(event.eventDate);
                                    return (
                                        <div key={event._id} className="event-row">
                                            <div className="event-date-box">
                                                <span className="ev-month">{month}</span>
                                                <span className="ev-day">{day}</span>
                                            </div>
                                            <div className="event-details">
                                                <div className="event-top-line">
                                                    <h4>{event.title}</h4>
                                                    {/* If you don't have a status field, we can default to 'OPEN' or check date */}
                                                    <span className="status-tag open">OPEN</span>
                                                </div>
                                                <p className="event-loc">📍 Campus</p> {/* Default location if not in DB */}
                                                <p className="event-desc">{event.description}</p>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="event-terminal-footer">
                                        <span>/// NO ADDITIONAL OPERATIONS ///</span>
                                    </div>
                                )}
                                
                                <div className="event-terminal-footer">
                                    <span>/// END OF LOG ///</span>
                                </div>
                            </div>

                        </div>
                    )}
                </section>

                            {/* 7. FOOTER */}
            <footer className="footer-bar">
                <div className="footer-left">KRAYAA. © 2026</div>
                <div className="footer-links">
                   <Link to="/terms">Terms & Conditions</Link>
                      <span className="separator">/</span>
                    <Link to="/code-of-conduct">Code of Conduct</Link>
                </div>
                <div className="footer-right">
                    <span>STAY CURIOUS • STAY HIDDEN</span>
                </div>
            </footer>
        </div>
        </div>
    );
}

export default Home;