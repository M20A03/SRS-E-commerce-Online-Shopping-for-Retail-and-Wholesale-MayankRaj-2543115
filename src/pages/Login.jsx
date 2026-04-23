import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        const result = await login(email, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="auth-page auth-page--login">
            <div className="auth-layout animate-fade-in">
                <aside className="auth-panel auth-panel--intro">
                    <span className="auth-badge"><Sparkles size={14} /> Roshan Enterprises</span>
                    <h1 className="auth-title">Welcome back</h1>
                    <p className="auth-subtitle">A smoother shopping flow with glass effects, fast access, and a calm eye-friendly palette.</p>

                    <div className="auth-highlights">
                        <div className="auth-highlight"><ShieldCheck size={16} /> Secure login</div>
                        <div className="auth-highlight"><Truck size={16} /> Quick delivery updates</div>
                        <div className="auth-highlight"><CheckCircle2 size={16} /> Seamless cart sync</div>
                    </div>

                    <div className="auth-panel__card">
                        <p className="auth-panel__label">Why sign in?</p>
                        <ul className="auth-panel__list">
                            <li>Track your orders and checkout faster.</li>
                            <li>Keep cart items across devices.</li>
                            <li>Access account and delivery essentials.</li>
                        </ul>
                    </div>
                </aside>

                <section className="auth-card">
                    <div className="auth-card__top">
                        <span className="auth-badge"><Sparkles size={14} /> Secure access</span>
                        <h2 className="auth-title">Sign in to continue</h2>
                        <p className="auth-subtitle">Use your email and password to open your account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && <div className="auth-error">{error}</div>}

                        <label className="auth-field">
                            <span className="auth-label">Email Address</span>
                            <div className="auth-input-wrap">
                                <Mail size={18} className="auth-input-icon" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    placeholder="you@example.com"
                                    className="auth-input"
                                    required
                                />
                            </div>
                        </label>

                        <label className="auth-field">
                            <span className="auth-label">Password</span>
                            <div className="auth-input-wrap">
                                <Lock size={18} className="auth-input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    placeholder="Enter your password"
                                    className="auth-input"
                                    required
                                />
                                <button type="button" className="auth-eye" onClick={() => setShowPassword((prev) => !prev)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </label>

                        <div className="auth-meta">
                            <label className="auth-remember">
                                <input type="checkbox" disabled={loading} /> Remember me
                            </label>
                            <Link to="/faq" className="auth-meta-link">Need help?</Link>
                        </div>

                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={16} /></>}
                        </button>

                        <p className="auth-bottom">
                            New here? <Link to="/register">Create your account</Link>
                        </p>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default Login;
