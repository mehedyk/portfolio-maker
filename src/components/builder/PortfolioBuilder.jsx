import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { uploadToCloudinary } from '../../services/cloudinary';
import './PortfolioBuilder.css';

const PortfolioBuilder = () => {
    const { user, profile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const { portfolioId } = useParams();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [professions, setProfessions] = useState([]);
    const [themes, setThemes] = useState([]);
    const [showCreditModal, setShowCreditModal] = useState(false);

    const [formData, setFormData] = useState({
        profession_id: null,
        theme_id: null,
        username: profile?.username || '',
        content: {
            about: '',
            skills: [],
            experience: [],
            education: [],
            projects: [],
            contact: {
                email: '',
                phone: '',
                linkedin: '',
                github: '',
            },
        },
        images: {
            profile: '',
            banner: '',
        },
    });

    const fetchProfessions = async () => {
        const { data } = await supabase.from('professions').select('*').order('name');
        setProfessions(data || []);
    };

    const fetchThemes = async () => {
        const { data } = await supabase.from('themes').select('*').order('tier, name');
        setThemes(data || []);
    };

    const fetchPortfolio = useCallback(async () => {
        const { data } = await supabase
            .from('portfolios')
            .select('*')
            .eq('id', portfolioId)
            .single();

        if (data) {
            setFormData({
                profession_id: data.profession_id,
                theme_id: data.theme_id,
                username: data.username,
                content: data.content || formData.content,
                images: data.images || formData.images,
            });
        }
    }, [portfolioId, formData.content, formData.images]);

    useEffect(() => {
        fetchProfessions();
        fetchThemes();

        if (portfolioId) {
            fetchPortfolio();
        } else if (user) {
            // Check if user already has a portfolio to prevent duplicate key error
            const checkExisting = async () => {
                const { data } = await supabase
                    .from('portfolios')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (data) {
                    // Redirect to edit mode
                    console.log('Found existing portfolio, redirecting to edit mode');
                    navigate(`/edit/${data.id}`, { replace: true });
                }
            };
            checkExisting();
        }
    }, [portfolioId, fetchPortfolio, user, navigate]);

    const handleImageUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const { url } = await uploadToCloudinary(file);
            setFormData({
                ...formData,
                images: {
                    ...formData.images,
                    [type]: url,
                },
            });
        } catch (error) {
            alert('Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDraft = async () => {
        setLoading(true);
        try {
            const portfolioData = {
                user_id: user.id,
                profession_id: formData.profession_id,
                theme_id: formData.theme_id,
                username: formData.username,
                content: formData.content,
                images: formData.images,
                is_published: false,
            };

            if (portfolioId) {
                await supabase.from('portfolios').update(portfolioData).eq('id', portfolioId);
            } else {
                await supabase.from('portfolios').insert([portfolioData]);
            }

            alert('Portfolio saved as draft!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save portfolio');
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async () => {
        if (profile.credits < 1) {
            setShowCreditModal(true);
            return;
        }

        if (!window.confirm('Publish your portfolio? This will use 1 credit.')) {
            return;
        }

        setLoading(true);
        try {
            const portfolioData = {
                user_id: user.id,
                profession_id: formData.profession_id,
                theme_id: formData.theme_id,
                username: formData.username,
                content: formData.content,
                images: formData.images,
            };

            let portfolioIdToPublish = portfolioId;
            let dbError = null;

            if (portfolioId) {
                const { error } = await supabase.from('portfolios').update(portfolioData).eq('id', portfolioId);
                dbError = error;
            } else {
                const { data, error } = await supabase.from('portfolios').insert([portfolioData]).select().single();
                if (data) {
                    portfolioIdToPublish = data.id;
                }
                dbError = error;
            }

            if (dbError) throw dbError;

            if (!portfolioIdToPublish) {
                throw new Error('Failed to create portfolio ID');
            }

            // Call publish function
            const { error } = await supabase.rpc('publish_portfolio', {
                portfolio_id: portfolioIdToPublish,
                user_id: user.id,
            });

            if (error) throw error;

            refreshProfile();
            alert('Portfolio published successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error publishing:', error);
            alert(error.message || 'Failed to publish portfolio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="portfolio-builder">
            <div className="builder-header">
                <div className="container">
                    <h1>Portfolio Builder</h1>
                    <div className="header-actions">
                        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button onClick={handleSaveDraft} className="btn btn-secondary" disabled={loading}>
                            Save Draft
                        </button>
                        <button onClick={handlePublish} className="btn btn-primary" disabled={loading}>
                            Publish ({profile?.credits || 0} credits)
                        </button>
                    </div>
                </div>
            </div>

            <div className="container builder-content">
                <div className="steps-indicator">
                    <div className={`step-item ${step >= 1 ? 'active' : ''}`}>1. Profession</div>
                    <div className={`step-item ${step >= 2 ? 'active' : ''}`}>2. Theme</div>
                    <div className={`step-item ${step >= 3 ? 'active' : ''}`}>3. Content</div>
                </div>

                {step === 1 && (
                    <div className="step-content">
                        <h2>Select Your Profession</h2>
                        <div className="profession-grid">
                            {professions.map((profession) => (
                                <div
                                    key={profession.id}
                                    className={`profession-card ${formData.profession_id === profession.id ? 'selected' : ''}`}
                                    onClick={() => {
                                        setFormData({ ...formData, profession_id: profession.id });
                                        setStep(2);
                                    }}
                                >
                                    <div className="profession-icon">{profession.icon}</div>
                                    <h3>{profession.name}</h3>
                                    <p>{profession.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="step-content">
                        <h2>Choose a Theme</h2>
                        <div className="theme-grid">
                            {themes.map((theme) => (
                                <div
                                    key={theme.id}
                                    className={`theme-card ${formData.theme_id === theme.id ? 'selected' : ''} ${theme.tier === 'premium' && profile?.credits < 1 ? 'locked' : ''
                                        }`}
                                    onClick={() => {
                                        if (theme.tier === 'premium' && profile?.credits < 1) {
                                            alert('Premium themes require credits. Please purchase credits first.');
                                            return;
                                        }
                                        setFormData({ ...formData, theme_id: theme.id });
                                        setStep(3);
                                    }}
                                >
                                    <div
                                        className="theme-preview"
                                        style={{
                                            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                                        }}
                                    ></div>
                                    <h3>{theme.name}</h3>
                                    <span className={`theme-badge ${theme.tier}`}>
                                        {theme.tier === 'premium' ? '⭐ Premium' : '✓ Free'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setStep(1)} className="btn btn-secondary">
                            Back
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="step-content">
                        <h2>Build Your Portfolio</h2>

                        <div className="form-section">
                            <h3>Profile Images</h3>
                            <div className="image-uploads">
                                <div className="image-upload-box">
                                    <label>Profile Picture</label>
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile')} />
                                    {formData.images.profile && <img src={formData.images.profile} alt="Profile" />}
                                </div>
                                <div className="image-upload-box">
                                    <label>Banner Image</label>
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
                                    {formData.images.banner && <img src={formData.images.banner} alt="Banner" />}
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>About</h3>
                            <textarea
                                className="input"
                                rows="5"
                                placeholder="Tell us about yourself..."
                                value={formData.content.about}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        content: { ...formData.content, about: e.target.value },
                                    })
                                }
                            />
                        </div>

                        <div className="form-section">
                            <h3>Contact Information</h3>
                            <div className="contact-grid">
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="Email"
                                    value={formData.content.contact.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            content: {
                                                ...formData.content,
                                                contact: { ...formData.content.contact, email: e.target.value },
                                            },
                                        })
                                    }
                                />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Phone"
                                    value={formData.content.contact.phone}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            content: {
                                                ...formData.content,
                                                contact: { ...formData.content.contact, phone: e.target.value },
                                            },
                                        })
                                    }
                                />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="LinkedIn URL"
                                    value={formData.content.contact.linkedin}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            content: {
                                                ...formData.content,
                                                contact: { ...formData.content.contact, linkedin: e.target.value },
                                            },
                                        })
                                    }
                                />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="GitHub URL"
                                    value={formData.content.contact.github}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            content: {
                                                ...formData.content,
                                                contact: { ...formData.content.contact, github: e.target.value },
                                            },
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <button onClick={() => setStep(2)} className="btn btn-secondary">
                            Back
                        </button>
                    </div>
                )}
            </div>

            {showCreditModal && (
                <div className="modal-overlay" onClick={() => setShowCreditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Insufficient Credits</h2>
                        <p>You need at least 1 credit to publish a portfolio.</p>
                        <div className="modal-actions">
                            <button onClick={() => navigate('/credits')} className="btn btn-primary">
                                Buy Credits
                            </button>
                            <button onClick={() => setShowCreditModal(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioBuilder;
