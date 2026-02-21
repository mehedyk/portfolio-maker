import React from 'react';
import {
    Download, Mail, Phone, MapPin, Moon, Sun,
    Github, Linkedin, Twitter, Globe,
    Briefcase, Award, Code, GraduationCap
} from 'lucide-react';
import './MehedyLight.css';

// ─────────────────────────────────────────────────────────────────────────────
// MehedyLight – Light portfolio template
// ALL class names are prefixed with  ml-  (zero collision with global CSS)
// CursorTrail is rendered once in App.jsx — do NOT import it here
// ─────────────────────────────────────────────────────────────────────────────

const MehedyLight = ({ portfolio, content, images, specialty_info, onToggleTheme, isDarkMode }) => {
    const userProfile = portfolio?.user_profiles || {};
    const profession = portfolio?.professions?.name || 'Professional';
    const cvUrl = portfolio?.cv_url || content?.cv_url;

    const mlScrollTo = (sectionId) => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const mlDownloadCV = () => {
        if (cvUrl) window.open(cvUrl, '_blank');
    };

    return (
        <div className="mehedy-light-portfolio">

            {/* ── Navigation ── */}
            <nav className="ml-nav">
                <div className="ml-nav-container">
                    <div className="ml-nav-brand">{userProfile.full_name || 'Portfolio'}</div>

                    <div className="ml-nav-links">
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
                                onClick={(e) => { e.preventDefault(); mlScrollTo(id); }}
                            >
                                {label}
                            </a>
                        ))}

                        {cvUrl && (
                            <button className="ml-nav-cv-btn" onClick={mlDownloadCV}>
                                <Download size={15} />
                                <span>CV</span>
                            </button>
                        )}

                        <button className="ml-theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Hero Section ── */}
            <section className="ml-hero-section" id="about">
                <div className="ml-hero-container">
                    <div className="ml-hero-content">

                        {/* Hexagonal profile photo */}
                        <div className="ml-hero-left">
                            <div className="ml-hexagon-wrapper">
                                <div className="ml-hexagon-profile">
                                    {images?.profile ? (
                                        <img src={images.profile} alt={userProfile.full_name} />
                                    ) : (
                                        <div className="ml-profile-placeholder">
                                            {userProfile.full_name?.charAt(0)?.toUpperCase() || 'P'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Name / Profession / Bio */}
                        <div className="ml-hero-right">
                            <div className="ml-hero-greeting">Hello, I'm</div>
                            <h1 className="ml-hero-name">{userProfile.full_name || 'Portfolio Owner'}</h1>
                            <div className="ml-hero-profession">{profession}</div>

                            <p className="ml-hero-bio">
                                {content?.about || 'Welcome to my portfolio. I am passionate about creating amazing experiences.'}
                            </p>

                            <div className="ml-hero-actions">
                                <a
                                    href="#contact"
                                    className="ml-btn-primary"
                                    onClick={(e) => { e.preventDefault(); mlScrollTo('contact'); }}
                                >
                                    <Mail size={18} />
                                    Get in Touch
                                </a>

                                {cvUrl && (
                                    <button className="ml-btn-secondary" onClick={mlDownloadCV}>
                                        <Download size={18} />
                                        Download CV
                                    </button>
                                )}
                            </div>

                            {/* Social links */}
                            {content?.contact && (
                                <div className="ml-hero-socials">
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
            <section className="ml-skills-section" id="skills">
                <div className="ml-section-container">
                    <div className="ml-section-header">
                        <Code className="ml-section-icon" />
                        <h2>Skills &amp; Expertise</h2>
                    </div>
                    <div className="ml-skills-grid">
                        {content?.skills?.length > 0 ? (
                            content.skills.map((skill, i) => (
                                <div key={i} className="ml-skill-card">
                                    <div className="ml-skill-name">{skill.name || skill}</div>
                                    {skill.level && (
                                        <div className="ml-skill-level">
                                            <div className="ml-skill-bar">
                                                <div className="ml-skill-progress" style={{ width: `${skill.level}%` }} />
                                            </div>
                                            <span className="ml-skill-percent">{skill.level}%</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="ml-no-content">No skills added yet.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Experience ── */}
            <section className="ml-experience-section" id="experience">
                <div className="ml-section-container">
                    <div className="ml-section-header">
                        <Briefcase className="ml-section-icon" />
                        <h2>Work Experience</h2>
                    </div>
                    <div className="ml-timeline">
                        {content?.experience?.length > 0 ? (
                            content.experience.map((exp, i) => (
                                <div key={i} className="ml-timeline-item">
                                    <div className="ml-timeline-marker" />
                                    <div className="ml-timeline-content">
                                        <div className="ml-timeline-header">
                                            <h3>{exp.position || exp.title}</h3>
                                            <span className="ml-timeline-date">{exp.duration || exp.period}</span>
                                        </div>
                                        <div className="ml-timeline-company">{exp.company}</div>
                                        {exp.description && <p className="ml-timeline-desc">{exp.description}</p>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="ml-no-content">No experience added yet.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Education ── (was missing — data was stored but never rendered) */}
            <section className="ml-education-section" id="education">
                <div className="ml-section-container">
                    <div className="ml-section-header">
                        <GraduationCap className="ml-section-icon" />
                        <h2>Education</h2>
                    </div>
                    <div className="ml-timeline">
                        {content?.education?.length > 0 ? (
                            content.education.map((edu, i) => (
                                <div key={i} className="ml-timeline-item">
                                    <div className="ml-timeline-marker" />
                                    <div className="ml-timeline-content">
                                        <div className="ml-timeline-header">
                                            <h3>{edu.degree}</h3>
                                            <span className="ml-timeline-date">{edu.year}</span>
                                        </div>
                                        <div className="ml-timeline-company">{edu.institution}</div>
                                        {edu.description && <p className="ml-timeline-desc">{edu.description}</p>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="ml-no-content">No education added yet.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Projects ── */}
            <section className="ml-projects-section" id="projects">
                <div className="ml-section-container">
                    <div className="ml-section-header">
                        <Award className="ml-section-icon" />
                        <h2>Featured Projects</h2>
                    </div>
                    <div className="ml-projects-grid">
                        {content?.projects?.length > 0 ? (
                            content.projects.map((project, i) => (
                                <div key={i} className="ml-project-card">
                                    {project.image && (
                                        <div className="ml-project-image">
                                            <img src={project.image} alt={project.name || project.title} />
                                        </div>
                                    )}
                                    <div className="ml-project-content">
                                        <h3>{project.name || project.title}</h3>
                                        <p>{project.description}</p>
                                        {project.technologies && (
                                            <div className="ml-project-tags">
                                                {project.technologies.split(',').map((tech, ti) => (
                                                    <span key={ti} className="ml-tag">{tech.trim()}</span>
                                                ))}
                                            </div>
                                        )}
                                        {(project.liveUrl || project.githubUrl || project.link) && (
                                            <div className="ml-project-links">
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
                            <p className="ml-no-content">No projects added yet.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Contact ── */}
            <section className="ml-contact-section" id="contact">
                <div className="ml-section-container">
                    <div className="ml-section-header">
                        <Mail className="ml-section-icon" />
                        <h2>Get In Touch</h2>
                    </div>
                    <div className="ml-contact-content">
                        <p className="ml-contact-intro">Interested in working together? Feel free to reach out!</p>
                        <div className="ml-contact-info">
                            {content?.contact?.email && (
                                <a href={`mailto:${content.contact.email}`} className="ml-contact-item">
                                    <Mail size={20} />
                                    <span>{content.contact.email}</span>
                                </a>
                            )}
                            {content?.contact?.phone && (
                                <a href={`tel:${content.contact.phone}`} className="ml-contact-item">
                                    <Phone size={20} />
                                    <span>{content.contact.phone}</span>
                                </a>
                            )}
                            {content?.contact?.location && (
                                <div className="ml-contact-item">
                                    <MapPin size={20} />
                                    <span>{content.contact.location}</span>
                                </div>
                            )}
                            {content?.contact?.github && (
                                <a href={content.contact.github} className="ml-contact-item" target="_blank" rel="noopener noreferrer">
                                    <Github size={20} />
                                    <span>{content.contact.github}</span>
                                </a>
                            )}
                            {content?.contact?.linkedin && (
                                <a href={content.contact.linkedin} className="ml-contact-item" target="_blank" rel="noopener noreferrer">
                                    <Linkedin size={20} />
                                    <span>{content.contact.linkedin}</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="ml-portfolio-footer">
                <p>© {new Date().getFullYear()} {userProfile.full_name}. Crafted with passion.</p>
            </footer>
        </div>
    );
};

export default MehedyLight;