import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import MehedyLight from '../templates/MehedyLight';
import MehedyDark from '../templates/MehedyDark';
import './PublicPortfolio.css';

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
            // Step 1: Find user by username — only select columns that exist
            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('id, full_name, username')
                .eq('username', username)
                .maybeSingle();

            if (profileError) {
                setError('Failed to load profile: ' + profileError.message);
                setLoading(false);
                return;
            }

            if (!profileData) {
                setError('No user found with username: ' + username);
                setLoading(false);
                return;
            }

            // Step 2: Find published portfolio — no joins, plain select
            const { data: portData, error: portError } = await supabase
                .from('portfolios')
                .select('*')
                .eq('user_id', profileData.id)
                .eq('is_published', true)
                .maybeSingle();

            if (portError) {
                setError('Failed to load portfolio: ' + portError.message);
                setLoading(false);
                return;
            }

            if (!portData) {
                const { data: anyPort } = await supabase
                    .from('portfolios')
                    .select('id, is_published')
                    .eq('user_id', profileData.id)
                    .maybeSingle();

                setError(anyPort
                    ? 'This portfolio has not been published yet.'
                    : 'No portfolio found for this user.');
                setLoading(false);
                return;
            }

            // Step 3: Fetch profession separately
            let professionData = null;
            if (portData.profession_id) {
                const { data: prof } = await supabase
                    .from('professions')
                    .select('name, icon')
                    .eq('id', portData.profession_id)
                    .maybeSingle();
                professionData = prof;
            }

            // Assemble object matching what templates expect
            setPortfolio({
                ...portData,
                user_profiles: profileData,
                professions: professionData,
            });
            setIsDarkMode(DARK_THEME_IDS.includes(portData.theme_id));

            // Track view — fire and forget
            supabase.rpc('increment_portfolio_views', { portfolio_id: portData.id }).catch(() => {});

        } catch (err) {
            setError('Unexpected error: ' + err.message);
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
                <div className="spinner" />
                <p style={{ marginTop: '20px', color: 'var(--gray-600)' }}>Loading portfolio...</p>
            </div>
        );
    }

    if (error || !portfolio) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
                padding: '40px 20px',
                textAlign: 'center',
                fontFamily: "'Outfit', sans-serif"
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '24px',
                    padding: '60px 48px',
                    maxWidth: '480px',
                    width: '100%',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
                }}>
                    <div style={{ fontSize: '72px', marginBottom: '16px' }}>🔍</div>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '800',
                        color: '#0f172a',
                        marginBottom: '12px',
                        fontFamily: "'Space Grotesk', sans-serif"
                    }}>
                        Portfolio Not Found
                    </h1>
                    <p style={{ color: '#64748b', marginBottom: '32px', lineHeight: '1.6' }}>
                        {error || 'This portfolio does not exist or has not been published yet.'}
                    </p>
                    <a href="/" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '14px 28px',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        color: 'white',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        fontWeight: '700',
                        fontSize: '15px',
                        transition: 'all 0.2s'
                    }}>
                        ← Go to Home
                    </a>
                </div>
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
            onToggleTheme={() => setIsDarkMode(prev => !prev)}
            isDarkMode={isDarkMode}
        />
    );
};

export default PublicPortfolio;