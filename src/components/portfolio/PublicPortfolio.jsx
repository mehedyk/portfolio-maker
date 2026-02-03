import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import './PublicPortfolio.css';

const PublicPortfolio = () => {
    const { username } = useParams();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPortfolio = useCallback(async () => {
        console.log('Fetching portfolio for username:', username);
        
        try {
            // First, try to get the portfolio
            const { data: portfolioData, error: portfolioError } = await supabase
                .from('portfolios')
                .select(`
                    *,
                    professions (*),
                    themes (*)
                `)
                .eq('username', username)
                .eq('is_published', true)
                .single();

            if (portfolioError) {
                console.error('Portfolio error:', portfolioError);
                
                if (portfolioError.code === 'PGRST116') {
                    setError('Portfolio not found or not published yet.');
                } else {
                    setError(`Error loading portfolio: ${portfolioError.message}`);
                }
                setLoading(false);
                return;
            }

            if (!portfolioData) {
                console.log('No portfolio data returned');
                setError('Portfolio not found.');
                setLoading(false);
                return;
            }

            console.log('Portfolio data:', portfolioData);

            // Then get the user profile separately (to avoid RLS issues)
            const { data: userProfile, error: userError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', portfolioData.user_id)
                .single();

            if (userError) {
                console.error('User profile error:', userError);
                // Continue even if user profile fails - we can still show portfolio
            }

            // Combine the data
            const combinedData = {
                ...portfolioData,
                user_profiles: userProfile || { 
                    full_name: 'Portfolio Owner', 
                    email: '' 
                }
            };

            console.log('Combined data:', combinedData);
            setPortfolio(combinedData);

            // Increment view count (don't wait for it)
            supabase
                .from('portfolios')
                .update({ view_count: portfolioData.view_count + 1 })
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
                <div style={{ marginTop: '20px', color: 'var(--gray-600)', fontSize: '14px' }}>
                    <p>Possible reasons:</p>
                    <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '12px auto' }}>
                        <li>This portfolio hasn't been published yet</li>
                        <li>The username is incorrect</li>
                        <li>The portfolio was unpublished by the owner</li>
                    </ul>
                </div>
                <a href="/" className="btn btn-primary" style={{ marginTop: '24px' }}>
                    Go to Home
                </a>
            </div>
        );
    }

    const theme = portfolio.themes || { colors: { primary: '#0ea5e9', secondary: '#06b6d4', background: '#ffffff', text: '#0f172a' } };
    const content = portfolio.content || {};
    const images = portfolio.images || {};

    return (
        <div
            className="public-portfolio"
            style={{
                '--primary-color': theme.colors.primary,
                '--secondary-color': theme.colors.secondary,
                '--background-color': theme.colors.background,
                '--text-color': theme.colors.text,
            }}
        >
            {/* Banner Section */}
            {images.banner && (
                <div className="portfolio-banner" style={{ backgroundImage: `url(${images.banner})` }}></div>
            )}

            {/* Profile Section */}
            <div className="portfolio-header">
                <div className="container">
                    {images.profile && (
                        <img src={images.profile} alt={portfolio.user_profiles.full_name} className="profile-image" />
                    )}
                    <h1>{portfolio.user_profiles.full_name || 'Portfolio Owner'}</h1>
                    <p className="profession">{portfolio.professions?.name || 'Professional'}</p>
                </div>
            </div>

            {/* About Section */}
            {content.about && (
                <section className="portfolio-section">
                    <div className="container">
                        <h2>About Me</h2>
                        <p className="about-text">{content.about}</p>
                    </div>
                </section>
            )}

            {/* Skills Section */}
            {content.skills && content.skills.length > 0 && (
                <section className="portfolio-section" style={{ background: 'var(--gray-50)' }}>
                    <div className="container">
                        <h2>Skills & Expertise</h2>
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

            {/* Projects Section */}
            {content.projects && content.projects.length > 0 && (
                <section className="portfolio-section">
                    <div className="container">
                        <h2>Projects & Work</h2>
                        <div className="projects-grid">
                            {content.projects.map((project, index) => (
                                <div key={index} className="project-card">
                                    <h3>{project.title || `Project ${index + 1}`}</h3>
                                    <p>{project.description || 'No description provided.'}</p>
                                    {project.link && (
                                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
                                            View Project →
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Contact Section */}
            {content.contact && (
                <section className="portfolio-section contact-section">
                    <div className="container">
                        <h2>Get In Touch</h2>
                        <div className="contact-links">
                            {content.contact.email && (
                                <a href={`mailto:${content.contact.email}`} className="contact-link">
                                    📧 {content.contact.email}
                                </a>
                            )}
                            {content.contact.phone && (
                                <a href={`tel:${content.contact.phone}`} className="contact-link">
                                    📱 {content.contact.phone}
                                </a>
                            )}
                            {content.contact.linkedin && (
                                <a href={content.contact.linkedin} target="_blank" rel="noopener noreferrer" className="contact-link">
                                    💼 LinkedIn
                                </a>
                            )}
                            {content.contact.github && (
                                <a href={content.contact.github} target="_blank" rel="noopener noreferrer" className="contact-link">
                                    💻 GitHub
                                </a>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="portfolio-footer">
                <div className="container">
                    <p>Built with Portfolio Builder</p>
                    <p className="view-count">👁️ {portfolio.view_count || 0} views</p>
                </div>
            </footer>
        </div>
    );
};

export default PublicPortfolio;