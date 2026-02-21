import React from 'react';
import {
    Download, Mail, Phone, MapPin, Moon, Sun,
    Github, Linkedin, Twitter, Globe,
    Briefcase, Award, Code, GraduationCap
} from 'lucide-react';
import './MehedyDark.css';

// ─────────────────────────────────────────────────────────────────────────────
// MehedyDark – Dark portfolio template
// ALL class names are prefixed with  md-  (zero collision with global CSS)
// CursorTrail is rendered once in App.jsx — do NOT import it here
// ─────────────────────────────────────────────────────────────────────────────

const MehedyDark = ({ portfolio, content, images, specialty_info, onToggleTheme, isDarkMode }) => {
    const userProfile = portfolio?.user_profiles || {};
    const profession = portfolio?.professions?.name || 'Professional';
    const cvUrl = portfolio?.cv_url || content?.cv_url;

    const mdScrollTo = (sectionId) => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const mdDownloadCV = () => {
        if (cvUrl) window.open(cvUrl, '_blank');
    };

    return (
        <div className="mehedy-dark-portfolio">

            {/* ── Navigation ── */}
            <nav className="md-nav">
                <div className="md-nav-container">
                    <div className="md-nav-brand">{userProfile.full_name || 'Portfolio'}</div>

                    <div className="md-nav-links">
                        {[
                            ['about', 'About'],
                            ['skills', 'Skills'],
                            ['experience', 'Experience'],
                            ['education', 'Education'],
                            ['projects', 'Projects'],
                            ['contact', 'Contact'],
                        ].map(([id, label]) => (
                            <a
                                key={id}
                                href={`#${id}`}
                                onClick={(e) => { e.preventDefault(); mdScrollTo(id); }}
                            >
                                {label}
                            </a>
                        ))}

                        {cvUrl && (
                            <button className="md-nav-cv-btn" onClick={mdDownloadCV}>
                                <Download size={15} />
                                <span>CV</span>
                            </button>
                        )}

                        <button className="md-theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Hero Section ── */}
            <section className="md-hero-section" id="about">
                <div className="md-hero-container">
                    <div className="md-hero-content">

                        {/* Hexagonal profile photo */}
                        <div className="md-hero-left">
                            <div className="md-hexagon-wrapper">
                                <div className="md-hexagon-profile">
                                    {images?.profile ? (
                                        <img src={images.profile} alt={userProfile.full_name} />
                                    ) : (
                                        <div className="md-profile-placeholder">
                                            {userProfile.full_name?.charAt(0)?.toUpperCase() || 'P'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Name / Profession / Bio */}
                        <div className="md-hero-right">
                            <div className="md-hero-greeting">Hello, I'm</div>
                            <h1 className="md-hero-name">{userProfile.full_name || 'Portfolio Owner'}</h1>
                            <div className="md-hero-profession">{profession}</div>

                            <p className="md-hero-bio">
                                {content?.about || 'Welcome to my portfolio. I am passionate about creating amazing experiences.'}
                            </p>

                            <div className="md-hero-actions">
                                <a
                                    href="#contact"
                                    className="md-btn-primary"
                                    onClick={(e) => { e.preventDefault(); mdScrollTo('contact'); }}
                                >
                                    <Mail size={18} />
                                    Get in Touch
                                </a>

                                {cvUrl && (
                                    <button className="md-btn-secondary" onClick={mdDownloadCV}>
                                        <Download size={18} />
                                        Download CV
                                    </button>
                                )}
                            </div>

                            {/* Social links */}
                            {content?.contact && (
                                <div className="md-hero-socials">
                                    {content.contact.github && (
                                        <a href={content.contact.github} target="_blank" rel="noopener noreferrer" title="GitHub">
                                            <Github size={20} />
                                        </a>
                                    )}
                                    {content.contact.linkedin && (
                                        <a href={content.contact.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                                            <Linkedin size={20} />
                                        </a>
                                    )}
                                    {content.contact.twitter && (
                                        <a href={content.contact.twitter} target="_blank" rel="noopener noreferrer" title="Twitter">
                                            <Twitter size={20} />
                                        </a>
                                    )}
                                    {content.contact.website && (
                                        <a href={content.contact.website} target="_blank" rel="noopener noreferrer" title="Website">
                                            <Globe size={20} />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Skills ── */}
            <section className="md-skills-section" id="skills">
                <div className="md-section-container">
                    <div className="md-section-header">
                        <Code className="md-section-icon" />
                        <h2>Skills &amp; Expertise</h2>
                    </div>
                    <div className="md-skills-grid">
                        {content?.skills?.length > 0 ? (
                            content.skills.map((skill, i) => (
                                <div key={i} className="md-skill-card">
                                    <div className="md-skill-name">{skill.name || skill}</div>
                                    {skill.level && (
                                        <div className="md-skill-level">
                                            <div className="md-skill-bar">
                                                <div className="md-skill-progress" style={{ width: `${skill.level}%` }} />
                                            </div>
                                            <span className="md-skill-percent">{skill.level}%</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="md-no-content">No skills added yet.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Experience ── */}
            <section className="md-experience-section" id="experience">
                <div className="md-section-container">
                    <div className="md-section-header">
                        <Briefcase className="md-section-icon" />
                        <h2>Work Experience</h2>
                    </div>
                    <div className="md-timeline">
                        {content?.experience?.length > 0 ? (
                            content.experience.map((exp, i) => (
                                <div key={i} className="md-timeline-item">
                                    <div className="md-timeline-marker" />
                                    <div className="md-timeline-content">
                                        <div className="md-timeline-header">
                                            <h3>{exp.position || exp.title}</h3>
                                            <span className="md-timeline-date">{exp.duration || exp.period}</span>
                                        </div>
                                        <div className="md-timeline-company">{exp.company}</div>
                                        {exp.description && <p className="md-timeline-desc">{exp.description}</p>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="md-no-content">No experience added yet.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Education ── (was missing — data was stored but never rendered) */}
            <section className="md-education-section" id="education">
                <div className="md-section-container">
                    <div className="md-section-header">
                        <GraduationCap className="md-section-icon" />
                        <h2>Education</h2>
                    </div>
                    <div className="md-timeline">
                        {content?.education?.length > 0 ? (
                            content.education.map((edu, i) => (
                                <div key={i} className="md-timeline-item">
                                    <div className="md-timeline-marker" />
                                    <div className="md-timeline-content">
                                        <div className="md-timeline-header">
                                            <h3>{edu.degree}</h3>
                                            <span className="md-timeline-date">{edu.year}</span>
                                        </div>
                                        <div className="md-timeline-company">{edu.institution}</div>
                                        {edu.description && <p className="md-timeline-desc">{edu.description}</p>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="md-no-content">No education added yet.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Projects ── */}
            <section className="md-projects-section" id="projects">
                <div className="md-section-container">
                    <div className="md-section-header">
                        <Award className="md-section-icon" />
                        <h2>Featured Projects</h2>
                    </div>
                    <div className="md-projects-grid">
                        {content?.projects?.length > 0 ? (
                            content.projects.map((project, i) => (
                                <div key={i} className="md-project-card">
                                    {project.image && (
                                        <div className="md-project-image">
                                            <img src={project.image} alt={project.name || project.title} />
                                        </div>
                                    )}
                                    <div className="md-project-content">
                                        <h3>{project.name || project.title}</h3>
                                        <p>{project.description}</p>
                                        {project.technologies && (
                                            <div className="md-project-tags">
                                                {project.technologies.split(',').map((tech, ti) => (
                                                    <span key={ti} className="md-tag">{tech.trim()}</span>
                                                ))}
                                            </div>
                                        )}
                                        {(project.liveUrl || project.githubUrl || project.link) && (
                                            <div className="md-project-links">
                                                {(project.liveUrl || project.link) && (
                                                    <a href={project.liveUrl || project.link} target="_blank" rel="noopener noreferrer">
                                                        <Globe size={15} /> View Project
                                                    </a>
                                                )}
                                                {project.githubUrl && (
                                                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                                        <Github size={15} /> Code
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="md-no-content">No projects added yet.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Contact ── */}
            <section className="md-contact-section" id="contact">
                <div className="md-section-container">
                    <div className="md-section-header">
                        <Mail className="md-section-icon" />
                        <h2>Get In Touch</h2>
                    </div>
                    <div className="md-contact-content">
                        <p className="md-contact-intro">Interested in working together? Feel free to reach out!</p>
                        <div className="md-contact-info">
                            {content?.contact?.email && (
                                <a href={`mailto:${content.contact.email}`} className="md-contact-item">
                                    <Mail size={20} />
                                    <span>{content.contact.email}</span>
                                </a>
                            )}
                            {content?.contact?.phone && (
                                <a href={`tel:${content.contact.phone}`} className="md-contact-item">
                                    <Phone size={20} />
                                    <span>{content.contact.phone}</span>
                                </a>
                            )}
                            {content?.contact?.location && (
                                <div className="md-contact-item">
                                    <MapPin size={20} />
                                    <span>{content.contact.location}</span>
                                </div>
                            )}
                            {content?.contact?.github && (
                                <a href={content.contact.github} className="md-contact-item" target="_blank" rel="noopener noreferrer">
                                    <Github size={20} />
                                    <span>{content.contact.github}</span>
                                </a>
                            )}
                            {content?.contact?.linkedin && (
                                <a href={content.contact.linkedin} className="md-contact-item" target="_blank" rel="noopener noreferrer">
                                    <Linkedin size={20} />
                                    <span>{content.contact.linkedin}</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="md-portfolio-footer">
                <p>© {new Date().getFullYear()} {userProfile.full_name}. Crafted with passion.</p>
            </footer>
        </div>
    );
};

export default MehedyDark;