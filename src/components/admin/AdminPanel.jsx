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
            
            // Now fetch payment requests
            const { data, error } = await supabase
                .from('payment_requests')
                .select(`
                    *,
                    user_profiles (
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

    const handleApprovePayment = async (requestId, userId, credits) => {
        if (!window.confirm('Approve this payment request?')) return;

        try {
            const { error } = await supabase.rpc('approve_payment', {
                request_id: requestId,
                admin_id: user.id,
            });

            if (error) throw error;

            alert('Payment approved! Credits added to user account.');
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
                                                        <strong>Credits:</strong> {request.credits_requested}
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
                                                    <div className="request-actions">
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
                                                            ✓ Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRejectPayment(request.id)} 
                                                            className="btn btn-danger"
                                                        >
                                                            ✗ Reject
                                                        </button>
                                                    </div>
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