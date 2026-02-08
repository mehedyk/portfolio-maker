import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import './Auth.css';

const ForgotPassword = () => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        const { error } = await resetPassword(email);

        if (error) {
            setError(error.message);
        } else {
            setMessage('Check your inbox for further instructions.');
        }

        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="auth-logo-icon">💼</div>
                    <span className="auth-logo-text">Portfolio Builder</span>
                </div>

                <h1 className="auth-title">Reset Password</h1>
                <p className="auth-subtitle">
                    Enter your email to receive a password reset link
                </p>

                {message ? (
                    <div className="success-message-container">
                        <div className="success-icon">
                            <Send size={48} className="text-primary" />
                        </div>
                        <h3>Check Your Email</h3>
                        <p>{message}</p>
                        <Link to="/login" className="btn btn-primary btn-large width-full">
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="label">Email Address</label>
                            <div className="input-with-icon">
                                <Mail size={20} className="input-icon" />
                                <input
                                    type="email"
                                    className="input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {error && <div className="error">{error}</div>}

                        <button
                            type="submit"
                            className="btn btn-primary btn-large"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner" style={{ width: '20px', height: '20px', margin: '0' }}></div>
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <span>Send Reset Link</span>
                                    <Send size={18} />
                                </>
                            )}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <Link to="/login" className="back-link">
                        <ArrowLeft size={16} />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;