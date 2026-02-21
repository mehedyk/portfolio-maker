import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { uploadToCloudinary } from '../../services/cloudinary';
import './BuyCredits.css';

const BuyCredits = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        amount: '',
        credits_requested: 1,
        payment_method: 'bkash',
        transaction_id: '',
    });
    const [proofImage, setProofImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [toast, setToast] = useState(null);

    const creditPackages = [
        { credits: 1, price: 500, popular: false },
        { credits: 5, price: 2000, popular: true },
        { credits: 10, price: 3500, popular: false },
    ];

    const handlePackageSelect = (pkg) => {
        setFormData({
            ...formData,
            amount: pkg.price,
            credits_requested: pkg.credits,
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const url = await uploadToCloudinary(file);
            setProofImage(url);
        } catch (error) {
            setToast({ msg: 'Failed to upload image. Please try again.', isError: true }); setTimeout(() => setToast(null), 3500);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        try {
            const { error } = await supabase.from('payment_requests').insert([
                {
                    user_id: user.id,
                    amount: formData.amount,
                    credits_requested: formData.credits_requested,
                    payment_method: formData.payment_method,
                    transaction_id: formData.transaction_id,
                    proof_image: proofImage,
                    status: 'pending',
                },
            ]);

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
        } catch (error) {
            console.error('Error:', error);
            setToast({ msg: 'Failed to submit payment request. Please try again.', isError: true }); setTimeout(() => setToast(null), 3500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="buy-credits">
            {toast && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
                    background: toast.isError ? '#ef4444' : '#22c55e',
                    color: 'white', padding: '14px 20px', borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)', fontWeight: '600', maxWidth: '340px'
                }}>
                    {toast.msg}
                </div>
            )}
            <div className="credits-header">
                <div className="container">
                    <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                        ← Back to Dashboard
                    </button>
                </div>
            </div>

            <div className="container credits-content">
                <h1>Buy Credits</h1>
                <p className="credits-subtitle">Purchase credits to publish more portfolios</p>

                {success ? (
                    <div className="success-message">
                        <div className="success-icon">✅</div>
                        <h2>Payment Request Submitted!</h2>
                        <p>Your request is pending admin approval. You'll receive credits once approved.</p>
                    </div>
                ) : (
                    <>
                        <div className="packages-section">
                            <h2>Select a Package</h2>
                            <div className="packages-grid">
                                {creditPackages.map((pkg) => (
                                    <div
                                        key={pkg.credits}
                                        className={`package-card ${pkg.popular ? 'popular' : ''} ${formData.credits_requested === pkg.credits ? 'selected' : ''
                                            }`}
                                        onClick={() => handlePackageSelect(pkg)}
                                    >
                                        {pkg.popular && <div className="popular-badge">Most Popular</div>}
                                        <div className="package-credits">{pkg.credits}</div>
                                        <div className="package-label">Credits</div>
                                        <div className="package-price">৳{pkg.price}</div>
                                        <div className="package-per-credit">৳{Math.round(pkg.price / pkg.credits)} per credit</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="payment-section">
                            <h2>Payment Instructions</h2>
                            <div className="payment-info">
                                <p><strong>Send Money To:</strong></p>
                                <div className="payment-methods">
                                    <div className="payment-method">
                                        <strong>bKash:</strong> 01712-345678
                                    </div>
                                    <div className="payment-method">
                                        <strong>Nagad:</strong> 01812-345678
                                    </div>
                                    <div className="payment-method">
                                        <strong>Rocket:</strong> 01912-345678
                                    </div>
                                </div>
                                <p className="payment-note">
                                    ⚠️ After payment, fill out the form below and upload a screenshot of your payment confirmation.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="payment-form">
                                <div className="form-group">
                                    <label className="label">Payment Method</label>
                                    <select
                                        className="input"
                                        value={formData.payment_method}
                                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                        required
                                    >
                                        <option value="bkash">bKash</option>
                                        <option value="nagad">Nagad</option>
                                        <option value="rocket">Rocket</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="label">Transaction ID</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.transaction_id}
                                        onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                                        required
                                        placeholder="Enter transaction ID"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Amount Paid (৳)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                        placeholder="Enter amount"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Payment Proof Screenshot</label>
                                    <input type="file" accept="image/*" onChange={handleImageUpload} required />
                                    {proofImage && (
                                        <img src={proofImage} alt="Payment proof" style={{ maxWidth: '300px', marginTop: '12px' }} />
                                    )}
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit Payment Request'}
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BuyCredits;