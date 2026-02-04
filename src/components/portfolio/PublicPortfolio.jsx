import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import './PublicPortfolio.css';

const PublicPortfolio = () => {
    const { username } = useParams();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        fetchPortfolio();
        
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [username]);

    const fetchPortfolio = async () => {
        try {
            const { data, error } = await supabase
                .from('portfolios')
                .select(`
                    *,
                    professions(*),
                    themes(*),
                    user_profiles(full_name, email)
                `)
                .eq('username', username)
                .eq('is_published', true)
                .single();

            if (error) throw error;

            if (data) {
                // Increment view count
                await supabase.rpc('increment_view_count', { portfolio_id: data.id });
                setPortfolio(data);
            }
        } catch (error) {
            console.error('Error fetching portfolio:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p style={{ marginTop: '20px', color: 'var(--gray-600)' }}>Loading portfolio...</p>
            </div>
        );
    }

    if (!portfolio) {
        return (
            <div className="not-found">
                <h1>404</h1>
                <p>Portfolio not found</p>
                <p>Possible reasons:</p>
                <ul>
                    <li>The portfolio has not been published yet</li>
                    <li>The username is incorrect</li>
                    <li>The portfolio has been deleted</li>
                </ul>
                <a href="/" className="btn btn-primary" style={{ marginTop: '32px' }}>
                    Go to Homepage
                </a>
            </div>
        );
    }

    const theme = portfolio.themes;
    const content = portfolio.content || {};
    const images = portfolio.images || {};
    const contact = content.contact || {};

    const themeStyles = {
        '--primary-color': theme?.colors?.primary || '#0ea5e9',
        '--secondary-color': theme?.colors?.secondary || '#06b6d4',
        '--background-color': theme?.colors?.background || '#ffffff',
        '--text-color': theme?.colors?.text || '#1f2937',
    };

    return (
        <div className="public-portfolio" style={themeStyles}>
            {/* Navigation */}
            <nav className="portfolio-nav">
                <div className="container">
                    <div className="portfolio-nav-brand">
                        {portfolio.user_profiles?.full_name || username}
                    </div>
                    <div className="portfolio-nav-links">
                        <a href="#about">About</a>
                        {content.skills?.length > 0 && <a href="#skills">Skills</a>}
                        {content.experience?.length > 0 && <a href="#experience">Experience</a>}
                        {content.projects?.length > 0 && <a href="#projects">Projects</a>}
                        <a href="#contact">Contact</a>
                    </div>
                </div>
            </nav>

            {/* Banner */}
            {images.banner && (
                <div 
                    className="portfolio-banner" 
                    style={{ backgroundImage: `url(${images.banner})` }}
                />
            )}

            {/* Header */}
            <header className="portfolio-header">
                <div className="container">
                    {images.profile && (
                        <div className="profile-image-wrapper">
                            <img 
                                src={images.profile} 
                                alt={portfolio.user_profiles?.full_name || username}
                                className="profile-image" 
                            />
                        </div>
                    )}
                    <h1>{portfolio.user_profiles?.full_name || username}</h1>
                    <p className="profession">{portfolio.professions?.name || 'Professional'}</p>
                    
                    {(contact.linkedin || contact.github || contact.website || contact.email) && (
                        <div className="social-links">
                            {contact.email && (
                                <a href={`mailto:${contact.email}`} className="social-link" aria-label="Email">
                                    ✉️
                                </a>
                            )}
                            {contact.linkedin && (
                                <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                                    💼
                                </a>
                            )}
                            {contact.github && (
                                <a href={contact.github} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
                                    💻
                                </a>
                            )}
                            {contact.website && (
                                <a href={contact.website} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Website">
                                    🌐
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* About Section */}
            {content.about && (
                <section id="about" className="portfolio-section">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-badge">
                                <span>👤</span>
                                <span>About Me</span>
                            </span>
                            <h2>Who I Am</h2>
                            <div className="section-divider"></div>
                        </div>
                        <div className="about-content">
                            <p className="about-text">{content.about}</p>
                        </div>
                    </div>
                </section>
            )}

            {/* Skills Section */}
            {content.skills && content.skills.length > 0 && (
                <section id="skills" className="portfolio-section">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-badge">
                                <span>⚡</span>
                                <span>Skills</span>
                            </span>
                            <h2>What I Do Best</h2>
                            <div className="section-divider"></div>
                        </div>
                        <div className="skills-grid">
                            {content.skills.map((skill, index) => (
                                <div key={index} className="skill-badge">
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Experience Section */}
            {content.experience && content.experience.length > 0 && (
                <section id="experience" className="portfolio-section">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-badge">
                                <span>💼</span>
                                <span>Experience</span>
                            </span>
                            <h2>My Journey</h2>
                            <div className="section-divider"></div>
                        </div>
                        <div className="experience-timeline">
                            {content.experience.map((exp, index) => (
                                <div key={index} className="experience-item">
                                    <div className="experience-card">
                                        <h3>{exp.position}</h3>
                                        <p className="experience-company">{exp.company}</p>
                                        {exp.duration && (
                                            <span className="experience-duration">{exp.duration}</span>
                                        )}
                                        {exp.description && (
                                            <p className="experience-description">{exp.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Projects Section */}
            {content.projects && content.projects.length > 0 && (
                <section id="projects" className="portfolio-section">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-badge">
                                <span>🚀</span>
                                <span>Projects</span>
                            </span>
                            <h2>My Work</h2>
                            <div className="section-divider"></div>
                        </div>
                        <div className="projects-grid">
                            {content.projects.map((project, index) => (
                                <div key={index} className="project-card">
                                    <div className="project-content">
                                        <h3>{project.title}</h3>
                                        {project.description && (
                                            <p className="project-description">{project.description}</p>
                                        )}
                                        {project.technologies && (
                                            <div className="project-tech">
                                                {project.technologies.split(',').map((tech, i) => (
                                                    <span key={i} className="tech-tag">
                                                        {tech.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {project.link && (
                                            <a 
                                                href={project.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="project-link"
                                            >
                                                View Project <span>→</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Contact Section */}
            <section id="contact" className="portfolio-section contact-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">
                            <span>📧</span>
                            <span>Contact</span>
                        </span>
                        <h2>Get In Touch</h2>
                        <div className="section-divider"></div>
                    </div>
                    <div className="contact-grid">
                        {contact.email && (
                            <div className="contact-card">
                                <div className="contact-icon">✉️</div>
                                <h3>Email</h3>
                                <a href={`mailto:${contact.email}`} className="contact-link">
                                    {contact.email}
                                </a>
                            </div>
                        )}
                        {contact.phone && (
                            <div className="contact-card">
                                <div className="contact-icon">📱</div>
                                <h3>Phone</h3>
                                <a href={`tel:${contact.phone}`} className="contact-link">
                                    {contact.phone}
                                </a>
                            </div>
                        )}
                        {contact.linkedin && (
                            <div className="contact-card">
                                <div className="contact-icon">💼</div>
                                <h3>LinkedIn</h3>
                                <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="contact-link">
                                    View Profile
                                </a>
                            </div>
                        )}
                        {contact.github && (
                            <div className="contact-card">
                                <div className="contact-icon">💻</div>
                                <h3>GitHub</h3>
                                <a href={contact.github} target="_blank" rel="noopener noreferrer" className="contact-link">
                                    View Profile
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="portfolio-footer">
                <div className="container">
                    <p className="footer-brand">
                        © {new Date().getFullYear()} {portfolio.user_profiles?.full_name || username}
                    </p>
                    <p className="view-count">
                        <span>👁️</span>
                        <span>{portfolio.view_count || 0} views</span>
                    </p>
                </div>
            </footer>

            {/* Scroll to Top Button */}
            <div 
                className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
                onClick={scrollToTop}
            >
                ↑
            </div>
        </div>
    );
};

export default PublicPortfolio;