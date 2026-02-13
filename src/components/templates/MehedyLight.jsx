import React from 'react';
import { Download, Mail, Phone, MapPin, Moon, Sun, Github, Linkedin, Twitter, Globe, Briefcase, Award, Code } from 'lucide-react';
import CursorTrail from '../effects/CursorTrail';
import './MehedyLight.css';

const MehedyLight = ({ portfolio, content, images, specialty_info, onToggleTheme, isDarkMode }) => {
    const userProfile = portfolio?.user_profiles || {};
    const profession = portfolio?.professions?.name || 'Professional';
    const cvUrl = portfolio?.cv_url || content?.cv_url;

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleDownloadCV = () => {
        if (cvUrl) {
            window.open(cvUrl, '_blank');
        } else {
            alert('CV not available');
        }
    };

    return (
        <div className="mehedy-light-portfolio">
            <CursorTrail />
            {/* Navigation */}
            <nav className="portfolio-nav">
                <div className="nav-container">
                    <div className="nav-brand">
                        {userProfile.full_name || 'Portfolio'}
                    </div>

                    <div className="nav-links">
                        <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a>
                        <a href="#skills" onClick={(e) => { e.preventDefault(); scrollToSection('skills'); }}>Skills</a>
                        <a href="#experience" onClick={(e) => { e.preventDefault(); scrollToSection('experience'); }}>Experience</a>
                        <a href="#projects" onClick={(e) => { e.preventDefault(); scrollToSection('projects'); }}>Projects</a>
                        <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>

                        {/* Download CV in Nav */}
                        {cvUrl && (
                            <button className="nav-cv-btn" onClick={handleDownloadCV}>
                                <Download size={16} />
                                <span>CV</span>
                            </button>
                        )}

                        <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Redesigned with left hexagon profile */}
            <section className="hero-section" id="about">
                <div className="hero-container">
                    <div className="hero-content">
                        {/* Left: Hexagonal Profile Photo */}
                        <div className="hero-left">
                            <div className="hexagon-wrapper">
                                <div className="hexagon-profile">
                                    {images?.profile ? (
                                        <img src={images.profile} alt={userProfile.full_name} />
                                    ) : (
                                        <div className="profile-placeholder">
                                            {userProfile.full_name?.charAt(0) || 'P'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Name, Profession, Bio */}
                        <div className="hero-right">
                            <div className="hero-greeting">Hello, I'm</div>
                            <h1 className="hero-name">{userProfile.full_name || 'Portfolio Owner'}</h1>
                            <div className="hero-profession">{profession}</div>

                            <p className="hero-bio">
                                {content?.about || 'Welcome to my portfolio. I am passionate about creating amazing experiences.'}
                            </p>

                            <div className="hero-actions">
                                <a href="#contact" className="btn-primary" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>
                                    <Mail size={18} />
                                    Get in Touch
                                </a>

                                {cvUrl && (
                                    <button className="btn-secondary" onClick={handleDownloadCV}>
                                        <Download size={18} />
                                        Download CV
                                    </button>
                                )}
                            </div>

                            {/* Social Links */}
                            {content?.contact && (
                                <div className="hero-socials">
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

            {/* Skills Section - Compact */}
            <section className="skills-section" id="skills">
                <div className="section-container">
                    <div className="section-header">
                        <Code className="section-icon" />
                        <h2>Skills & Expertise</h2>
                    </div>

                    <div className="skills-grid">
                        {content?.skills && content.skills.length > 0 ? (
                            content.skills.map((skill, index) => (
                                <div key={index} className="skill-card">
                                    <div className="skill-name">{skill.name || skill}</div>
                                    {skill.level && (
                                        <div className="skill-level">
                                            <div className="skill-bar">
                                                <div
                                                    className="skill-progress"
                                                    style={{ width: `${skill.level}%` }}
                                                ></div>
                                            </div>
                                            <span className="skill-percent">{skill.level}%</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="no-content">No skills added yet.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Experience Section - Compact */}
            <section className="experience-section" id="experience">
                <div className="section-container">
                    <div className="section-header">
                        <Briefcase className="section-icon" />
                        <h2>Work Experience</h2>
                    </div>

                    <div className="timeline">
                        {content?.experience && content.experience.length > 0 ? (
                            content.experience.map((exp, index) => (
                                <div key={index} className="timeline-item">
                                    <div className="timeline-marker"></div>
                                    <div className="timeline-content">
                                        <div className="timeline-header">
                                            <h3>{exp.position || exp.title}</h3>
                                            <span className="timeline-date">{exp.duration || exp.period}</span>
                                        </div>
                                        <div className="timeline-company">{exp.company}</div>
                                        {exp.description && <p className="timeline-desc">{exp.description}</p>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-content">No experience added yet.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Projects Section - Compact Grid */}
            <section className="projects-section" id="projects">
                <div className="section-container">
                    <div className="section-header">
                        <Award className="section-icon" />
                        <h2>Featured Projects</h2>
                    </div>

                    <div className="projects-grid">
                        {content?.projects && content.projects.length > 0 ? (
                            content.projects.map((project, index) => (
                                <div key={index} className="project-card">
                                    {project.image && (
                                        <div className="project-image">
                                            <img src={project.image} alt={project.name} />
                                        </div>
                                    )}
                                    <div className="project-content">
                                        <h3>{project.name || project.title}</h3>
                                        <p>{project.description}</p>
                                        {project.technologies && (
                                            <div className="project-tags">
                                                {project.technologies.split(',').map((tech, i) => (
                                                    <span key={i} className="tag">{tech.trim()}</span>
                                                ))}
                                            </div>
                                        )}
                                        {(project.liveUrl || project.githubUrl || project.link) && (
                                            <div className="project-links">
                                                {(project.liveUrl || project.link) && (
                                                    <a href={project.liveUrl || project.link} target="_blank" rel="noopener noreferrer">
                                                        <Globe size={16} /> View Project
                                                    </a>
                                                )}
                                                {project.githubUrl && (
                                                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                                        <Github size={16} /> Code
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-content">No projects added yet.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Contact Section - Compact */}
            <section className="contact-section" id="contact">
                <div className="section-container">
                    <div className="section-header">
                        <Mail className="section-icon" />
                        <h2>Get In Touch</h2>
                    </div>

                    <div className="contact-content">
                        <p className="contact-intro">
                            Interested in working together? Feel free to reach out!
                        </p>

                        <div className="contact-info">
                            {content?.contact?.email && (
                                <a href={`mailto:${content.contact.email}`} className="contact-item">
                                    <Mail size={20} />
                                    <span>{content.contact.email}</span>
                                </a>
                            )}
                            {content?.contact?.phone && (
                                <a href={`tel:${content.contact.phone}`} className="contact-item">
                                    <Phone size={20} />
                                    <span>{content.contact.phone}</span>
                                </a>
                            )}
                            {content?.contact?.location && (
                                <div className="contact-item">
                                    <MapPin size={20} />
                                    <span>{content.contact.location}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="portfolio-footer">
                <p>© {new Date().getFullYear()} {userProfile.full_name}. Crafted with passion.</p>
            </footer>
        </div>
    );
};

export default MehedyLight;