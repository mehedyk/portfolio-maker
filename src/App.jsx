import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/dashboard/Dashboard';
import PortfolioBuilder from './components/builder/PortfolioBuilder';
import PublicPortfolio from './components/portfolio/PublicPortfolio';
import BuyCredits from './components/credits/BuyCredits';
import AdminPanel from './components/admin/AdminPanel';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
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
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
