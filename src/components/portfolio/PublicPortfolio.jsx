import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import MehedyLight from '../templates/MehedyLight';
import MehedyDark from '../templates/MehedyDark';
import './PublicPortfolio.css';

// Theme IDs that render MehedyDark — all others render MehedyLight.
// dark(2), dark-elegance(6), midnight-slate(7), carbon-gold(8),
// purple-reign(11), crimson-red(13)
const DARK_THEME_IDS = [2, 6, 7, 8, 11, 13];

const PublicPortfolio = () => {
    const { username } = useParams();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const fetchPortfolio = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Join user_profiles so we can filter by username in one query.
            // status = 'published' is the correct column used by the publish handler.
            const { data, error: fetchError } = await supabase
                .from('portfolios')
                .select(`
                    *,
                    user_profiles!inner(id, full_name, username, avatar_url),
                    professions(name, icon)
                `)
                .eq('user_profiles.username', username)
                .eq('status', 'published')
                .single();

            if (fetchError || !data) {
                // PGRST116 = no rows returned
                setError('Portfolio not found or not yet published.');
                setLoading(false);
                return;
            }

            setPortfolio(data);
            setIsDarkMode(DARK_THEME_IDS.includes(data.theme_id));

            // Track view — fire-and-forget, never blocks render
            supabase.rpc('increment_portfolio_views', { portfolio_id: data.id }).catch(() => { });
        } catch (err) {
            console.error('Unexpected error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [username]);

    useEffect(() => {
        fetchPortfolio();
    }, [fetchPortfolio]);

    const handleToggleTheme = () => setIsDarkMode(prev => !prev);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner" />
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

    const Template = isDarkMode ? MehedyDark : MehedyLight;

    return (
        <Template
            portfolio={portfolio}
            content={content}
            images={images}
            specialty_info={specialty_info}
            onToggleTheme={handleToggleTheme}
            isDarkMode={isDarkMode}
        />
    );
};

export default PublicPortfolio;