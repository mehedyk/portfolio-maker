import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import './PublicPortfolio.css';

const PublicPortfolio = () => {
    const { username } = useParams();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        fetchPortfolio();
    }, [username]);

    const fetchPortfolio = async () => {
        try {
            const { data, error } = await supabase
                .from('portfolios')
                .select('*, professions(*), themes(*), user_profiles(*)')
                .eq('username', username)
                .eq('is_published', true)
                .single();

            if (error || !data) {
                setNotFound(true);
            } else {
                setPortfolio(data);
                // Increment view count
                await supabase
                    .from('portfolios')
                    .update({ view_count: data.view_count + 1 })
                    .eq('id', data.id);
            }
        } catch (error) {
            console.error('Error:', error);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="not-found">
                <h1>404</h1>
                <p>Portfolio not found</p>
                <a href="/" className="btn btn-primary">
                    Go Home
                </a>
            </div>
        );
    }

    const theme = portfolio.themes;
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
                    <h1>{portfolio.user_profiles.full_name}</h1>
                    <p className="profession">{portfolio.professions.name}</p>
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
                    <p className="view-count">👁️ {portfolio.view_count} views</p>
                </div>
            </footer>
        </div>
    );
};

export default PublicPortfolio;
