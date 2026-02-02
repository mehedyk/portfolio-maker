import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import './AdminPanel.css';

const AdminPanel = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('payments');
    const [paymentRequests, setPaymentRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeTab === 'payments') {
            fetchPaymentRequests();
        } else {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchPaymentRequests = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('payment_requests')
                .select('*, user_profiles(*)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPaymentRequests(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprovePayment = async (requestId, userId, credits) => {
        if (!window.confirm('Approve this payment request?')) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase.rpc('approve_payment', {
                request_id: requestId,
                admin_id: user.id,
            });

            if (error) throw error;

            alert('Payment approved! Credits added to user account.');
            fetchPaymentRequests();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to approve payment');
        }
    };

    const handleRejectPayment = async (requestId) => {
        const notes = prompt('Rejection reason:');
        if (!notes) return;

        try {
            const { error } = await supabase
                .from('payment_requests')
                .update({ status: 'rejected', admin_notes: notes, processed_at: new Date() })
                .eq('id', requestId);

            if (error) throw error;

            alert('Payment request rejected');
            fetchPaymentRequests();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to reject payment');
        }
    };

    return (
        <div className="admin-panel">
            <nav className="admin-nav">
                <div className="container">
                    <div className="nav-content">
                        <h2>Admin Panel</h2>
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
                        Payment Requests
                    </button>
                    <button
                        className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                </div>

                {loading ? (
                    <div className="spinner"></div>
                ) : (
                    <>
                        {activeTab === 'payments' && (
                            <div className="payments-section">
                                <h2>Payment Requests</h2>
                                {paymentRequests.length === 0 ? (
                                    <p>No payment requests</p>
                                ) : (
                                    <div className="requests-list">
                                        {paymentRequests.map((request) => (
                                            <div key={request.id} className={`request-card ${request.status}`}>
                                                <div className="request-header">
                                                    <div>
                                                        <h3>{request.user_profiles.full_name}</h3>
                                                        <p className="request-email">{request.user_profiles.email}</p>
                                                    </div>
                                                    <span className={`status-badge ${request.status}`}>{request.status}</span>
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
                                                        <strong>Transaction ID:</strong> {request.transaction_id}
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
                                                                handleApprovePayment(request.id, request.user_id, request.credits_requested)
                                                            }
                                                            className="btn btn-success"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button onClick={() => handleRejectPayment(request.id)} className="btn btn-danger">
                                                            Reject
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
                                <h2>All Users</h2>
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
                                                        <span className={`role-badge ${user.role}`}>{user.role}</span>
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
