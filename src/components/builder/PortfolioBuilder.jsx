import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { uploadToCloudinary, uploadRawToCloudinary } from '../../services/cloudinary';
import { freeThemes, premiumThemes, getProThemeForProfession, themeIdMap } from '../../stores/themeStore';
import { Upload, FileText, Eye, X } from 'lucide-react';
import './PortfolioBuilder.css';

// ============================================================================
// THEME ID MAPPER - Converts string theme IDs to database numeric IDs
// ============================================================================
const mapThemeIdToDatabase = (stringThemeId) => {
    if (typeof stringThemeId === 'number') return stringThemeId;
    return themeIdMap[stringThemeId] || 1;
};

const PortfolioBuilder = () => {
    const { user, profile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const { portfolioId } = useParams();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPublishConfirm, setShowPublishConfirm] = useState(false);
    const [professions, setProfessions] = useState([]);
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
    const [currentEducation, setCurrentEducation] = useState({
        degree: '',
        institution: '',
        year: '',
        description: ''
    });

    // Builder toast notifications (replaces browser alert/confirm)
    const [builderToast, setBuilderToast] = useState(null);

    // CV Upload States
    const [cvUploading, setCvUploading] = useState(false);
    const [cvUrl, setCvUrl] = useState('');

    // Profession hierarchy state
    const [professionHierarchy, setProfessionHierarchy] = useState([]);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [selectedPath, setSelectedPath] = useState([]);
    const [showSpecialtyInput, setShowSpecialtyInput] = useState(false);

    const [formData, setFormData] = useState({
        profession_id: null,
        theme_id: 1, // Default to numeric ID
        username: profile?.username || '',
        cv_url: '', // CV URL field
        specialty_info: {
            doctor_type: '',
            teacher_level: '',
            booking_email: '',
        },
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
        },
    });

    const fetchProfessions = async () => {
        const { data } = await supabase
            .from('professions')
            .select('*')
            .order('level, name');

        if (data) {
            setProfessions(data || []);
            const rootProfessions = data.filter(p => p.level === 1);
            setProfessionHierarchy(rootProfessions);
        }
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
                cv_url: data.cv_url || '',
                specialty_info: data.specialty_info || {
                    doctor_type: '',
                    teacher_level: '',
                    booking_email: '',
                },
                content: data.content || {
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
                images: data.images || {
                    profile: '',
                },
            });

            // Set CV URL state
            setCvUrl(data.cv_url || '');
        }
    }, [portfolioId]);

    useEffect(() => {
        fetchProfessions();

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
                    navigate(`/edit/${data.id}`, { replace: true });
                }
            };
            checkExisting();
        }
    }, [portfolioId, fetchPortfolio, user, navigate]);

    // ============================================================================
    // CV UPLOAD HANDLERS
    // ============================================================================

    const handleCVUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Accept PDF and DOCX
        const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowed.includes(file.type)) {
            setBuilderToast({ msg: 'Please upload a PDF or DOCX file.', isError: true }); setTimeout(() => setBuilderToast(null), 3500);
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setBuilderToast({ msg: 'File size must be less than 10 MB.', isError: true }); setTimeout(() => setBuilderToast(null), 3500);
            return;
        }

        setCvUploading(true);
        try {
            // uploadRawToCloudinary uses /auto/upload — correct for PDFs/DOCX
            const url = await uploadRawToCloudinary(file);
            setCvUrl(url);
            setFormData(prev => ({ ...prev, cv_url: url }));
        } catch (error) {
            console.error('CV upload error:', error);
            setBuilderToast({ msg: 'Failed to upload CV. Please try again.', isError: true }); setTimeout(() => setBuilderToast(null), 3500);
        } finally {
            setCvUploading(false);
        }
    };

    const removeCVFile = () => {
        setCvUrl('');
        setFormData(prev => ({
            ...prev,
            cv_url: ''
        }));
    };

    // ============================================================================
    // PROFESSION HANDLERS
    // ============================================================================

    const handleProfessionSelect = async (profession) => {
        const newPath = [...selectedPath, profession];
        setSelectedPath(newPath);

        const children = professions.filter(p => p.parent_id === profession.id);

        if (children.length > 0) {
            setProfessionHierarchy(children);
            setCurrentLevel(currentLevel + 1);
        } else {
            setFormData({ ...formData, profession_id: profession.id });

            if (profession.requires_specialty) {
                setShowSpecialtyInput(true);
            } else {
                setShowSpecialtyInput(false);
                setStep(2);
            }
        }
    };

    const handleProfessionBack = () => {
        if (currentLevel === 1) return;

        const newPath = selectedPath.slice(0, -1);
        setSelectedPath(newPath);
        setCurrentLevel(currentLevel - 1);

        if (newPath.length === 0) {
            const rootProfessions = professions.filter(p => p.level === 1);
            setProfessionHierarchy(rootProfessions);
        } else {
            const parentId = newPath[newPath.length - 1].id;
            const siblings = professions.filter(p => p.parent_id === parentId);
            setProfessionHierarchy(siblings);
        }
    };

    const handleSpecialtySubmit = () => {
        const selectedProfession = professions.find(p => p.id === formData.profession_id);

        if (selectedProfession?.slug === 'doctor') {
            if (!formData.specialty_info.doctor_type || !formData.specialty_info.booking_email) {
                setBuilderToast({ msg: 'Please enter your specialty type and booking email.', isError: true }); setTimeout(() => setBuilderToast(null), 3500); return;
            }
        } else if (selectedProfession?.slug === 'teacher') {
            if (!formData.specialty_info.teacher_level) {
                setBuilderToast({ msg: 'Please select your teaching level.', isError: true }); setTimeout(() => setBuilderToast(null), 3500); return;
            }
        }

        setShowSpecialtyInput(false);
        setStep(2);
    };

    // ============================================================================
    // IMAGE UPLOAD HANDLERS
    // ============================================================================

    const handleImageUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (type === 'profile') {
            const img = new Image();
            img.onload = async () => {
                const aspectRatio = img.width / img.height;
                if (Math.abs(aspectRatio - 1) > 0.1) {
                    setBuilderToast({ msg: 'Please upload a square image (1:1 aspect ratio).', isError: true }); setTimeout(() => setBuilderToast(null), 3500);
                    return;
                }

                setLoading(true);
                try {
                    // uploadToCloudinary now returns a plain string URL
                    const url = await uploadToCloudinary(file);
                    setFormData(prev => ({
                        ...prev,
                        images: { ...prev.images, [type]: url },
                    }));
                } catch (error) {
                    setBuilderToast({ msg: 'Failed to upload image. Please try again.', isError: true }); setTimeout(() => setBuilderToast(null), 3500);
                } finally {
                    setLoading(false);
                }
            };
            img.src = URL.createObjectURL(file);
        }
    };

    // ============================================================================
    // CONTENT MANAGEMENT HANDLERS
    // ============================================================================

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
            setBuilderToast({ msg: 'Please enter a project title.', isError: true }); setTimeout(() => setBuilderToast(null), 3500);
            return;
        }

        setFormData({
            ...formData,
            content: {
                ...formData.content,
                projects: [...formData.content.projects, { ...currentProject }]
            }
        });

        setCurrentProject({ title: '', description: '', link: '', technologies: '' });
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
            setBuilderToast({ msg: 'Please enter position and company.', isError: true }); setTimeout(() => setBuilderToast(null), 3500);
            return;
        }

        setFormData({
            ...formData,
            content: {
                ...formData.content,
                experience: [...formData.content.experience, { ...currentExperience }]
            }
        });

        setCurrentExperience({ position: '', company: '', duration: '', description: '' });
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

    const handleAddEducation = () => {
        if (!currentEducation.degree.trim() || !currentEducation.institution.trim()) {
            setBuilderToast({ msg: 'Please enter degree and institution.', isError: true }); setTimeout(() => setBuilderToast(null), 3500);
            return;
        }

        setFormData({
            ...formData,
            content: {
                ...formData.content,
                education: [...formData.content.education, { ...currentEducation }]
            }
        });

        setCurrentEducation({ degree: '', institution: '', year: '', description: '' });
    };

    const handleRemoveEducation = (index) => {
        setFormData({
            ...formData,
            content: {
                ...formData.content,
                education: formData.content.education.filter((_, i) => i !== index)
            }
        });
    };

    // ============================================================================
    // SAVE & PUBLISH HANDLERS
    // ============================================================================

    const handleSaveDraft = async () => {
        setLoading(true);
        try {
            const portfolioData = {
                user_id: user.id,
                profession_id: formData.profession_id,
                theme_id: mapThemeIdToDatabase(formData.theme_id),
                username: formData.username,
                cv_url: cvUrl || null, // Include CV URL
                specialty_info: formData.specialty_info,
                content: formData.content,
                images: formData.images,
                is_published: false,
            };

            if (portfolioId) {
                await supabase.from('portfolios').update(portfolioData).eq('id', portfolioId);
            } else {
                await supabase.from('portfolios').insert([portfolioData]);
            }

            setBuilderToast({ msg: 'Portfolio saved as draft!' }); setTimeout(() => setBuilderToast(null), 3500);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error saving:', error);
            setBuilderToast({ msg: 'Failed to save portfolio. Please try again.', isError: true }); setTimeout(() => setBuilderToast(null), 3500);
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
            setBuilderToast({ msg: 'Please select a profession and theme.', isError: true }); setTimeout(() => setBuilderToast(null), 3500);
            return;
        }

        if (!formData.content.about || !formData.content.contact.email) {
            setBuilderToast({ msg: 'Please fill in at least the About section and email.', isError: true }); setTimeout(() => setBuilderToast(null), 3500);
            return;
        }

        setShowPublishConfirm(true);
    };

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    const getProfessionClassName = (professionId) => {
        return 'profession-card' + (formData.profession_id === professionId ? ' selected' : '');
    };



    const getStepClassName = (stepNumber) => {
        let className = 'step-item';
        if (step >= stepNumber) className += ' active';
        if (step > stepNumber) className += ' completed';
        return className;
    };

    const getImageBoxClassName = (hasImage) => {
        return 'image-upload-box' + (hasImage ? ' has-image' : '');
    };

    const renderBreadcrumb = () => {
        if (selectedPath.length === 0) return null;

        return (
            <div className="profession-breadcrumb">
                {selectedPath.map((prof, index) => (
                    <span key={prof.id}>
                        {prof.name}
                        {index < selectedPath.length - 1 && ' > '}
                    </span>
                ))}
            </div>
        );
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <div className="portfolio-builder">
            {builderToast && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
                    background: builderToast.isError ? '#ef4444' : '#22c55e',
                    color: 'white', padding: '14px 20px', borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)', fontWeight: '600',
                    maxWidth: '340px'
                }}>
                    {builderToast.msg}
                </div>
            )}
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
                    <div className={getStepClassName(1)}>
                        <div className="step-number">{step > 1 ? '✓' : '1'}</div>
                        <span>Profession</span>
                    </div>
                    <div className={getStepClassName(2)}>
                        <div className="step-number">{step > 2 ? '✓' : '2'}</div>
                        <span>Theme</span>
                    </div>
                    <div className={getStepClassName(3)}>
                        <div className="step-number">3</div>
                        <span>Content</span>
                    </div>
                </div>

                {/* STEP 1: Profession Selection */}
                {step === 1 && !showSpecialtyInput && (
                    <div className="step-content">
                        <h2>Choose Your Profession</h2>
                        <p className="step-description">
                            Select your profession to get tailored sections for your portfolio.
                        </p>

                        {renderBreadcrumb()}

                        <div className="profession-grid">
                            {professionHierarchy.map((profession) => (
                                <div
                                    key={profession.id}
                                    className={getProfessionClassName(profession.id)}
                                    onClick={() => handleProfessionSelect(profession)}
                                >
                                    <span className="profession-icon">{profession.icon}</span>
                                    <h3>{profession.name}</h3>
                                    <p>{profession.description}</p>
                                </div>
                            ))}
                        </div>

                        {currentLevel > 1 && (
                            <div className="step-navigation">
                                <button onClick={handleProfessionBack} className="btn btn-secondary">
                                    ← Back
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 1.5: Specialty Input */}
                {step === 1 && showSpecialtyInput && (
                    <div className="step-content">
                        <h2>Additional Information</h2>
                        <p className="step-description">
                            Please provide some additional details about your profession.
                        </p>

                        {formData.profession_id && professions.find(p => p.id === formData.profession_id)?.slug === 'doctor' && (
                            <>
                                <div className="form-group">
                                    <label className="label">What type of doctor are you?</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g., Cardiologist, Pediatrician, Surgeon"
                                        value={formData.specialty_info.doctor_type}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                specialty_info: {
                                                    ...formData.specialty_info,
                                                    doctor_type: e.target.value
                                                }
                                            })
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Booking Email</label>
                                    <input
                                        type="email"
                                        className="input"
                                        placeholder="Email where you receive appointment requests"
                                        value={formData.specialty_info.booking_email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                specialty_info: {
                                                    ...formData.specialty_info,
                                                    booking_email: e.target.value
                                                }
                                            })
                                        }
                                    />
                                    <p className="upload-hint">
                                        Your portfolio will include a "Book Session" button that sends emails to this address
                                    </p>
                                </div>
                            </>
                        )}

                        {formData.profession_id && professions.find(p => p.id === formData.profession_id)?.slug === 'teacher' && (
                            <div className="form-group">
                                <label className="label">What level do you teach?</label>
                                <select
                                    className="input"
                                    value={formData.specialty_info.teacher_level}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            specialty_info: {
                                                ...formData.specialty_info,
                                                teacher_level: e.target.value
                                            }
                                        })
                                    }
                                >
                                    <option value="">Select level...</option>
                                    <option value="primary">Primary School</option>
                                    <option value="school">Secondary School</option>
                                    <option value="college">College</option>
                                    <option value="university">University</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        )}

                        <div className="step-navigation">
                            <button
                                onClick={() => {
                                    setShowSpecialtyInput(false);
                                    setFormData({ ...formData, profession_id: null });
                                    handleProfessionBack();
                                }}
                                className="btn btn-secondary"
                            >
                                ← Back
                            </button>
                            <button onClick={handleSpecialtySubmit} className="btn btn-primary">
                                Continue →
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Theme Selection */}
                {step === 2 && (() => {
                    // Get selected profession's slug for pro theme
                    const selectedProf = professions.find(p => p.id === formData.profession_id);
                    const profSlug = selectedProf?.slug || 'default';
                    const proTheme = getProThemeForProfession(profSlug);
                    const hasCredits = (profile?.credits ?? 0) >= 1;

                    // Selected theme id (string)
                    const selectedThemeId = Object.keys(themeIdMap).find(
                        k => themeIdMap[k] === formData.theme_id
                    ) || 'light';

                    const selectTheme = (themeId) => {
                        setFormData({ ...formData, theme_id: mapThemeIdToDatabase(themeId) });
                    };

                    const ThemeCard = ({ theme, locked, isSelected, badge }) => {
                        const bg = theme.gradient ||
                            `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`;
                        return (
                            <div
                                onClick={() => {
                                    if (locked) {
                                        setBuilderToast({ msg: 'This theme requires credits. Purchase credits to unlock.', isError: true });
                                        setTimeout(() => setBuilderToast(null), 3500);
                                        return;
                                    }
                                    selectTheme(theme.id);
                                }}
                                style={{
                                    borderRadius: '14px',
                                    overflow: 'hidden',
                                    border: isSelected ? '3px solid #6366f1' : '3px solid transparent',
                                    boxShadow: isSelected ? '0 0 0 3px rgba(99,102,241,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                                    cursor: locked ? 'not-allowed' : 'pointer',
                                    opacity: locked ? 0.6 : 1,
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    background: 'white',
                                }}
                            >
                                <div style={{ height: '90px', background: bg }} />
                                <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '600', fontSize: '14px' }}>
                                        {theme.icon} {theme.name}
                                    </span>
                                    <span style={{
                                        fontSize: '11px', fontWeight: '700', padding: '2px 8px',
                                        borderRadius: '20px',
                                        background: badge === 'free' ? '#dcfce7' : badge === 'pro' ? '#fef3c7' : '#f3e8ff',
                                        color: badge === 'free' ? '#16a34a' : badge === 'pro' ? '#d97706' : '#7c3aed',
                                    }}>
                                        {badge === 'free' ? '✓ Free' : badge === 'pro' ? '⚡ Pro Theme' : '⭐ Premium'}
                                    </span>
                                </div>
                                {isSelected && (
                                    <div style={{
                                        position: 'absolute', top: '8px', right: '8px',
                                        background: '#6366f1', color: 'white', borderRadius: '50%',
                                        width: '24px', height: '24px', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800'
                                    }}>✓</div>
                                )}
                                {locked && (
                                    <div style={{
                                        position: 'absolute', top: '8px', left: '8px',
                                        background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '20px',
                                        padding: '2px 10px', fontSize: '11px', fontWeight: '600'
                                    }}>🔒 Locked</div>
                                )}
                            </div>
                        );
                    };

                    return (
                        <div className="step-content">
                            <h2>Pick Your Style</h2>
                            <p className="step-description">
                                Choose the look for your portfolio. Light &amp; Dark are always free — both available to you!
                            </p>

                            {/* FREE SECTION */}
                            <div style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                    <span style={{ fontWeight: '700', fontSize: '16px' }}>☀️🌙 Free Themes</span>
                                    <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: '600', background: '#dcfce7', padding: '2px 10px', borderRadius: '20px' }}>Both always included</span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                                    You can switch between Light and Dark anytime — no credits needed.
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    {freeThemes.map(t => (
                                        <ThemeCard key={t.id} theme={t} locked={false} isSelected={selectedThemeId === t.id} badge="free" />
                                    ))}
                                </div>
                            </div>

                            {/* PRO SECTION */}
                            <div style={{ marginBottom: '32px', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', borderRadius: '16px', padding: '20px', border: '1px solid #fde68a' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: '700', fontSize: '16px' }}>⚡ Your Profession Theme</span>
                                    <span style={{ fontSize: '11px', color: '#d97706', fontWeight: '700', background: '#fef3c7', padding: '2px 10px', borderRadius: '20px', border: '1px solid #fde68a' }}>+1 Credit</span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#78350f', marginBottom: '16px', lineHeight: '1.5' }}>
                                    <strong>"{proTheme.name}"</strong> — {proTheme.description}. Designed exclusively for your profession.
                                </p>
                                <ThemeCard
                                    theme={proTheme}
                                    locked={!hasCredits}
                                    isSelected={selectedThemeId === proTheme.id}
                                    badge="pro"
                                />
                                {!hasCredits && (
                                    <p style={{ fontSize: '12px', color: '#92400e', marginTop: '10px', textAlign: 'center' }}>
                                        You need 1 credit to unlock this theme. <a href="/credits" style={{ color: '#d97706', fontWeight: '700' }}>Buy credits →</a>
                                    </p>
                                )}
                            </div>

                            {/* PREMIUM SECTION */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                    <span style={{ fontWeight: '700', fontSize: '16px' }}>⭐ Premium Color Themes</span>
                                    <span style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '700', background: '#f3e8ff', padding: '2px 10px', borderRadius: '20px' }}>Requires credits</span>
                                </div>
                                <div className="theme-grid">
                                    {premiumThemes.map(t => (
                                        <ThemeCard key={t.id} theme={t} locked={!hasCredits} isSelected={selectedThemeId === t.id} badge="premium" />
                                    ))}
                                </div>
                            </div>

                            <div className="step-navigation" style={{ marginTop: '32px' }}>
                                <button onClick={() => setStep(1)} className="btn btn-secondary">← Back</button>
                                <button onClick={() => setStep(3)} className="btn btn-primary">
                                    Continue with {freeThemes.find(t => t.id === selectedThemeId)?.name || premiumThemes.find(t => t.id === selectedThemeId)?.name || proTheme.name} →
                                </button>
                            </div>
                        </div>
                    );
                })()}

                {/* STEP 3: Content */}
                {step === 3 && (
                    <div className="step-content">
                        <h2>Build Your Portfolio</h2>
                        <p className="step-description">
                            Fill in your details to create a stunning, professional portfolio.
                        </p>

                        {/* CV Upload Section - NEW */}
                        <div className="form-section">
                            <h3>
                                <span className="section-icon">📄</span>
                                Resume / CV
                            </h3>
                            <p className="step-description" style={{ marginBottom: '1rem' }}>
                                Upload your resume/CV (PDF or DOCX, max 10MB). This will appear as a download button in your portfolio.
                            </p>

                            <div className="cv-upload-container">
                                {!cvUrl ? (
                                    <div className="upload-area">
                                        <input
                                            type="file"
                                            id="cv-upload"
                                            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                            onChange={handleCVUpload}
                                            disabled={cvUploading}
                                            style={{ display: 'none' }}
                                        />
                                        <label htmlFor="cv-upload" className="upload-label">
                                            {cvUploading ? (
                                                <>
                                                    <div className="spinner-small"></div>
                                                    <span>Uploading CV...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={24} />
                                                    <span>Click to upload CV (PDF or DOCX)</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                ) : (
                                    <div className="cv-uploaded">
                                        <div className="cv-info">
                                            <FileText size={20} />
                                            <span>CV uploaded successfully!</span>
                                        </div>
                                        <div className="cv-actions">
                                            <a
                                                href={cvUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-view-cv"
                                            >
                                                <Eye size={16} />
                                                Preview
                                            </a>
                                            <button
                                                type="button"
                                                onClick={removeCVFile}
                                                className="btn-remove-cv"
                                            >
                                                <X size={16} />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Image */}
                        <div className="form-section">
                            <h3>
                                <span className="section-icon">📸</span>
                                Profile Image
                            </h3>
                            <div className="image-uploads">
                                <div className={getImageBoxClassName(formData.images.profile)}>
                                    <label>Profile Picture (Square Image)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'profile')}
                                    />
                                    <p className="upload-hint">
                                        <strong>Required:</strong> Please upload a square image (1:1 ratio), at least 400x400px
                                    </p>
                                    {formData.images.profile && (
                                        <img src={formData.images.profile} alt="Profile" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* About Section */}
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

                        {/* Skills Section */}
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

                        {/* Education Section */}
                        <div className="form-section">
                            <h3>
                                <span className="section-icon">🎓</span>
                                Education
                            </h3>
                            <div className="card" style={{ marginBottom: '20px', background: 'var(--gray-50)' }}>
                                <div className="form-group">
                                    <label className="label">Degree</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Bachelor of Science in Computer Science"
                                        value={currentEducation.degree}
                                        onChange={(e) => setCurrentEducation({ ...currentEducation, degree: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Institution</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Harvard University"
                                        value={currentEducation.institution}
                                        onChange={(e) => setCurrentEducation({ ...currentEducation, institution: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Year</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="2020"
                                        value={currentEducation.year}
                                        onChange={(e) => setCurrentEducation({ ...currentEducation, year: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Description (optional)</label>
                                    <textarea
                                        className="textarea"
                                        rows="3"
                                        placeholder="Graduated with honors, GPA 3.9/4.0..."
                                        value={currentEducation.description}
                                        onChange={(e) => setCurrentEducation({ ...currentEducation, description: e.target.value })}
                                    />
                                </div>
                                <button onClick={handleAddEducation} className="btn btn-primary">
                                    Add Education
                                </button>
                            </div>

                            {formData.content.education.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {formData.content.education.map((edu, index) => (
                                        <div key={index} className="card">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>
                                                        {edu.degree}
                                                    </h4>
                                                    <p style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '4px' }}>
                                                        {edu.institution}
                                                    </p>
                                                    <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '8px' }}>
                                                        {edu.year}
                                                    </p>
                                                    {edu.description && <p style={{ color: 'var(--gray-700)' }}>{edu.description}</p>}
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveEducation(index)}
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

                        {/* Projects Section */}
                        <div className="form-section">
                            <h3>
                                <span className="section-icon">💼</span>
                                Projects / Papers
                            </h3>
                            <div className="card" style={{ marginBottom: '20px', background: 'var(--gray-50)' }}>
                                <div className="form-group">
                                    <label className="label">Project/Paper Title</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="E-commerce Platform / Research Paper Title"
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
                                    <label className="label">Link (optional)</label>
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
                                                        <a
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

                        {/* Work Experience Section */}
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

                        {/* Contact Information */}
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

            {showPublishConfirm && (
                <div className="modal-overlay" onClick={() => setShowPublishConfirm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-icon">🚀</div>
                        <h2>Publish Portfolio?</h2>
                        <p>This will use <strong>1 credit</strong> from your balance
                            &nbsp;(you have <strong>{profile?.credits ?? 0}</strong>). Your portfolio
                            will be publicly accessible at:
                        </p>
                        <p style={{ fontWeight: 700, marginTop: 8 }}>
                            /{formData.username || 'your-username'}
                        </p>
                        <div className="modal-actions">
                            <button
                                onClick={async () => {
                                    setShowPublishConfirm(false);
                                    // Re-run the actual publish body
                                    setLoading(true);
                                    try {
                                        const portfolioData = {
                                            user_id: user.id,
                                            profession_id: formData.profession_id,
                                            theme_id: mapThemeIdToDatabase(formData.theme_id),
                                            username: formData.username,
                                            cv_url: cvUrl || null,
                                            specialty_info: formData.specialty_info,
                                            content: formData.content,
                                            images: formData.images,
                                        };

                                        let portfolioIdToPublish = portfolioId;

                                        if (portfolioId) {
                                            const { error } = await supabase
                                                .from('portfolios').update(portfolioData).eq('id', portfolioId);
                                            if (error) throw error;
                                        } else {
                                            const { data, error } = await supabase
                                                .from('portfolios').insert([portfolioData]).select().single();
                                            if (error) throw error;
                                            if (data) portfolioIdToPublish = data.id;
                                        }

                                        if (!portfolioIdToPublish) throw new Error('Failed to create portfolio ID');

                                        const { error: publishError } = await supabase.rpc('publish_portfolio_safe', {
                                            p_portfolio_id: portfolioIdToPublish,
                                            p_user_id: user.id,
                                        });

                                        if (publishError) throw publishError;
                                        refreshProfile();
                                        navigate('/dashboard');
                                    } catch (error) {
                                        console.error('Error publishing:', error);
                                        setBuilderToast({ msg: error.message || 'Failed to publish portfolio.', isError: true }); setTimeout(() => setBuilderToast(null), 3500);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Publishing…' : 'Yes, Publish (–1 credit)'}
                            </button>
                            <button onClick={() => setShowPublishConfirm(false)} className="btn btn-secondary">
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