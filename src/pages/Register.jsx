import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, Phone, Sparkles, User } from 'lucide-react';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        contact: '',
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (Object.values(formData).some((field) => field === '')) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        const displayName = `${formData.firstName} ${formData.lastName}`.trim();
        const result = await register(formData.email, formData.password, displayName);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="auth-page auth-page--register">
            <div className="auth-layout animate-fade-in">
                <aside className="auth-panel auth-panel--intro">
                    <span className="auth-badge"><Sparkles size={14} /> Roshan Enterprises</span>
                    <h1 className="auth-title">Create your account</h1>
                    <p className="auth-subtitle">Get a richer shopping experience with saved carts, faster checkout, and delivery updates.</p>

                    <div className="auth-highlights">
                        <div className="auth-highlight"><CheckCircle2 size={16} /> Save your cart</div>
                        <div className="auth-highlight"><CheckCircle2 size={16} /> Track your order</div>
                        <div className="auth-highlight"><CheckCircle2 size={16} /> Mobile friendly access</div>
                    </div>

                    <div className="auth-panel__card">
                        <p className="auth-panel__label">What you get</p>
                        <ul className="auth-panel__list">
                            <li>Faster login on every device.</li>
                            <li>More secure order management.</li>
                            <li>Personalized shopping experience.</li>
                        </ul>
                    </div>
                </aside>

                <section className="auth-card">
                    <div className="auth-card__top">
                        <span className="auth-badge"><Sparkles size={14} /> Secure registration</span>
                        <h2 className="auth-title">Start shopping premium essentials</h2>
                        <p className="auth-subtitle">Fill in your details to create an account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && <div className="auth-error">{error}</div>}

                        <div className="auth-grid">
                            <label className="auth-field">
                                <span className="auth-label">First Name</span>
                                <div className="auth-input-wrap">
                                    <User size={18} className="auth-input-icon" />
                                    <input type="text" id="firstName" value={formData.firstName} onChange={handleChange} disabled={loading} className="auth-input" required />
                                </div>
                            </label>
                            <label className="auth-field">
                                <span className="auth-label">Last Name</span>
                                <div className="auth-input-wrap">
                                    <User size={18} className="auth-input-icon" />
                                    <input type="text" id="lastName" value={formData.lastName} onChange={handleChange} disabled={loading} className="auth-input" required />
                                </div>
                            </label>
                        </div>

                        <label className="auth-field">
                            <span className="auth-label">Phone Number</span>
                            <div className="auth-input-wrap">
                                <Phone size={18} className="auth-input-icon" />
                                <input type="tel" id="contact" value={formData.contact} onChange={handleChange} disabled={loading} className="auth-input" required />
                            </div>
                        </label>

                        <label className="auth-field">
                            <span className="auth-label">Email Address</span>
                            <div className="auth-input-wrap">
                                <Mail size={18} className="auth-input-icon" />
                                <input type="email" id="email" value={formData.email} onChange={handleChange} disabled={loading} className="auth-input" required />
                            </div>
                        </label>

                        <label className="auth-field">
                            <span className="auth-label">Password</span>
                            <div className="auth-input-wrap">
                                <Lock size={18} className="auth-input-icon" />
                                <input type={showPassword ? 'text' : 'password'} id="password" value={formData.password} onChange={handleChange} disabled={loading} className="auth-input" required />
                                <button type="button" className="auth-eye" onClick={() => setShowPassword((prev) => !prev)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </label>

                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={16} /></>}
                        </button>

                        <p className="auth-bottom">
                            Already have an account? <Link to="/login">Sign in</Link>
                        </p>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default Register;
