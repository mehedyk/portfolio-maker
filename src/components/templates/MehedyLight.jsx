/**
 * ============================================================================
 * MEHEDY LIGHT TEMPLATE
 * Clean, professional light theme based on mehedy.netlify.app design
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { downloadCV } from '../../utils/cvDownload';
import './MehedyLight.css';

const MehedyLight = ({ portfolio, content, images, specialty_info, onToggleTheme, isDarkMode }) => {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home'); // Assuming 'home' is the initial active section

    const handleDownloadCV = () => {
        downloadCV(portfolio, content, images, specialty_info);
    };

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
            setScrolled(window.scrollY > 50); // Set scrolled state based on scroll position
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToSection = (e, sectionId) => {
        e.preventDefault();
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection(sectionId);
            setMobileMenuOpen(false); // Close mobile menu on section click
        }
    };

    return (
        <div className="mehedy-light-template">
            {/* Navigation */}
            <nav className={`ml-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="ml-container ml-nav-content">
                    <div className="ml-logo">
                        {portfolio?.user_profiles?.full_name || 'Portfolio'}
                    </div>

                    <div className="ml-nav-links desktop">
                        <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className={activeSection === 'about' ? 'active' : ''}>About</a>
                        {content?.skills?.length > 0 && (
                            <a href="#skills" onClick={(e) => scrollToSection(e, 'skills')} className={activeSection === 'skills' ? 'active' : ''}>Skills</a>
                        )}
                        {content?.experience?.length > 0 && (
                            <a href="#journey" onClick={(e) => scrollToSection(e, 'journey')} className={activeSection === 'journey' ? 'active' : ''}>Experience</a>
                        )}
                        {content?.projects?.length > 0 && (
                            <a href="#projects" onClick={(e) => scrollToSection(e, 'projects')} className={activeSection === 'projects' ? 'active' : ''}>Projects</a>
                        )}
                        {/* Assuming 'services' is always present or handled differently */}
                        <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className={activeSection === 'services' ? 'active' : ''}>Services</a>
                        <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className={`ml-btn-primary ${activeSection === 'contact' ? 'active' : ''}`}>Hire Me</a>

                        {/* Theme Toggle Button */}
                        <button
                            onClick={onToggleTheme}
                            className="theme-toggle-btn"
                            aria-label="Toggle Dark Mode"
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--ml-border)',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                marginLeft: '1rem',
                                fontSize: '1.2rem',
                                color: 'var(--ml-text-primary)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                    </div>

                    <div className="ml-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
                <div className="ml-mobile-menu">
                    <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className={activeSection === 'about' ? 'active' : ''}>About</a>
                    {content?.skills?.length > 0 && (
                        <a href="#skills" onClick={(e) => scrollToSection(e, 'skills')} className={activeSection === 'skills' ? 'active' : ''}>Skills</a>
                    )}
                    {content?.experience?.length > 0 && (
                        <a href="#journey" onClick={(e) => scrollToSection(e, 'journey')} className={activeSection === 'journey' ? 'active' : ''}>Experience</a>
                    )}
                    {content?.projects?.length > 0 && (
                        <a href="#projects" onClick={(e) => scrollToSection(e, 'projects')} className={activeSection === 'projects' ? 'active' : ''}>Projects</a>
                    )}
                    <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className={activeSection === 'services' ? 'active' : ''}>Services</a>
                    <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className={`ml-btn-primary ${activeSection === 'contact' ? 'active' : ''}`}>Hire Me</a>
                    <button
                        onClick={onToggleTheme}
                        className="theme-toggle-btn"
                        aria-label="Toggle Dark Mode"
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--ml-border)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            marginTop: '1rem',
                            fontSize: '1.2rem',
                            color: 'var(--ml-text-primary)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                </div>
            )}

            {/* Hero Section */}
            <section className="ml-hero">
                <div className="ml-container">
                    <div className="ml-hero-content">
                        {/* Profile Image */}
                        {images?.profile && (
                            <div className="ml-profile-wrapper">
                                <img
                                    src={images.profile}
                                    alt={portfolio?.user_profiles?.full_name}
                                    className="ml-profile-image"
                                />
                            </div>
                        )}

                        {/* Name and Title */}
                        <h1 className="ml-hero-name">
                            {portfolio?.user_profiles?.full_name || 'Your Name'}
                        </h1>
                        <p className="ml-hero-title">
                            {portfolio?.professions?.name || 'Professional'}
                        </p>

                        {/* Social Links */}
                        <div className="ml-social-links">
                            {content?.contact?.linkedin && (
                                <a href={content.contact.linkedin} target="_blank" rel="noopener noreferrer" className="ml-social-link">
                                    in
                                </a>
                            )}
                            {content?.contact?.github && (
                                <a href={content.contact.github} target="_blank" rel="noopener noreferrer" className="ml-social-link">
                                    gh
                                </a>
                            )}
                            {content?.contact?.email && (
                                <a href={`mailto:${content.contact.email}`} className="ml-social-link">
                                    @
                                </a>
                            )}
                            {content?.contact?.website && (
                                <a href={content.contact.website} target="_blank" rel="noopener noreferrer" className="ml-social-link">
                                    🌐
                                </a>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="ml-stats">
                            <div className="ml-stat-item">
                                <div className="ml-stat-number">
                                    {content?.experience?.length || 0}+
                                </div>
                                <div className="ml-stat-label">Years Experience</div>
                            </div>
                            <div className="ml-stat-item">
                                <div className="ml-stat-number">
                                    {content?.projects?.length || 0}+
                                </div>
                                <div className="ml-stat-label">Projects Done</div>
                            </div>
                            <div className="ml-stat-item">
                                <div className="ml-stat-number">
                                    {portfolio?.view_count || 0}
                                </div>
                                <div className="ml-stat-label">Portfolio Views</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Me Section */}
            <section id="about" className="ml-section">
                <div className="ml-container">
                    <h2 className="ml-section-title">ABOUT ME</h2>
                    <div className="ml-about-content">
                        <p className="ml-about-text">
                            {content?.about || 'No information provided yet.'}
                        </p>
                    </div>
                </div>
            </section>

            {/* My Journey Section (Experience Timeline) */}
            {content?.experience && content.experience.length > 0 && (
                <section id="journey" className="ml-section ml-section-alt">
                    <div className="ml-container">
                        <h2 className="ml-section-title">MY JOURNEY</h2>
                        <div className="ml-timeline">
                            {content.experience.map((exp, index) => (
                                <div key={index} className="ml-timeline-item">
                                    <div className="ml-timeline-dot"></div>
                                    <div className="ml-timeline-content">
                                        <div className="ml-timeline-year">{exp.duration || 'Date'}</div>
                                        <h3 className="ml-timeline-title">{exp.position}</h3>
                                        <p className="ml-timeline-company">{exp.company}</p>
                                        <p className="ml-timeline-desc">{exp.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Skills & Expertise Section */}
            {content?.skills && content.skills.length > 0 && (
                <section id="skills" className="ml-section">
                    <div className="ml-container">
                        <h2 className="ml-section-title">SKILLS & EXPERTISE</h2>
                        <div className="ml-skills-grid">
                            {content.skills.map((skill, index) => (
                                <div key={index} className="ml-skill-badge">
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Projects Section */}
            {content?.projects && content.projects.length > 0 && (
                <section id="projects" className="ml-section ml-section-alt">
                    <div className="ml-container">
                        <h2 className="ml-section-title">FEATURED PROJECTS</h2>
                        <div className="ml-projects-grid">
                            {content.projects.map((project, index) => (
                                <div key={index} className="ml-project-card">
                                    <div className="ml-project-header">
                                        <h3 className="ml-project-title">{project.title}</h3>
                                        {project.link && (
                                            <a
                                                href={project.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ml-project-link"
                                            >
                                                →
                                            </a>
                                        )}
                                    </div>
                                    <p className="ml-project-desc">{project.description}</p>
                                    {project.technologies && (
                                        <div className="ml-project-tech">
                                            {project.technologies.split(',').map((tech, i) => (
                                                <span key={i} className="ml-tech-tag">
                                                    {tech.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Services Section (if doctor - show booking) */}
            <section id="services" className="ml-section">
                <div className="ml-container">
                    <h2 className="ml-section-title">SERVICES</h2>

                    {/* Doctor Booking Section */}
                    {specialty_info?.booking_email && (
                        <div className="ml-booking-card">
                            <h3>Book a Session</h3>
                            {specialty_info.doctor_type && (
                                <p className="ml-specialty">
                                    Specialty: {specialty_info.doctor_type}
                                </p>
                            )}
                            <a
                                href={`mailto:${specialty_info.booking_email}?subject=Appointment Request&body=Hello, I would like to schedule an appointment.`}
                                className="ml-book-btn"
                            >
                                Schedule Appointment
                            </a>
                        </div>
                    )}

                    {/* Generic Services */}
                    <div className="ml-services-grid">
                        <div className="ml-service-card">
                            <h3>Consultation</h3>
                            <p>Professional consultation services</p>
                        </div>
                        <div className="ml-service-card">
                            <h3>Collaboration</h3>
                            <p>Open to collaborative projects</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog & Insights Section (Education) */}
            {content?.education && content.education.length > 0 && (
                <section className="ml-section ml-section-alt">
                    <div className="ml-container">
                        <h2 className="ml-section-title">EDUCATION & CREDENTIALS</h2>
                        <div className="ml-education-grid">
                            {content.education.map((edu, index) => (
                                <div key={index} className="ml-education-card">
                                    <div className="ml-edu-year">{edu.year}</div>
                                    <h3 className="ml-edu-degree">{edu.degree}</h3>
                                    <p className="ml-edu-institution">{edu.institution}</p>
                                    {edu.description && (
                                        <p className="ml-edu-desc">{edu.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Get In Touch Section */}
            <section id="contact" className="ml-section ml-contact-section">
                <div className="ml-container">
                    <h2 className="ml-section-title">GET IN TOUCH</h2>
                    <div className="ml-contact-content">
                        <p className="ml-contact-intro">
                            Let's connect and discuss how we can work together.
                        </p>

                        <div className="ml-contact-methods">
                            {content?.contact?.email && (
                                <div className="ml-contact-method">
                                    <span className="ml-contact-label">Email</span>
                                    <a href={`mailto:${content.contact.email}`} className="ml-contact-value">
                                        {content.contact.email}
                                    </a>
                                </div>
                            )}
                            {content?.contact?.phone && (
                                <div className="ml-contact-method">
                                    <span className="ml-contact-label">Phone</span>
                                    <a href={`tel:${content.contact.phone}`} className="ml-contact-value">
                                        {content.contact.phone}
                                    </a>
                                </div>
                            )}
                            {content?.contact?.linkedin && (
                                <div className="ml-contact-method">
                                    <span className="ml-contact-label">LinkedIn</span>
                                    <a href={content.contact.linkedin} target="_blank" rel="noopener noreferrer" className="ml-contact-value">
                                        Connect with me
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Download CV Button */}
                        <div className="ml-cv-download">
                            <button className="ml-download-cv-btn" onClick={handleDownloadCV}>
                                Download CV
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="ml-footer">
                <div className="ml-container">
                    <div className="ml-footer-content">
                        <p className="ml-footer-text">
                            © {new Date().getFullYear()} {portfolio?.user_profiles?.full_name}. Built with Portfolio Builder.
                        </p>
                        <div className="ml-footer-social">
                            {content?.contact?.linkedin && (
                                <a href={content.contact.linkedin} target="_blank" rel="noopener noreferrer">in</a>
                            )}
                            {content?.contact?.github && (
                                <a href={content.contact.github} target="_blank" rel="noopener noreferrer">gh</a>
                            )}
                            {content?.contact?.email && (
                                <a href={`mailto:${content.contact.email}`}>@</a>
                            )}
                        </div>
                    </div>
                </div>
            </footer>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button className="ml-scroll-top" onClick={scrollToTop}>
                    ↑
                </button>
            )}
        </div>
    );
};

export default MehedyLight;