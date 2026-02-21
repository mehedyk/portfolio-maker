import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import MehedyLight from '../templates/MehedyLight';
import MehedyDark from '../templates/MehedyDark';
import './PublicPortfolio.css';

// Theme IDs that render MehedyDark — all others render MehedyLight.
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
            // Step 1: resolve username → user_id from user_profiles
            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('username', username)
                .single();

            if (profileError || !profileData) {
                setError('No user found with this username.');
                setLoading(false);
                return;
            }

            // Step 2: fetch the published portfolio for that user
            // Try `status = 'published'` first; fall back to `is_published = true`
            // in case the DB uses a boolean column instead.
            let { data: portData, error: portError } = await supabase
                .from('portfolios')
                .select(`
                    *,
                    user_profiles(id, full_name, username, avatar_url),
                    professions(name, icon)
                `)
                .eq('user_id', profileData.id)
                .eq('status', 'published')
                .maybeSingle();

            // Fallback: if nothing returned but no DB error, try boolean flag
            if (!portData && !portError) {
                const { data: fallback, error: fallbackError } = await supabase
                    .from('portfolios')
                    .select(`
                        *,
                        user_profiles(id, full_name, username, avatar_url),
                        professions(name, icon)
                    `)
                    .eq('user_id', profileData.id)
                    .eq('is_published', true)
                    .maybeSingle();

                if (fallbackError) {
                    console.error('Fallback query error:', fallbackError);
                } else {
                    portData = fallback;
                }
            }

            if (portError) {
                console.error('Portfolio fetch error:', portError);
                setError('Failed to load portfolio.');
                setLoading(false);
                return;
            }

            if (!portData) {
                setError('Portfolio not found or not yet published.');
                setLoading(false);
                return;
            }

            setPortfolio(portData);
            setIsDarkMode(DARK_THEME_IDS.includes(portData.theme_id));

            // Track view — fire-and-forget
            supabase.rpc('increment_portfolio_views', { portfolio_id: portData.id }).catch(() => { });
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