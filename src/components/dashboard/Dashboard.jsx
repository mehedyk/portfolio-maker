import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import './Dashboard.css';

const Dashboard = () => {
    const { user, profile, signOut, refreshProfile } = useAuth();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [unpublishModal, setUnpublishModal] = useState(false);

    const showToast = (msg, isError = false) => {
        setToast({ msg, isError });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchPortfolio = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('portfolios')
                .select('*, professions(*), themes(*)')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                if (process.env.NODE_ENV === 'development') console.error('Error fetching portfolio:', error);
            } else {
                setPortfolio(data);
            }
        } catch (err) {
            if (process.env.NODE_ENV === 'development') console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refreshProfile();
        fetchPortfolio();
    }, [fetchPortfolio, refreshProfile]);

    const handleUnpublish = async () => {
        setUnpublishModal(false);
        try {
            const { error } = await supabase
                .from('portfolios')
                .update({ is_published: false })
                .eq('id', portfolio.id);

            if (error) throw error;

            // Refund credit using current server value to avoid race condition
            const { data: current, error: fetchErr } = await supabase
                .from('user_profiles')
                .select('credits')
                .eq('id', user.id)
                .single();

            if (!fetchErr && current) {
                await supabase
                    .from('user_profiles')
                    .update({ credits: current.credits + 1 })
                    .eq('id', user.id);
            }

            refreshProfile();
            fetchPortfolio();
            showToast('Portfolio unpublished. Credit refunded.');
        } catch (err) {
            showToast('Failed to unpublish portfolio.', true);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
                    background: toast.isError ? '#ef4444' : '#22c55e',
                    color: 'white', padding: '14px 20px', borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)', fontWeight: '600',
                }}>
                    {toast.msg}
                </div>
            )}

            {/* Unpublish confirm modal */}
            {unpublishModal && (
                <div className="modal-overlay" onClick={() => setUnpublishModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-icon">⚠️</div>
                        <h2>Unpublish Portfolio?</h2>
                        <p>Your portfolio will no longer be publicly accessible. Your credit will be refunded.</p>
                        <div className="modal-actions">
                            <button onClick={handleUnpublish} className="btn btn-danger">Unpublish</button>
                            <button onClick={() => setUnpublishModal(false)} className="btn btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="dashboard-nav">
                <div className="container">
                    <div className="nav-content">
                        <h2>Portfolio Builder</h2>
                        <div className="nav-actions">
                            <span className="credits-badge">💳 {profile?.credits ?? 0} Credits</span>
                            {profile?.role === 'admin' && (
                                <Link to="/admin" className="btn btn-secondary">
                                    Admin Panel
                                </Link>
                            )}
                            <button onClick={signOut} className="btn btn-secondary">
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container dashboard-content">
                <div className="welcome-section">
                    <h1>Welcome back, {profile?.full_name}! 👋</h1>
                    <p>Manage your portfolio and track your progress</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">💳</div>
                        <div className="stat-info">
                            <h3>{profile?.credits ?? 0}</h3>
                            <p>Available Credits</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <h3>{portfolio?.view_count ?? 0}</h3>
                            <p>Portfolio Views</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">{portfolio?.is_published ? '✅' : '📝'}</div>
                        <div className="stat-info">
                            <h3>{portfolio?.is_published ? 'Published' : 'Draft'}</h3>
                            <p>Portfolio Status</p>
                        </div>
                    </div>
                </div>

                {!portfolio ? (
                    <div className="empty-state">
                        <div className="empty-icon">📁</div>
                        <h2>No Portfolio Yet</h2>
                        <p>Create your first portfolio and showcase your work to the world!</p>
                        <Link to="/create" className="btn btn-primary">
                            Create Portfolio
                        </Link>
                    </div>
                ) : (
                    <div className="portfolio-section">
                        <div className="section-header">
                            <h2>Your Portfolio</h2>
                            <div className="section-actions">
                                <Link to={`/edit/${portfolio.id}`} className="btn btn-secondary">
                                    Edit Portfolio
                                </Link>
                                {portfolio.is_published && (
                                    <>
                                        <a
                                            href={`/p/${portfolio.username}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary"
                                        >
                                            View Live
                                        </a>
                                        <button onClick={() => setUnpublishModal(true)} className="btn btn-danger">
                                            Unpublish
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="portfolio-card">
                            <div className="portfolio-info">
                                <h3>{profile?.full_name}</h3>
                                <p className="portfolio-profession">
                                    {portfolio.professions?.name} • {portfolio.themes?.name} Theme
                                </p>
                                <p className="portfolio-url">
                                    {portfolio.is_published ? (
                                        <a href={`/p/${portfolio.username}`} target="_blank" rel="noopener noreferrer">
                                            /p/{portfolio.username}
                                        </a>
                                    ) : (
                                        <span>/p/{portfolio.username} (Not published)</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="actions-grid">
                        <Link to="/credits" className="action-card">
                            <div className="action-icon">💰</div>
                            <h3>Buy Credits</h3>
                            <p>Purchase more credits to publish additional portfolios</p>
                        </Link>
                        {!portfolio && (
                            <Link to="/create" className="action-card">
                                <div className="action-icon">✨</div>
                                <h3>Create Portfolio</h3>
                                <p>Build your professional portfolio in minutes</p>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
