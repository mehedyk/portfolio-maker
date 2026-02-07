/**
 * ============================================================================
 * MEHEDY DARK TEMPLATE
 * Clean, professional dark theme based on mehedy.netlify.app dark mode
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { downloadCV } from '../../utils/cvDownload';
import './MehedyDark.css';

const MehedyDark = ({ portfolio, content, images, specialty_info, onToggleTheme, isDarkMode }) => {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    const handleDownloadCV = () => {
        downloadCV(portfolio, content, images, specialty_info);
    };

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
            setScrolled(window.scrollY > 50); // For nav bar scroll effect
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
        <div className="mehedy-dark-template">
            {/* Navigation */}
            <nav className={`md-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="md-container md-nav-content">
                    <div className="md-nav-brand">
                        {portfolio?.user_profiles?.full_name || 'Portfolio'}
                    </div>
                    <div className="md-nav-links desktop">
                        <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className={activeSection === 'about' ? 'active' : ''}>About</a>
                        {content.skills?.length > 0 && (
                            <a href="#skills" onClick={(e) => scrollToSection(e, 'skills')} className={activeSection === 'skills' ? 'active' : ''}>Skills</a>
                        )}
                        {content.experience?.length > 0 && (
                            <a href="#journey" onClick={(e) => scrollToSection(e, 'journey')} className={activeSection === 'journey' ? 'active' : ''}>Journey</a>
                        )}
                        {content.projects?.length > 0 && (
                            <a href="#projects" onClick={(e) => scrollToSection(e, 'projects')} className={activeSection === 'projects' ? 'active' : ''}>Projects</a>
                        )}
                        {content.services?.length > 0 && (
                            <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className={activeSection === 'services' ? 'active' : ''}>Services</a>
                        )}
                        <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className={`md-btn-primary ${activeSection === 'contact' ? 'active' : ''}`}>Hire Me</a>

                        {/* Theme Toggle Button */}
                        <button
                            onClick={onToggleTheme}
                            className="theme-toggle-btn"
                            aria-label="Toggle Light Mode"
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--md-border)',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                marginLeft: '1rem',
                                fontSize: '1.2rem',
                                color: 'var(--md-text-primary)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                    </div>

                    <div className="md-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
                <div className="md-mobile-menu">
                    <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className={activeSection === 'about' ? 'active' : ''}>About</a>
                    {content?.skills?.length > 0 && (
                        <a href="#skills" onClick={(e) => scrollToSection(e, 'skills')} className={activeSection === 'skills' ? 'active' : ''}>Skills</a>
                    )}
                    {content?.experience?.length > 0 && (
                        <a href="#journey" onClick={(e) => scrollToSection(e, 'journey')} className={activeSection === 'journey' ? 'active' : ''}>Journey</a>
                    )}
                    {content?.projects?.length > 0 && (
                        <a href="#projects" onClick={(e) => scrollToSection(e, 'projects')} className={activeSection === 'projects' ? 'active' : ''}>Projects</a>
                    )}
                    <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className={activeSection === 'services' ? 'active' : ''}>Services</a>
                    <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className={`md-btn-primary ${activeSection === 'contact' ? 'active' : ''}`}>Hire Me</a>

                    <button
                        onClick={onToggleTheme}
                        className="theme-toggle-btn"
                        aria-label="Toggle Light Mode"
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--md-border)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            marginTop: '1rem',
                            fontSize: '1.2rem',
                            color: 'var(--md-text-primary)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                </div>
            )}

            {/* Hero Section */}
            <section className="md-hero">
                <div className="md-container">
                    <div className="md-hero-content">
                        {/* Profile Image */}
                        {images?.profile && (
                            <div className="md-profile-wrapper">
                                <img
                                    src={images.profile}
                                    alt={portfolio?.user_profiles?.full_name}
                                    className="md-profile-image"
                                />
                            </div>
                        )}

                        {/* Name and Title */}
                        <h1 className="md-hero-name">
                            {portfolio?.user_profiles?.full_name || 'Your Name'}
                        </h1>
                        <p className="md-hero-title">
                            {portfolio?.professions?.name || 'Professional'}
                        </p>

                        {/* Social Links */}
                        <div className="md-social-links">
                            {content?.contact?.linkedin && (
                                <a href={content.contact.linkedin} target="_blank" rel="noopener noreferrer" className="md-social-link">
                                    in
                                </a>
                            )}
                            {content?.contact?.github && (
                                <a href={content.contact.github} target="_blank" rel="noopener noreferrer" className="md-social-link">
                                    gh
                                </a>
                            )}
                            {content?.contact?.email && (
                                <a href={`mailto:${content.contact.email}`} className="md-social-link">
                                    @
                                </a>
                            )}
                            {content?.contact?.website && (
                                <a href={content.contact.website} target="_blank" rel="noopener noreferrer" className="md-social-link">
                                    🌐
                                </a>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="md-stats">
                            <div className="md-stat-item">
                                <div className="md-stat-number">
                                    {content?.experience?.length || 0}+
                                </div>
                                <div className="md-stat-label">Years Experience</div>
                            </div>
                            <div className="md-stat-item">
                                <div className="md-stat-number">
                                    {content?.projects?.length || 0}+
                                </div>
                                <div className="md-stat-label">Projects Done</div>
                            </div>
                            <div className="md-stat-item">
                                <div className="md-stat-number">
                                    {portfolio?.view_count || 0}
                                </div>
                                <div className="md-stat-label">Portfolio Views</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Me Section */}
            <section id="about" className="md-section">
                <div className="md-container">
                    <h2 className="md-section-title">ABOUT ME</h2>
                    <div className="md-about-content">
                        <p className="md-about-text">
                            {content?.about || 'No information provided yet.'}
                        </p>
                    </div>
                </div>
            </section>

            {/* My Journey Section (Experience Timeline) */}
            {content?.experience && content.experience.length > 0 && (
                <section id="journey" className="md-section md-section-alt">
                    <div className="md-container">
                        <h2 className="md-section-title">MY JOURNEY</h2>
                        <div className="md-timeline">
                            {content.experience.map((exp, index) => (
                                <div key={index} className="md-timeline-item">
                                    <div className="md-timeline-dot"></div>
                                    <div className="md-timeline-content">
                                        <div className="md-timeline-year">{exp.duration || 'Date'}</div>
                                        <h3 className="md-timeline-title">{exp.position}</h3>
                                        <p className="md-timeline-company">{exp.company}</p>
                                        <p className="md-timeline-desc">{exp.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Skills & Expertise Section */}
            {content?.skills && content.skills.length > 0 && (
                <section id="skills" className="md-section">
                    <div className="md-container">
                        <h2 className="md-section-title">SKILLS & EXPERTISE</h2>
                        <div className="md-skills-grid">
                            {content.skills.map((skill, index) => (
                                <div key={index} className="md-skill-badge">
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Projects Section */}
            {content?.projects && content.projects.length > 0 && (
                <section id="projects" className="md-section md-section-alt">
                    <div className="md-container">
                        <h2 className="md-section-title">FEATURED PROJECTS</h2>
                        <div className="md-projects-grid">
                            {content.projects.map((project, index) => (
                                <div key={index} className="md-project-card">
                                    <div className="md-project-header">
                                        <h3 className="md-project-title">{project.title}</h3>
                                        {project.link && (
                                            <a
                                                href={project.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="md-project-link"
                                            >
                                                →
                                            </a>
                                        )}
                                    </div>
                                    <p className="md-project-desc">{project.description}</p>
                                    {project.technologies && (
                                        <div className="md-project-tech">
                                            {project.technologies.split(',').map((tech, i) => (
                                                <span key={i} className="md-tech-tag">
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
            <section id="services" className="md-section">
                <div className="md-container">
                    <h2 className="md-section-title">SERVICES</h2>

                    {/* Doctor Booking Section */}
                    {specialty_info?.booking_email && (
                        <div className="md-booking-card">
                            <h3>Book a Session</h3>
                            {specialty_info.doctor_type && (
                                <p className="md-specialty">
                                    Specialty: {specialty_info.doctor_type}
                                </p>
                            )}
                            <a
                                href={`mailto:${specialty_info.booking_email}?subject=Appointment Request&body=Hello, I would like to schedule an appointment.`}
                                className="md-book-btn"
                            >
                                Schedule Appointment
                            </a>
                        </div>
                    )}

                    {/* Generic Services */}
                    <div className="md-services-grid">
                        <div className="md-service-card">
                            <h3>Consultation</h3>
                            <p>Professional consultation services</p>
                        </div>
                        <div className="md-service-card">
                            <h3>Collaboration</h3>
                            <p>Open to collaborative projects</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog & Insights Section (Education) */}
            {content?.education && content.education.length > 0 && (
                <section className="md-section md-section-alt">
                    <div className="md-container">
                        <h2 className="md-section-title">EDUCATION & CREDENTIALS</h2>
                        <div className="md-education-grid">
                            {content.education.map((edu, index) => (
                                <div key={index} className="md-education-card">
                                    <div className="md-edu-year">{edu.year}</div>
                                    <h3 className="md-edu-degree">{edu.degree}</h3>
                                    <p className="md-edu-institution">{edu.institution}</p>
                                    {edu.description && (
                                        <p className="md-edu-desc">{edu.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Get In Touch Section */}
            <section id="contact" className="md-section md-contact-section">
                <div className="md-container">
                    <h2 className="md-section-title">GET IN TOUCH</h2>
                    <div className="md-contact-content">
                        <p className="md-contact-intro">
                            Let's connect and discuss how we can work together.
                        </p>

                        <div className="md-contact-methods">
                            {content?.contact?.email && (
                                <div className="md-contact-method">
                                    <span className="md-contact-label">Email</span>
                                    <a href={`mailto:${content.contact.email}`} className="md-contact-value">
                                        {content.contact.email}
                                    </a>
                                </div>
                            )}
                            {content?.contact?.phone && (
                                <div className="md-contact-method">
                                    <span className="md-contact-label">Phone</span>
                                    <a href={`tel:${content.contact.phone}`} className="md-contact-value">
                                        {content.contact.phone}
                                    </a>
                                </div>
                            )}
                            {content?.contact?.linkedin && (
                                <div className="md-contact-method">
                                    <span className="md-contact-label">LinkedIn</span>
                                    <a href={content.contact.linkedin} target="_blank" rel="noopener noreferrer" className="md-contact-value">
                                        Connect with me
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Download CV Button */}
                        <div className="md-cv-download">
                            <button className="md-download-cv-btn" onClick={handleDownloadCV}>
                                Download CV
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="md-footer">
                <div className="md-container">
                    <div className="md-footer-content">
                        <p className="md-footer-text">
                            © {new Date().getFullYear()} {portfolio?.user_profiles?.full_name}. Built with Portfolio Builder.
                        </p>
                        <div className="md-footer-social">
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
                <button className="md-scroll-top" onClick={scrollToTop}>
                    ↑
                </button>
            )}
        </div>
    );
};

export default MehedyDark;