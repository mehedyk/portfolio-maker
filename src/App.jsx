import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import Dashboard from './components/dashboard/Dashboard';
import PortfolioBuilder from './components/builder/PortfolioBuilder';
import PublicPortfolio from './components/portfolio/PublicPortfolio';
import BuyCredits from './components/credits/BuyCredits';
import AdminPanel from './components/admin/AdminPanel';
import CursorTrail from './components/effects/CursorTrail';

// Simple 404 page
const NotFound = () => (
    <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        fontFamily: "'Outfit', sans-serif", padding: '40px 20px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)'
    }}>
        <div style={{
            background: 'white', borderRadius: '24px', padding: '60px 48px',
            maxWidth: '480px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.1)'
        }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>🗺️</div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                Page Not Found
            </h1>
            <p style={{ color: '#64748b', marginBottom: '32px', lineHeight: '1.6' }}>
                The page you're looking for doesn't exist.
            </p>
            <a href="/" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 28px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white', borderRadius: '12px', textDecoration: 'none',
                fontWeight: '700', fontSize: '15px'
            }}>
                ← Go Home
            </a>
        </div>
    </div>
);

function App() {
    return (
        <AuthProvider>
            <CursorTrail />
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/p/:username" element={<PublicPortfolio />} />

                    {/* Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/create"
                        element={
                            <ProtectedRoute>
                                <PortfolioBuilder />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/edit/:portfolioId"
                        element={
                            <ProtectedRoute>
                                <PortfolioBuilder />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/credits"
                        element={
                            <ProtectedRoute>
                                <BuyCredits />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminPanel />
                            </AdminRoute>
                        }
                    />

                    {/* 404 Catch-all */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
