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
    const [debugInfo, setDebugInfo] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const fetchPortfolio = useCallback(async () => {
        setLoading(true);
        setError(null);
        setDebugInfo(null);

        const debug = { username, steps: [] };

        try {
            // Step 1: Query portfolio directly by username
            debug.steps.push('Querying portfolios table by username...');

            const { data: portData, error: portError } = await supabase
                .from('portfolios')
                .select(`
                    *,
                    user_profiles!user_id (id, full_name, username, avatar_url),
                    professions(name, icon)
                `)
                .eq('username', username)
                .eq('is_published', true)
                .maybeSingle();

            debug.steps.push(`Step 1: portData=${portData ? 'FOUND' : 'NULL'}, error=${portError?.message || 'none'}, code=${portError?.code || 'none'}`);

            if (portError) {
                setDebugInfo(debug);
                setError(`DB error: ${portError.message} (code: ${portError.code})`);
                setLoading(false);
                return;
            }

            if (portData) {
                debug.steps.push('Portfolio found directly!');
                setDebugInfo(debug);
                setPortfolio(portData);
                setIsDarkMode(DARK_THEME_IDS.includes(portData.theme_id));
                supabase.rpc('increment_portfolio_views', { portfolio_id: portData.id }).catch(() => {});
                setLoading(false);
                return;
            }

            // Step 2: Fallback — look up user by username in user_profiles
            debug.steps.push('Not found by username on portfolios, trying user_profiles...');

            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('id, full_name, username')
                .eq('username', username)
                .maybeSingle();

            debug.steps.push(`Step 2: profileData=${profileData ? 'FOUND' : 'NULL'}, error=${profileError?.message || 'none'}`);

            if (profileError) {
                setDebugInfo(debug);
                setError(`Cannot read user profiles: ${profileError.message}`);
                setLoading(false);
                return;
            }

            if (!profileData) {
                setDebugInfo(debug);
                setError('No user found with username: ' + username);
                setLoading(false);
                return;
            }

            // Step 3: Find published portfolio for this user
            debug.steps.push(`Found user "${profileData.full_name}", finding their portfolio...`);

            const { data: fallbackPort, error: fallbackError } = await supabase
                .from('portfolios')
                .select(`*, user_profiles!user_id (id, full_name, username, avatar_url), professions(name, icon)`)
                .eq('user_id', profileData.id)
                .eq('is_published', true)
                .maybeSingle();

            debug.steps.push(`Step 3: port=${fallbackPort ? 'FOUND' : 'NULL'}, error=${fallbackError?.message || 'none'}`);

            if (fallbackError) {
                setDebugInfo(debug);
                setError(`Cannot read portfolio: ${fallbackError.message}`);
                setLoading(false);
                return;
            }

            if (!fallbackPort) {
                const { data: anyPort } = await supabase
                    .from('portfolios')
                    .select('id, is_published')
                    .eq('user_id', profileData.id)
                    .maybeSingle();

                debug.steps.push(`Unpublished check: ${anyPort ? `exists, is_published=${anyPort.is_published}` : 'no portfolio at all'}`);
                setDebugInfo(debug);
                setError(anyPort ? 'Portfolio exists but is not published yet.' : 'No portfolio found for this user.');
                setLoading(false);
                return;
            }

            debug.steps.push('Portfolio found via user_profiles lookup!');
            setDebugInfo(debug);
            setPortfolio(fallbackPort);
            setIsDarkMode(DARK_THEME_IDS.includes(fallbackPort.theme_id));
            supabase.from('portfolios').update({ view_count: (fallbackPort.view_count || 0) + 1 }).eq('id', fallbackPort.id).then(() => {}).catch(() => {});

        } catch (err) {
            debug.steps.push('UNCAUGHT ERROR: ' + err.message);
            setDebugInfo(debug);
            setError('Unexpected error: ' + err.message);
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
                {debugInfo && (
                    <div style={{
                        marginTop: '24px', background: 'rgba(0,0,0,0.4)', padding: '16px',
                        borderRadius: '8px', textAlign: 'left', maxWidth: '640px',
                        fontSize: '12px', fontFamily: 'monospace', lineHeight: '1.6'
                    }}>
                        <strong>Debug (username: "{debugInfo.username}"):</strong>
                        <ol style={{ marginTop: '8px', paddingLeft: '20px' }}>
                            {debugInfo.steps.map((s, i) => <li key={i}>{s}</li>)}
                        </ol>
                    </div>
                )}
                <a href="/" className="btn btn-primary" style={{ marginTop: '32px' }}>Go to Home</a>
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