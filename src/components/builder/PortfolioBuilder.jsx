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
    const [currentSkill, setCurrentSkill] = useState('');
    const [currentProject, setCurrentProject] = useState({
        title: '',
        description: '',
        link: '',
        technologies: ''
    });
    const [currentExperience, setCurrentExperience] = useState({
        position: '',
        company: '',
        duration: '',
        description: ''
    });

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
                website: ''
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
        if (!portfolioId) return;
        
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
            const checkExisting = async () => {
                const { data } = await supabase
                    .from('portfolios')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (data) {
                    navigate('/edit/' + data.id, { replace: true });
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

    const handleAddSkill = () => {
        if (!currentSkill.trim()) return;
        
        setFormData({
            ...formData,
            content: {
                ...formData.content,
                skills: [...formData.content.skills, currentSkill.trim()]
            }
        });
        setCurrentSkill('');
    };

    const handleRemoveSkill = (index) => {
        setFormData({
            ...formData,
            content: {
                ...formData.content,
                skills: formData.content.skills.filter((_, i) => i !== index)
            }
        });
    };

    const handleAddProject = () => {
        if (!currentProject.title.trim()) {
            alert('Please enter a project title');
            return;
        }

        setFormData({
            ...formData,
            content: {
                ...formData.content,
                projects: [...formData.content.projects, { ...currentProject }]
            }
        });
        
        setCurrentProject({
            title: '',
            description: '',
            link: '',
            technologies: ''
        });
    };

    const handleRemoveProject = (index) => {
        setFormData({
            ...formData,
            content: {
                ...formData.content,
                projects: formData.content.projects.filter((_, i) => i !== index)
            }
        });
    };

    const handleAddExperience = () => {
        if (!currentExperience.position.trim() || !currentExperience.company.trim()) {
            alert('Please enter position and company');
            return;
        }

        setFormData({
            ...formData,
            content: {
                ...formData.content,
                experience: [...formData.content.experience, { ...currentExperience }]
            }
        });
        
        setCurrentExperience({
            position: '',
            company: '',
            duration: '',
            description: ''
        });
    };

    const handleRemoveExperience = (index) => {
        setFormData({
            ...formData,
            content: {
                ...formData.content,
                experience: formData.content.experience.filter((_, i) => i !== index)
            }
        });
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

        if (!formData.profession_id || !formData.theme_id) {
            alert('Please select profession and theme');
            return;
        }

        if (!formData.content.about || !formData.content.contact.email) {
            alert('Please fill in at least About section and email');
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

            if (portfolioId) {
                const { error } = await supabase
                    .from('portfolios')
                    .update(portfolioData)
                    .eq('id', portfolioId);
                
                if (error) throw error;
            } else {
                const { data, error } = await supabase
                    .from('portfolios')
                    .insert([portfolioData])
                    .select()
                    .single();
                
                if (error) throw error;
                if (data) portfolioIdToPublish = data.id;
            }

            if (!portfolioIdToPublish) {
                throw new Error('Failed to create portfolio ID');
            }

            const { error: publishError } = await supabase.rpc('publish_portfolio_safe', {
                p_portfolio_id: portfolioIdToPublish,
                p_user_id: user.id,
            });

            if (publishError) throw publishError;

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
                    <div className="builder-title">
                        <div className="builder-title-icon">✨</div>
                        <span>Portfolio Builder</span>
                    </div>
                    <div className="header-actions">
                        <div className="credits-display">
                            💳 {profile?.credits || 0} Credits
                        </div>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button onClick={handleSaveDraft} className="btn btn-secondary" disabled={loading}>
                            Save Draft
                        </button>
                        <button onClick={handlePublish} className="btn btn-primary" disabled={loading}>
                            {loading ? 'Publishing...' : 'Publish'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="builder-content">
                <div className="steps-indicator">
                    <div className={'step-item ' + (step >= 1 ? 'active' : '') + ' ' + (step > 1 ? 'completed' : '')}>
                        <div className="step-number">{step > 1 ? '✓' : '1'}</div>
                        <span>Profession</span>
                    </div>
                    <div className={'step-item ' + (step >= 2 ? 'active' : '') + ' ' + (step > 2 ? 'completed' : '')}>
                        <div className="step-number">{step > 2 ? '✓' : '2'}</div>
                        <span>Theme</span>
                    </div>
                    <div className={'step-item ' + (step >= 3 ? 'active' : '')}>
                        <div className="step-number">3</div>
                        <span>Content</span>
                    </div>
                </div>

                {step === 1 && (
                    <div className="step-content">
                        <h2>Choose Your Profession</h2>
                        <p className="step-description">
                            Select your profession to get tailored sections and recommendations for your portfolio.
                        </p>
                        <div className="profession-grid">
                            {professions.map((profession) => (
                                <div
                                    key={profession.id}
                                    className={'profession-card ' + (formData.profession_id === profession.id ? 'selected' : '')}
                                    onClick={() => {
                                        setFormData({ ...formData, profession_id: profession.id });
                                        setStep(2);
                                    }}
                                >
                                    <span className="profession-icon">{profession.icon}</span>
                                    <h3>{profession.name}</h3>
                                    <p>{profession.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="step-content">
                        <h2>Pick Your Style</h2>
                        <p className="step-description">
                            Choose a theme that represents your personality and profession. Premium themes require credits.
                        </p>
                        <div className="theme-grid">
                            {themes.map((theme) => {
                                const isLocked = theme.tier === 'premium' && profile?.credits < 1;
                                return (
                                    <div
                                        key={theme.id}
                                        className={'theme-card ' + (formData.theme_id === theme.id ? 'selected ' : '') + (isLocked ? 'locked' : '')}
                                        onClick={() => {
                                            if (isLocked) {
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
                                                background: 'linear-gradient(135deg, ' + theme.colors.primary + ', ' + theme.colors.secondary + ')',
                                            }}
                                        ></div>
                                        <div className="theme-info">
                                            <h3>{theme.name}</h3>
                                            <span className={'theme-badge ' + theme.tier}>
                                                {theme.tier === 'premium' ? '⭐ Premium' : '✓ Free'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="step-navigation">
                            <button onClick={() => setStep(1)} className="btn btn-secondary">
                                ← Back
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="step-content">
                        <h2>Build Your Portfolio</h2>
                        <p className="step-description">
                            Fill in your details to create a stunning, professional portfolio.
                        </p>

                        <div className="form-section">
                            <h3>
                                <span className="section-icon">📸</span>
                                Profile Images
                            </h3>
                            <div className="image-uploads">
                                <div className={'image-upload-box ' + (formData.images.profile ? 'has-image' : '')}>
                                    <label>Profile Picture</label>
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile')} />
                                    <p className="upload-hint">Recommended: Square image, at least 400x400px</p>
                                    {formData.images.profile && <img src={formData.images.profile} alt="Profile" />}
                                </div>
                                <div className={'image-upload-box ' + (formData.images.banner ? 'has-image' : '')}>
                                    <label>Banner/Cover Image</label>
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
                                    <p className="upload-hint">Recommended: Wide image, 1920x600px</p>
                                    {formData.images.banner && <img src={formData.images.banner} alt="Banner" />}
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>
                                <span className="section-icon">👤</span>
                                About You
                            </h3>
                            <div className="form-group">
                                <label className="label">Tell us about yourself</label>
                                <textarea
                                    className="textarea"
                                    rows="6"
                                    placeholder="I'm a passionate software developer with 5 years of experience in building web applications..."
                                    value={formData.content.about}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            content: { ...formData.content, about: e.target.value },
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>
                                <span className="section-icon">⚡</span>
                                Skills & Expertise
                            </h3>
                            <div className="skills-input-container">
                                <input
                                    type="text"
                                    className="input skills-input"
                                    placeholder="Enter a skill (e.g., JavaScript, React, UI Design)"
                                    value={currentSkill}
                                    onChange={(e) => setCurrentSkill(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddSkill();
                                        }
                                    }}
                                />
                                <button onClick={handleAddSkill} className="btn btn-primary">
                                    Add Skill
                                </button>
                            </div>
                            {formData.content.skills.length > 0 && (
                                <div className="skills-list">
                                    {formData.content.skills.map((skill, index) => (
                                        <div key={index} className="skill-tag">
                                            <span>{skill}</span>
                                            <button onClick={() => handleRemoveSkill(index)}>×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-section">
                            <h3>
                                <span className="section-icon">💼</span>
                                Projects & Work
                            </h3>
                            <div className="card" style={{ marginBottom: '20px', background: 'var(--gray-50)' }}>
                                <div className="form-group">
                                    <label className="label">Project Title</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="E-commerce Platform"
                                        value={currentProject.title}
                                        onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Description</label>
                                    <textarea
                                        className="textarea"
                                        rows="3"
                                        placeholder="Built a full-stack e-commerce platform with React and Node.js..."
                                        value={currentProject.description}
                                        onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Project Link (optional)</label>
                                    <input
                                        type="url"
                                        className="input"
                                        placeholder="https://github.com/yourusername/project"
                                        value={currentProject.link}
                                        onChange={(e) => setCurrentProject({ ...currentProject, link: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Technologies Used (optional)</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="React, Node.js, MongoDB, AWS"
                                        value={currentProject.technologies}
                                        onChange={(e) => setCurrentProject({ ...currentProject, technologies: e.target.value })}
                                    />
                                </div>
                                <button onClick={handleAddProject} className="btn btn-primary">
                                    Add Project
                                </button>
                            </div>

                            {formData.content.projects.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {formData.content.projects.map((project, index) => (
                                        <div key={index} className="card">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>
                                                        {project.title}
                                                    </h4>
                                                    <p style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>
                                                        {project.description}
                                                    </p>
                                                    {project.technologies && (
                                                        <p style={{ fontSize: '14px', color: 'var(--primary)' }}>
                                                            <strong>Tech:</strong> {project.technologies}
                                                        </p>
                                                    )}
                                                    {project.link && (
                                                        
                                                            href={project.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ fontSize: '14px', color: 'var(--primary)', marginTop: '8px', display: 'inline-block' }}
                                                        >
                                                            View Project →
                                                        </a>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveProject(index)}
                                                    className="btn btn-danger btn-small"
                                                    style={{ marginLeft: '16px' }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-section">
                            <h3>
                                <span className="section-icon">💻</span>
                                Work Experience
                            </h3>
                            <div className="card" style={{ marginBottom: '20px', background: 'var(--gray-50)' }}>
                                <div className="form-group">
                                    <label className="label">Position/Role</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Senior Software Engineer"
                                        value={currentExperience.position}
                                        onChange={(e) => setCurrentExperience({ ...currentExperience, position: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Company</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Tech Company Inc."
                                        value={currentExperience.company}
                                        onChange={(e) => setCurrentExperience({ ...currentExperience, company: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Duration</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Jan 2020 - Present"
                                        value={currentExperience.duration}
                                        onChange={(e) => setCurrentExperience({ ...currentExperience, duration: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Description</label>
                                    <textarea
                                        className="textarea"
                                        rows="3"
                                        placeholder="Led a team of 5 developers in building scalable web applications..."
                                        value={currentExperience.description}
                                        onChange={(e) => setCurrentExperience({ ...currentExperience, description: e.target.value })}
                                    />
                                </div>
                                <button onClick={handleAddExperience} className="btn btn-primary">
                                    Add Experience
                                </button>
                            </div>

                            {formData.content.experience.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {formData.content.experience.map((exp, index) => (
                                        <div key={index} className="card">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>
                                                        {exp.position}
                                                    </h4>
                                                    <p style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '4px' }}>
                                                        {exp.company}
                                                    </p>
                                                    <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '8px' }}>
                                                        {exp.duration}
                                                    </p>
                                                    <p style={{ color: 'var(--gray-700)' }}>{exp.description}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveExperience(index)}
                                                    className="btn btn-danger btn-small"
                                                    style={{ marginLeft: '16px' }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-section">
                            <h3>
                                <span className="section-icon">📧</span>
                                Contact Information
                            </h3>
                            <div className="contact-grid">
                                <div className="form-group">
                                    <label className="label">Email *</label>
                                    <input
                                        type="email"
                                        className="input"
                                        placeholder="your@email.com"
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
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Phone (optional)</label>
                                    <input
                                        type="tel"
                                        className="input"
                                        placeholder="+880 1234-567890"
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
                                </div>
                                <div className="form-group">
                                    <label className="label">LinkedIn (optional)</label>
                                    <input
                                        type="url"
                                        className="input"
                                        placeholder="https://linkedin.com/in/yourprofile"
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
                                </div>
                                <div className="form-group">
                                    <label className="label">GitHub (optional)</label>
                                    <input
                                        type="url"
                                        className="input"
                                        placeholder="https://github.com/yourusername"
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
                                <div className="form-group">
                                    <label className="label">Website (optional)</label>
                                    <input
                                        type="url"
                                        className="input"
                                        placeholder="https://yourwebsite.com"
                                        value={formData.content.contact.website}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                content: {
                                                    ...formData.content,
                                                    contact: { ...formData.content.contact, website: e.target.value },
                                                },
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="step-navigation">
                            <button onClick={() => setStep(2)} className="btn btn-secondary">
                                ← Back to Themes
                            </button>
                            <button onClick={handlePublish} className="btn btn-primary" disabled={loading}>
                                {loading ? 'Publishing...' : 'Publish Portfolio (' + (profile?.credits || 0) + ' credits)'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showCreditModal && (
                <div className="modal-overlay" onClick={() => setShowCreditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-icon">💳</div>
                        <h2>Insufficient Credits</h2>
                        <p>You need at least 1 credit to publish a portfolio. Purchase credits to continue.</p>
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