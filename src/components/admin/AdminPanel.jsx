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
    const [customCredits, setCustomCredits] = useState({});

    // Modal state replacing alert/confirm/prompt
    const [modal, setModal] = useState({ open: false, type: '', data: null });
    const [rejectNotes, setRejectNotes] = useState('');
    const [toastMsg, setToastMsg] = useState(null);

    const showToast = (msg, isError = false) => {
        setToastMsg({ msg, isError });
        setTimeout(() => setToastMsg(null), 3500);
    };

    useEffect(() => {
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
            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profileError) {
                setError('Error checking admin status. Please try again.');
                setLoading(false);
                return;
            }

            if (profileData.role !== 'admin') {
                setError('Access denied. Admin privileges required.');
                setLoading(false);
                return;
            }

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

            if (error) {
                setError('Error loading payment requests. Please try again.');
                setPaymentRequests([]);
            } else {
                setPaymentRequests(data || []);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
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
                setError('Error loading users. Please try again.');
            } else {
                setUsers(data || []);
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprovePayment = async (requestId, userId, requestedCredits) => {
        const creditsToGrant = customCredits[requestId] || requestedCredits;
        // Open confirmation modal instead of window.confirm
        setModal({ open: true, type: 'approve', data: { requestId, userId, requestedCredits, creditsToGrant } });
    };

    const confirmApprove = async () => {
        const { requestId, userId, creditsToGrant } = modal.data;
        setModal({ open: false, type: '', data: null });

        try {
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

            const { error: requestError } = await supabase
                .from('payment_requests')
                .update({
                    status: 'approved',
                    processed_at: new Date(),
                    processed_by: user.id,
                    admin_notes: creditsToGrant !== modal.data?.requestedCredits
                        ? `Granted ${creditsToGrant} credits (requested ${modal.data?.requestedCredits})`
                        : null
                })
                .eq('id', requestId);

            if (requestError) throw requestError;

            showToast(`Payment approved! ${creditsToGrant} credits added.`);

            setCustomCredits(prev => {
                const updated = { ...prev };
                delete updated[requestId];
                return updated;
            });

            fetchPaymentRequests();
        } catch (err) {
            showToast('Failed to approve payment. Please try again.', true);
        }
    };

    const handleRejectPayment = (requestId) => {
        setRejectNotes('');
        setModal({ open: true, type: 'reject', data: { requestId } });
    };

    const confirmReject = async () => {
        if (!rejectNotes.trim()) return;
        const { requestId } = modal.data;
        setModal({ open: false, type: '', data: null });

        try {
            const { error } = await supabase
                .from('payment_requests')
                .update({
                    status: 'rejected',
                    admin_notes: rejectNotes,
                    processed_at: new Date(),
                    processed_by: user.id
                })
                .eq('id', requestId);

            if (error) throw error;
            showToast('Payment request rejected.');
            fetchPaymentRequests();
        } catch (err) {
            showToast('Failed to reject payment. Please try again.', true);
        }
    };

    return (
        <div className="admin-panel">
            {/* Toast notification */}
            {toastMsg && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
                    background: toastMsg.isError ? '#ef4444' : '#22c55e',
                    color: 'white', padding: '14px 20px', borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)', fontWeight: '600',
                    maxWidth: '340px'
                }}>
                    {toastMsg.msg}
                </div>
            )}

            {/* Approve confirmation modal */}
            {modal.open && modal.type === 'approve' && (
                <div className="modal-overlay" onClick={() => setModal({ open: false, type: '', data: null })}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-icon">✅</div>
                        <h2>Confirm Approval</h2>
                        <p>Grant <strong>{modal.data.creditsToGrant}</strong> credits to this user?</p>
                        <div className="modal-actions">
                            <button onClick={confirmApprove} className="btn btn-success">Approve</button>
                            <button onClick={() => setModal({ open: false, type: '', data: null })} className="btn btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject modal with reason input */}
            {modal.open && modal.type === 'reject' && (
                <div className="modal-overlay" onClick={() => setModal({ open: false, type: '', data: null })}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-icon">❌</div>
                        <h2>Reject Payment</h2>
                        <p>Please provide a reason for rejection:</p>
                        <textarea
                            className="textarea"
                            rows="3"
                            value={rejectNotes}
                            onChange={e => setRejectNotes(e.target.value)}
                            placeholder="e.g. Transaction ID not found, screenshot unclear..."
                            style={{ width: '100%', marginBottom: '16px' }}
                        />
                        <div className="modal-actions">
                            <button onClick={confirmReject} disabled={!rejectNotes.trim()} className="btn btn-danger">Reject</button>
                            <button onClick={() => setModal({ open: false, type: '', data: null })} className="btn btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="admin-nav">
                <div className="container">
                    <div className="nav-content">
                        <div className="nav-brand">
                            <div className="nav-brand-icon">👑</div>
                            <h2>Admin Panel</h2>
                        </div>
                        <div className="nav-actions">
                            <span style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                                {profile?.email} · <strong>{profile?.role}</strong>
                            </span>
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
                                                        <a href={request.proof_image} target="_blank" rel="noopener noreferrer">
                                                            <img src={request.proof_image} alt="Payment proof" />
                                                        </a>
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
                                                                Credits to Grant (Optional — defaults to {request.credits_requested})
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
                                            {users.map((u) => (
                                                <tr key={u.id}>
                                                    <td>{u.full_name}</td>
                                                    <td>{u.email}</td>
                                                    <td>{u.username}</td>
                                                    <td>{u.credits}</td>
                                                    <td>
                                                        <span className={`role-badge ${u.role}`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
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
