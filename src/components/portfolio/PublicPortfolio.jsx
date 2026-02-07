import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import MehedyLight from '../templates/MehedyLight';
import MehedyDark from '../templates/MehedyDark';
import './PublicPortfolio.css';

const PublicPortfolio = () => {
    const { username } = useParams();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Theme State - Default to light
    const [currentThemeId, setCurrentThemeId] = useState('light');

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

            // FIXED: Determine theme based on theme_id (numeric from database)
            // Map numeric theme IDs to light/dark mode
            const themeId = combinedData.theme_id;
            
            // Dark themes: 2, 6, 7, 8 (dark, dark-elegance, midnight-slate, carbon-gold)
            const darkThemeIds = [2, 6, 7, 8];
            
            if (darkThemeIds.includes(themeId)) {
                setCurrentThemeId('dark');
            } else {
                setCurrentThemeId('light');
            }

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

    const toggleTheme = () => {
        setCurrentThemeId(prev => prev === 'light' ? 'dark' : 'light');
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
    const specialty_info = portfolio.specialty_info || {};

    // Render the appropriate template based on currentThemeId
    if (currentThemeId === 'dark') {
        return (
            <MehedyDark
                portfolio={portfolio}
                content={content}
                images={images}
                specialty_info={specialty_info}
                onToggleTheme={toggleTheme}
                isDarkMode={true}
            />
        );
    }

    // Default to Light theme
    return (
        <MehedyLight
            portfolio={portfolio}
            content={content}
            images={images}
            specialty_info={specialty_info}
            onToggleTheme={toggleTheme}
            isDarkMode={false}
        />
    );
};

export default PublicPortfolio;