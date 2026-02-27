import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Signup = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Check password strength
        if (name === 'password') {
            checkPasswordStrength(value);
        }
    };

    const checkPasswordStrength = (password) => {
        if (password.length < 6) {
            setPasswordStrength('weak');
        } else if (password.length < 10) {
            setPasswordStrength('medium');
        } else {
            setPasswordStrength('strong');
        }
    };

    const validateForm = () => {
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.username.length < 3) {
            setError('Username must be at least 3 characters');
            return false;
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
            setError('Username can only contain letters, numbers, hyphens, and underscores');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const { error } = await signUp(
            formData.email,
            formData.password,
            formData.fullName,
            formData.username
        );

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess('Account created! Please check your email to verify your account.');
            // Don't set loading false immediately so spinner stays until redirect starts
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <Link to="/" className="auth-logo">
                    <img
                        src="https://i.postimg.cc/5tP7cWry/Logo-main.png"
                        alt="Portfolio Builder"
                        className="auth-logo-img"
                    />
                </Link>

                <h1 className="auth-title">Create Your Account</h1>
                <p className="auth-subtitle">Start building your professional portfolio today</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="label">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            className="input"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                            autoComplete="name"
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Username</label>
                        <input
                            type="text"
                            name="username"
                            className="input"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="johndoe"
                            autoComplete="username"
                        />
                        <p className="password-hint">
                            Your portfolio will be at: /p/{formData.username || 'username'}
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                        {formData.password && (
                            <div className="password-strength">
                                <div className={`password-strength-bar ${passwordStrength}`}></div>
                            </div>
                        )}
                        {formData.password && (
                            <p className="password-hint">
                                Strength: {passwordStrength === 'weak' ? '⚠️ Weak' : passwordStrength === 'medium' ? '⚡ Good' : '✅ Strong'}
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="label">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="input"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                    </div>

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                        {loading ? (
                            <>
                                <div className="spinner" style={{ width: '20px', height: '20px', margin: '0' }}></div>
                                <span>Creating account...</span>
                            </>
                        ) : (
                            <>
                                <span>Create Account</span>
                                <span>→</span>
                            </>
                        )}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login">Sign in here</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;