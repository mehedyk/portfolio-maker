import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { useThemeStore, applyTheme } from '../../stores/themeStore';
import './PublicPortfolio.css';

const PublicPortfolio = () => {
    const { username } = useParams();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const { theme } = useThemeStore();

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const fetchPortfolio = useCallback(async () => {
        console.log('Fetching portfolio for username:', username);
        
        try {
            const { data: portfolioData, error: portfolioError } = await supabase
                .from('portfolios')
                .select('*, professions(*), themes(*)')
                .eq('username', username)
                .eq('is_published', true)
                .single();

            if (portfolioError) {
                console.error('Portfolio error:', portfolioError);
                if (portfolioError.code === 'PGRST116') {
                    setError('Portfolio not found or not published yet.');
                } else {
                    setError('Error loading portfolio: ' + portfolioError.message);
                }
                setLoading(false);
                return;
            }

            if (!portfolioData) {
                setError('Portfolio not found.');
                setLoading(false);
                return;
            }

            const { data: userProfile, error: userError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', portfolioData.user_id)
                .single();

            if (userError) {
                console.error('User profile error:', userError);
            }

            const combinedData = {
                ...portfolioData,
                user_profiles: userProfile || { 
                    full_name: 'Portfolio Owner', 
                    email: '' 
                }
            };

            setPortfolio(combinedData);

            // Increment view count (non-blocking)
            supabase
                .from('portfolios')
                .update({ view_count: (portfolioData.view_count || 0) + 1 })
                .eq('id', portfolioData.id)
                .then(({ error: updateError }) => {
                    if (updateError) {
                        console.error('Error updating view count:', updateError);
                    }
                });

        } catch (error) {
            console.error('Unexpected error:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [username]);

    useEffect(() => {
        fetchPortfolio();
    }, [fetchPortfolio]);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p style={{ marginTop: '20px', color: 'var(--gray-600)' }}>Loading portfolio...</p>
            </div>
        );
    }

    if (error || !portfolio) {
        return (
            <div className="not-found">
                <h1>404</h1>
                <p>{error || 'Portfolio not found'}</p>
                <div style={{ marginTop: '20px', fontSize: '16px' }}>
                    <p style={{ marginBottom: '12px' }}>Possible reasons:</p>
                    <ul>
                        <li>This portfolio has not been published yet</li>
                        <li>The username is incorrect</li>
                        <li>The portfolio was unpublished by the owner</li>
                    </ul>
                </div>
                <a href="/" className="btn btn-primary" style={{ marginTop: '32px' }}>
                    Go to Home
                </a>
            </div>
        );
    }

    const content = portfolio.content || {};
    const images = portfolio.images || {};

    return (
        <div className="public-portfolio">
            {/* Navigation */}
            <nav className="portfolio-nav">
                <div className="container">
                    <div className="portfolio-nav-brand">
                        {portfolio.user_profiles.full_name || 'Portfolio'}
                    </div>
                    <div className="portfolio-nav-links">
                        <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a>
                        {content.skills && content.skills.length > 0 && (
                            <a href="#skills" onClick={(e) => { e.preventDefault(); scrollToSection('skills'); }}>Skills</a>
                        )}
                        {content.experience && content.experience.length > 0 && (
                            <a href="#experience" onClick={(e) => { e.preventDefault(); scrollToSection('experience'); }}>Experience</a>
                        )}
                        {content.projects && content.projects.length > 0 && (
                            <a href="#projects" onClick={(e) => { e.preventDefault(); scrollToSection('projects'); }}>Projects</a>
                        )}
                        <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
                    </div>
                </div>
            </nav>

            {/* Header - No Banner, Clean Design */}
            <header className="portfolio-header">
                <div className="container">
                    {images.profile && (
                        <div className="profile-image-wrapper">
                            <img src={images.profile} alt={portfolio.user_profiles.full_name} className="profile-image" />
                        </div>
                    )}
                    <h1>{portfolio.user_profiles.full_name || 'Portfolio Owner'}</h1>
                    <p className="profession">{portfolio.professions?.name || 'Professional'}</p>
                    
                    {/* Social Links */}
                    <div className="social-links">
                        {content.contact?.email && (
                            <a href={'mailto:' + content.contact.email} className="social-link" aria-label="Email">
                                📧
                            </a>
                        )}
                        {content.contact?.linkedin && (
                            <a href={content.contact.linkedin} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                                💼
                            </a>
                        )}
                        {content.contact?.github && (
                            <a href={content.contact.github} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
                                💻
                            </a>
                        )}
                        {content.contact?.website && (
                            <a href={content.contact.website} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Website">
                                🌐
                            </a>
                        )}
                    </div>
                </div>
            </header>

            {/* About Section */}
            {content.about && (
                <section id="about" className="portfolio-section">
                    <div className="container">
                        <div className="section-header">
                            <div className="section-badge">
                                <span>👤</span>
                                <span>About Me</span>
                            </div>
                            <h2>Know Who I Am</h2>
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
                            <div className="section-badge">
                                <span>⚡</span>
                                <span>Skills</span>
                            </div>
                            <h2>What I'm Good At</h2>
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
                            <div className="section-badge">
                                <span>💼</span>
                                <span>Experience</span>
                            </div>
                            <h2>My Journey</h2>
                            <div className="section-divider"></div>
                        </div>
                        <div className="experience-timeline">
                            {content.experience.map((exp, index) => (
                                <div key={index} className="experience-item">
                                    <div className="experience-card">
                                        <h3>{exp.position}</h3>
                                        <div className="experience-company">{exp.company}</div>
                                        {exp.duration && (
                                            <div className="experience-duration">📅 {exp.duration}</div>
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
                            <div className="section-badge">
                                <span>🚀</span>
                                <span>Projects</span>
                            </div>
                            <h2>Things I've Built</h2>
                            <div className="section-divider"></div>
                        </div>
                        <div className="projects-grid">
                            {content.projects.map((project, index) => (
                                <div key={index} className="project-card">
                                    <div className="project-content">
                                        <h3>{project.title}</h3>
                                        <p className="project-description">{project.description}</p>
                                        
                                        {project.technologies && (
                                            <div className="project-tech">
                                                {project.technologies.split(',').map((tech, i) => (
                                                    <span key={i} className="tech-tag">{tech.trim()}</span>
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
            {content.contact && (
                <section id="contact" className="portfolio-section contact-section">
                    <div className="container">
                        <div className="section-header">
                            <div className="section-badge">
                                <span>📬</span>
                                <span>Get In Touch</span>
                            </div>
                            <h2>Let's Connect</h2>
                            <div className="section-divider"></div>
                        </div>
                        <div className="contact-grid">
                            {content.contact.email && (
                                <div className="contact-card">
                                    <div className="contact-icon">📧</div>
                                    <h3>Email</h3>
                                    <a href={'mailto:' + content.contact.email} className="contact-link">
                                        {content.contact.email}
                                    </a>
                                </div>
                            )}
                            {content.contact.phone && (
                                <div className="contact-card">
                                    <div className="contact-icon">📱</div>
                                    <h3>Phone</h3>
                                    <a href={'tel:' + content.contact.phone} className="contact-link">
                                        {content.contact.phone}
                                    </a>
                                </div>
                            )}
                            {content.contact.linkedin && (
                                <div className="contact-card">
                                    <div className="contact-icon">💼</div>
                                    <h3>LinkedIn</h3>
                                    <a href={content.contact.linkedin} target="_blank" rel="noopener noreferrer" className="contact-link">
                                        Connect with me
                                    </a>
                                </div>
                            )}
                            {content.contact.github && (
                                <div className="contact-card">
                                    <div className="contact-icon">💻</div>
                                    <h3>GitHub</h3>
                                    <a href={content.contact.github} target="_blank" rel="noopener noreferrer" className="contact-link">
                                        View my code
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="portfolio-footer">
                <div className="container">
                    <div className="footer-brand">
                        Built with Portfolio Builder • {new Date().getFullYear()}
                    </div>
                    <div className="view-count">
                        <span>👁️</span>
                        <span>{portfolio.view_count || 0} views</span>
                    </div>
                </div>
            </footer>

            <ThemeSwitcher />

            {/* Scroll to Top Button */}
            <div 
                className={'scroll-to-top ' + (showScrollTop ? 'visible' : '')}
                onClick={scrollToTop}
            >
                ↑
            </div>
        </div>
    );
};

export default PublicPortfolio;