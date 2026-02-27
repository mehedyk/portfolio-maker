import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ArrowRight,
    Code2,
    Palette,
    Zap,
    BarChart3,
    Image as ImageIcon,
    CreditCard,
    CheckCircle2,
    Layout,
    Globe,
    Star,
    Sparkles
} from 'lucide-react';
import './LandingPage.css';

const LOGO_MAIN = 'https://i.postimg.cc/5tP7cWry/Logo-main.png';
const LOGO_SMALL = 'https://i.postimg.cc/sgr07cSv/logo_small.png';

const LandingPage = () => {
    const { user } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    const homeLink = user ? '/dashboard' : '/';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-container">
                    <Link to={homeLink} className="nav-logo">
                        <img
                            src={LOGO_MAIN}
                            alt="Portfolio Builder"
                            className="nav-logo-img"
                        />
                    </Link>
                    <div className="nav-actions">
                        <Link to="/login" className="btn btn-secondary btn-small">
                            Sign In
                        </Link>
                        <Link to="/signup" className="btn btn-primary btn-small">
                            Get Started Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <Sparkles size={16} className="text-dark" />
                        <span>1 Free Credit • No Credit Card Required</span>
                    </div>

                    <h1 className="hero-title">
                        Build Your Dream Portfolio in{' '}
                        <span className="highlight">Minutes, Not Days</span>
                    </h1>

                    <p className="hero-subtitle">
                        Stop struggling with code. Choose from profession-specific templates, customize with our
                        intuitive builder, and publish your stunning portfolio instantly. Perfect for developers,
                        designers, doctors, teachers, and freelancers.
                    </p>

                    <div className="hero-cta">
                        <Link to="/signup" className="btn btn-primary btn-large">
                            Create Your Portfolio Now
                            <ArrowRight size={20} />
                        </Link>
                        <Link to="/login" className="btn btn-outline btn-large">
                            View Live Examples
                        </Link>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-item">
                            <div className="stat-number">500+</div>
                            <div className="stat-label">Portfolios Created</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">5 Min</div>
                            <div className="stat-label">Average Build Time</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">8</div>
                            <div className="stat-label">Beautiful Themes</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <div className="section-header">
                        <div className="section-badge">
                            <Zap size={16} />
                            <span>Features</span>
                        </div>
                        <h2 className="section-title">Everything You Need to Stand Out</h2>
                        <p className="section-description">
                            Built specifically for professionals who want to showcase their work beautifully,
                            without the technical headaches.
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Code2 size={28} />
                            </div>
                            <h3>Profession-Specific</h3>
                            <p>
                                Not generic templates. Get sections and layouts designed specifically for your profession -
                                whether you're a developer showcasing code or a doctor displaying certifications.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <Palette size={28} />
                            </div>
                            <h3>8 Stunning Themes</h3>
                            <p>
                                Choose from 2 free professional themes or unlock 6 premium designs. Each theme is
                                carefully crafted with modern colors, typography, and layouts that actually look good.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <Globe size={28} />
                            </div>
                            <h3>Instant Publishing</h3>
                            <p>
                                No deployment, no hosting setup, no configuration. Click publish and your portfolio
                                goes live at yourname.portfoliobuilder.com in seconds.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <BarChart3 size={28} />
                            </div>
                            <h3>Built-in Analytics</h3>
                            <p>
                                Track how many people view your portfolio, where they're from, and which projects
                                get the most attention. All without setting up Google Analytics.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <ImageIcon size={28} />
                            </div>
                            <h3>Hassle-Free Images</h3>
                            <p>
                                Upload images directly in the builder. We handle compression, optimization, and
                                hosting automatically. No FTP, no S3 buckets, no headaches.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <CreditCard size={28} />
                            </div>
                            <h3>Pay Only for Publishing</h3>
                            <p>
                                Build and preview for free. Only pay when you're ready to publish. 1 credit = 1 live
                                portfolio. Update anytime without using another credit.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="container">
                    <div className="section-header">
                        <div className="section-badge">
                            <Layout size={16} />
                            <span>How It Works</span>
                        </div>
                        <h2 className="section-title">From Zero to Published in 4 Steps</h2>
                        <p className="section-description">
                            No technical skills required. Just follow these simple steps and you'll have a
                            professional portfolio live in minutes.
                        </p>
                    </div>

                    <div className="steps-container">
                        <div className="steps-line">
                            <div className="steps-line-progress"></div>
                        </div>
                        <div className="steps-grid">
                            <div className="step">
                                <div className="step-number">1</div>
                                <h3>Pick Your Profession</h3>
                                <p>
                                    Select from Developer, Designer, Doctor, Teacher, or Freelancer.
                                    Each comes with profession-specific sections.
                                </p>
                            </div>

                            <div className="step">
                                <div className="step-number">2</div>
                                <h3>Choose a Theme</h3>
                                <p>
                                    Browse 8 beautiful themes. Preview each one and pick the style
                                    that matches your personality.
                                </p>
                            </div>

                            <div className="step">
                                <div className="step-number">3</div>
                                <h3>Fill in Your Details</h3>
                                <p>
                                    Add your bio, skills, projects, and contact info. Upload images
                                    directly - we handle the rest.
                                </p>
                            </div>

                            <div className="step">
                                <div className="step-number">4</div>
                                <h3>Publish & Share</h3>
                                <p>
                                    One click to publish. Your portfolio goes live instantly.
                                    Share your unique URL with the world.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Preview */}
            <section className="pricing-preview">
                <div className="container">
                    <div className="section-header">
                        <div className="section-badge">
                            <Star size={16} />
                            <span>Pricing</span>
                        </div>
                        <h2 className="section-title" style={{ color: 'white' }}>
                            Simple, Transparent Pricing
                        </h2>
                        <p className="section-description" style={{ color: 'rgba(255,255,255,0.8)' }}>
                            No subscriptions. No hidden fees. Pay only when you publish.
                        </p>
                    </div>

                    <div className="pricing-cards">
                        <div className="pricing-card">
                            <h3>Starter</h3>
                            <div className="pricing-price">৳500</div>
                            <div className="pricing-period">1 Credit • One-time</div>
                            <ul className="pricing-features">
                                <li>
                                    <CheckCircle2 size={16} className="text-primary" />
                                    1 Published Portfolio
                                </li>
                                <li>
                                    <CheckCircle2 size={16} className="text-primary" />
                                    2 Free Themes
                                </li>
                                <li>
                                    <CheckCircle2 size={16} className="text-primary" />
                                    Basic Analytics
                                </li>
                                <li>
                                    <CheckCircle2 size={16} className="text-primary" />
                                    Image Hosting
                                </li>
                                <li>
                                    <CheckCircle2 size={16} className="text-primary" />
                                    Unlimited Updates
                                </li>
                            </ul>
                            <Link to="/signup" className="btn btn-outline btn-large">
                                Get Started
                            </Link>
                        </div>

                        <div className="pricing-card featured">
                            <div className="pricing-badge">Most Popular</div>
                            <h3>Pro Bundle</h3>
                            <div className="pricing-price">৳2000</div>
                            <div className="pricing-period">5 Credits • Best Value</div>
                            <ul className="pricing-features">
                                <li>
                                    <CheckCircle2 size={16} className="text-primary" />
                                    5 Published Portfolios
                                </li>
                                <li>
                                    <CheckCircle2 size={16} className="text-primary" />
                                    All 8 Premium Themes
                                </li>
                                <li>
                                    <CheckCircle2 size={16} className="text-primary" />
                                    Advanced Analytics
                                </li>
                                <li>
                                    <CheckCircle2 size={16} className="text-primary" />
                                    Priority Support
                                </li>
                                <li>
                                    <CheckCircle2 size={16} className="text-primary" />
                                    Custom Branding
                                </li>
                            </ul>
                            <Link to="/signup" className="btn btn-primary btn-large">
                                Start Building
                            </Link>
                        </div>

                        <div className="pricing-card">
                            <h3>Ultimate</h3>
                            <div className="pricing-price">৳3500</div>
                            <div className="pricing-period">10 Credits • Save 30%</div>
                            <ul className="pricing-features">
                                <li>
                                    <CheckCircle2 size={16} className="text-primary" />
                                    10 Published Portfolios
                                </li>
                                <li>
                                    <CheckCircle2 size={16} className="text-primary" />
                                    All Premium Features
                                </li>
                                <li>
                                    <CheckCircle2 size={16} className="text-primary" />
                                    Team Collaboration
                                </li>
                                <li>
                                    <CheckCircle2 size={16} className="text-primary" />
                                    White Label Option
                                </li>
                                <li>
                                    <CheckCircle2 size={16} className="text-primary" />
                                    Dedicated Support
                                </li>
                            </ul>
                            <Link to="/signup" className="btn btn-outline btn-large">
                                Go Ultimate
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ready to Showcase Your Work?</h2>
                    <p>
                        Join hundreds of professionals who've already built stunning portfolios.
                        Start for free, publish when ready. No credit card required.
                    </p>
                    <Link to="/signup" className="btn btn-primary btn-large">
                        Create Your Portfolio Now
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <Link to={homeLink} className="footer-brand">
                            <img
                                src={LOGO_SMALL}
                                alt="Portfolio Builder"
                                className="footer-logo-img"
                            />
                            <span>Portfolio Builder</span>
                        </Link>
                        <p style={{ color: 'var(--gray-500)', marginTop: '16px' }}>
                            Empowering professionals to create stunning portfolios without coding.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4>Product</h4>
                        <ul className="footer-links">
                            <li><Link to="/signup">Get Started</Link></li>
                            <li><Link to="/login">Sign In</Link></li>
                            <li><Link to="/">Features</Link></li>
                            <li><Link to="/">Pricing</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Resources</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Examples</Link></li>
                            <li><Link to="/">Templates</Link></li>
                            <li><Link to="/">Help Center</Link></li>
                            <li><Link to="/">Blog</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Company</h4>
                        <ul className="footer-links">
                            <li><Link to="/">About Us</Link></li>
                            <li><Link to="/">Contact</Link></li>
                            <li><Link to="/">Privacy Policy</Link></li>
                            <li><Link to="/">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2026 Portfolio Builder by Team Galacticos. All rights reserved.</p>
                    <div className="footer-social">
                        <a href="https://github.com/ashiq231/Portfolio-Builder" className="social-link" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </a>
                        <a href="https://facebook.com" className="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                            </svg>
                        </a>
                        <a href="https://linkedin.com" className="social-link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;