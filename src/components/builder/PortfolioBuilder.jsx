import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { uploadToCloudinary, uploadRawToCloudinary } from '../../services/cloudinary';
import { themes as localThemes } from '../../stores/themeStore';
import { Upload, FileText, Eye, X } from 'lucide-react';
import './PortfolioBuilder.css';

// ============================================================================
// THEME ID MAPPER - Converts string theme IDs to database numeric IDs
// ============================================================================
const mapThemeIdToDatabase = (stringThemeId) => {
    const themeMapping = {
        'light': 1,
        'dark': 2,
        'professional-blue': 3,
        'minimal-gray': 4,
        'fresh-green': 5,
        'dark-elegance': 6,
        'midnight-slate': 7,
        'carbon-gold': 8,
        'ocean-breeze': 9,
        'sunset-glow': 10,
        'purple-reign': 11,
        'rose-pink': 12,
        'crimson-red': 13,
        'lime-fresh': 14,
        'teal-mint': 15
    };

    // If it's already a number, return it
    if (typeof stringThemeId === 'number') {
        return stringThemeId;
    }

    // If it's a string, map it to the database ID
    return themeMapping[stringThemeId] || 1; // Default to 1 if not found
};

const PortfolioBuilder = () => {
    const { user, profile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const { portfolioId } = useParams();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPublishConfirm, setShowPublishConfirm] = useState(false);
    const [professions, setProfessions] = useState([]);
    const [themes] = useState(localThemes); // Initialize with local themes
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
            alert('Please upload a PDF or DOCX file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10 MB');
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
            alert('Failed to upload CV: ' + error.message);
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
                alert('Please enter your specialty type and booking email');
                return;
            }
        } else if (selectedProfession?.slug === 'teacher') {
            if (!formData.specialty_info.teacher_level) {
                alert('Please select your teaching level');
                return;
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
                    alert('Please upload a square image (1:1 aspect ratio) for your profile picture');
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
                    alert('Failed to upload image: ' + error.message);
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
            alert('Please enter degree and institution');
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

        setShowPublishConfirm(true);
    };

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    const getProfessionClassName = (professionId) => {
        return 'profession-card' + (formData.profession_id === professionId ? ' selected' : '');
    };

    const getThemeClassName = (themeId, isLocked) => {
        let className = 'theme-card';
        if (formData.theme_id === themeId) className += ' selected';
        if (isLocked) className += ' locked';
        return className;
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
                {step === 2 && (
                    <div className="step-content">
                        <h2>Pick Your Style</h2>
                        <p className="step-description">
                            Choose a theme that represents your personality and profession.
                        </p>
                        <div className="theme-grid">
                            {themes.map((theme) => {
                                const isLocked = theme.tier === 'premium' && profile?.credits < 1;
                                const gradientStyle = {
                                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                                };
                                return (
                                    <div
                                        key={theme.id}
                                        className={getThemeClassName(theme.id, isLocked)}
                                        onClick={() => {
                                            if (isLocked) {
                                                alert('Premium themes require credits. Please purchase credits first.');
                                                return;
                                            }
                                            setFormData({ ...formData, theme_id: mapThemeIdToDatabase(theme.id) });
                                            setStep(3);
                                        }}
                                    >
                                        <div className="theme-preview" style={gradientStyle}></div>
                                        <div className="theme-info">
                                            <h3>{theme.name}</h3>
                                            <span className={`theme-badge ${theme.tier}`}>
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
                                Upload your resume/CV (PDF only, max 5MB). This will appear as a download button in your portfolio.
                            </p>

                            <div className="cv-upload-container">
                                {!cvUrl ? (
                                    <div className="upload-area">
                                        <input
                                            type="file"
                                            id="cv-upload"
                                            accept=".pdf,application/pdf"
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
                                                    <span>Click to upload CV (PDF)</span>
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
                                        alert(error.message || 'Failed to publish portfolio');
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