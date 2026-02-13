import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import './AdminPanel.css';

const AdminPanel = () => {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('payments');
    const [paymentRequests, setPaymentRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customCredits, setCustomCredits] = useState({}); // Track custom credit amounts per request

    useEffect(() => {
        console.log('Admin Panel - Current user:', user);
        console.log('Admin Panel - Current profile:', profile);

        if (activeTab === 'payments') {
            fetchPaymentRequests();
        } else {
            fetchUsers();
        }
    }, [activeTab, user, profile]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchPaymentRequests = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('Fetching payment requests...');

            // First, verify we're admin
            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            console.log('Profile check:', profileData);

            if (profileError) {
                console.error('Profile error:', profileError);
                setError('Error checking admin status: ' + profileError.message);
                setLoading(false);
                return;
            }

            if (profileData.role !== 'admin') {
                setError('You are not an admin. Current role: ' + profileData.role);
                setLoading(false);
                return;
            }

            // FIXED: Specify which foreign key relationship to use: user_id (not processed_by)
            // The "!" syntax tells Supabase exactly which relationship to follow
            const { data, error } = await supabase
                .from('payment_requests')
                .select(`
                    *,
                    user_profiles!user_id (
                        id,
                        email,
                        full_name,
                        username
                    )
                `)
                .order('created_at', { ascending: false });

            console.log('Payment requests data:', data);
            console.log('Payment requests error:', error);

            if (error) {
                console.error('Error fetching payment requests:', error);
                setError('Error loading payment requests: ' + error.message);
                setPaymentRequests([]);
            } else {
                setPaymentRequests(data || []);
                if (!data || data.length === 0) {
                    console.log('No payment requests found');
                }
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            setError('Unexpected error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching users:', error);
                setError('Error loading users: ' + error.message);
            } else {
                setUsers(data || []);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            setError('Unexpected error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprovePayment = async (requestId, userId, requestedCredits) => {
        // Get custom credit amount or use requested amount
        const creditsToGrant = customCredits[requestId] || requestedCredits;

        if (!window.confirm(`Approve this payment request and grant ${creditsToGrant} credits?`)) return;

        try {
            // First, update the user's credits
            const { data: userData, error: userError } = await supabase
                .from('user_profiles')
                .select('credits')
                .eq('id', userId)
                .single();

            if (userError) throw userError;

            const newCredits = (userData.credits || 0) + parseInt(creditsToGrant);

            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({ credits: newCredits })
                .eq('id', userId);

            if (updateError) throw updateError;

            // Then update the payment request status
            const { error: requestError } = await supabase
                .from('payment_requests')
                .update({
                    status: 'approved',
                    processed_at: new Date(),
                    processed_by: user.id,
                    admin_notes: creditsToGrant !== requestedCredits
                        ? `Granted ${creditsToGrant} credits (requested ${requestedCredits})`
                        : null
                })
                .eq('id', requestId);

            if (requestError) throw requestError;

            alert(`Payment approved! ${creditsToGrant} credits added to user account.`);

            // Clear custom credit input for this request
            setCustomCredits(prev => {
                const updated = { ...prev };
                delete updated[requestId];
                return updated;
            });

            fetchPaymentRequests();
        } catch (error) {
            console.error('Error approving payment:', error);
            alert('Failed to approve payment: ' + error.message);
        }
    };

    const handleRejectPayment = async (requestId) => {
        const notes = prompt('Rejection reason:');
        if (!notes) return;

        try {
            const { error } = await supabase
                .from('payment_requests')
                .update({
                    status: 'rejected',
                    admin_notes: notes,
                    processed_at: new Date(),
                    processed_by: user.id
                })
                .eq('id', requestId);

            if (error) throw error;

            alert('Payment request rejected');
            fetchPaymentRequests();
        } catch (error) {
            console.error('Error rejecting payment:', error);
            alert('Failed to reject payment: ' + error.message);
        }
    };

    return (
        <div className="admin-panel">
            <nav className="admin-nav">
                <div className="container">
                    <div className="nav-content">
                        <div className="nav-brand">
                            <div className="nav-brand-icon">👑</div>
                            <h2>Admin Panel</h2>
                        </div>
                        <div className="nav-actions">
                            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                                Dashboard
                            </button>
                            <button onClick={signOut} className="btn btn-secondary">
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container admin-content">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('payments')}
                    >
                        💳 Payment Requests
                    </button>
                    <button
                        className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        👥 Users
                    </button>
                </div>

                {/* Debug Info */}
                <div className="debug-info" style={{
                    background: 'var(--gray-100)',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    fontSize: '14px'
                }}>
                    <p><strong>Debug Info:</strong></p>
                    <p>Your Role: <strong>{profile?.role || 'Unknown'}</strong></p>
                    <p>User ID: <code>{user?.id}</code></p>
                    <p>Email: {profile?.email}</p>
                </div>

                {error && (
                    <div className="error" style={{ marginBottom: '24px' }}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div className="spinner"></div>
                        <p style={{ marginTop: '20px', color: 'var(--gray-600)' }}>Loading...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'payments' && (
                            <div className="payments-section">
                                <h2>Payment Requests</h2>

                                {paymentRequests.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">📭</div>
                                        <h3>No Payment Requests</h3>
                                        <p>There are no payment requests at the moment.</p>
                                    </div>
                                ) : (
                                    <div className="requests-list">
                                        {paymentRequests.map((request) => (
                                            <div key={request.id} className={`request-card ${request.status}`}>
                                                <div className="request-header">
                                                    <div>
                                                        <h3>{request.user_profiles?.full_name || 'Unknown User'}</h3>
                                                        <p className="request-email">{request.user_profiles?.email || 'No email'}</p>
                                                    </div>
                                                    <span className={`status-badge ${request.status}`}>
                                                        {request.status}
                                                    </span>
                                                </div>

                                                <div className="request-details">
                                                    <div className="detail-item">
                                                        <strong>Amount:</strong> ৳{request.amount}
                                                    </div>
                                                    <div className="detail-item">
                                                        <strong>Credits Requested:</strong> {request.credits_requested}
                                                    </div>
                                                    <div className="detail-item">
                                                        <strong>Method:</strong> {request.payment_method}
                                                    </div>
                                                    <div className="detail-item">
                                                        <strong>Transaction ID:</strong> {request.transaction_id || 'N/A'}
                                                    </div>
                                                    <div className="detail-item">
                                                        <strong>Date:</strong> {new Date(request.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>

                                                {request.proof_image && (
                                                    <div className="proof-image">
                                                        <img src={request.proof_image} alt="Payment proof" />
                                                    </div>
                                                )}

                                                {request.status === 'pending' && (
                                                    <>
                                                        <div className="custom-credits-input" style={{
                                                            marginTop: '16px',
                                                            padding: '16px',
                                                            background: 'var(--gray-50)',
                                                            borderRadius: '8px',
                                                            border: '1px solid var(--gray-200)'
                                                        }}>
                                                            <label className="label" style={{ marginBottom: '8px' }}>
                                                                Credits to Grant (Optional - defaults to {request.credits_requested})
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="100"
                                                                className="input"
                                                                placeholder={`Default: ${request.credits_requested}`}
                                                                value={customCredits[request.id] || ''}
                                                                onChange={(e) => setCustomCredits({
                                                                    ...customCredits,
                                                                    [request.id]: parseInt(e.target.value) || ''
                                                                })}
                                                                style={{ maxWidth: '200px' }}
                                                            />
                                                            <p style={{
                                                                fontSize: '13px',
                                                                color: 'var(--gray-600)',
                                                                marginTop: '8px',
                                                                marginBottom: '0'
                                                            }}>
                                                                💡 Leave empty to grant the requested amount
                                                            </p>
                                                        </div>
                                                        <div className="request-actions" style={{ marginTop: '16px' }}>
                                                            <button
                                                                onClick={() =>
                                                                    handleApprovePayment(
                                                                        request.id,
                                                                        request.user_id,
                                                                        request.credits_requested
                                                                    )
                                                                }
                                                                className="btn btn-success"
                                                            >
                                                                ✓ Approve {customCredits[request.id] ? `(${customCredits[request.id]} credits)` : ''}
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectPayment(request.id)}
                                                                className="btn btn-danger"
                                                            >
                                                                ✗ Reject
                                                            </button>
                                                        </div>
                                                    </>
                                                )}

                                                {request.admin_notes && (
                                                    <div className="admin-notes">
                                                        <strong>Admin Notes:</strong> {request.admin_notes}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="users-section">
                                <h2>All Users ({users.length})</h2>
                                <div className="users-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Username</th>
                                                <th>Credits</th>
                                                <th>Role</th>
                                                <th>Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id}>
                                                    <td>{user.full_name}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.username}</td>
                                                    <td>{user.credits}</td>
                                                    <td>
                                                        <span className={`role-badge ${user.role}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;