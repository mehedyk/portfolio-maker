import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">
                        Create Your Professional Portfolio in <span className="gradient-text">Minutes</span>
                    </h1>
                    <p className="hero-subtitle">
                        No coding required. Choose your profession, pick a theme, and publish your stunning portfolio instantly.
                    </p>
                    <div className="hero-cta">
                        <Link to="/signup" className="btn btn-primary btn-large">
                            Get Started Free
                        </Link>
                        <Link to="/login" className="btn btn-secondary btn-large">
                            Sign In
                        </Link>
                    </div>
                    <p className="hero-note">✨ 1 free credit included • Publish your first portfolio now</p>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <h2 className="section-title">Why Choose Portfolio Builder?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">💼</div>
                            <h3>Profession-Specific</h3>
                            <p>Tailored sections for developers, designers, doctors, teachers, and freelancers.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🎨</div>
                            <h3>Beautiful Themes</h3>
                            <p>Choose from 8 stunning themes. 2 free themes, 6 premium options.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">⚡</div>
                            <h3>Instant Publishing</h3>
                            <p>One-click publish. Your portfolio goes live immediately at /p/yourname</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3>Analytics Included</h3>
                            <p>Track views and visitors to see how your portfolio performs.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🖼️</div>
                            <h3>Image Hosting</h3>
                            <p>Upload images directly. We handle all the hosting for you.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💳</div>
                            <h3>Credit System</h3>
                            <p>Pay only for what you need. 1 credit = 1 published portfolio.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="container">
                    <h2 className="section-title">How It Works</h2>
                    <div className="steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3>Sign Up</h3>
                            <p>Create your account and get 1 free credit</p>
                        </div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <h3>Build</h3>
                            <p>Select profession, choose theme, fill in your details</p>
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <h3>Publish</h3>
                            <p>Click publish and your portfolio goes live instantly</p>
                        </div>
                        <div className="step">
                            <div className="step-number">4</div>
                            <h3>Share</h3>
                            <p>Share your unique URL with the world</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <h2>Ready to Showcase Your Work?</h2>
                    <p>Join thousands of professionals who trust Portfolio Builder</p>
                    <Link to="/signup" className="btn btn-primary btn-large">
                        Start Building Now
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p>&copy; 2026 Portfolio Builder. Built with ❤️ by Team Galacticos</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
