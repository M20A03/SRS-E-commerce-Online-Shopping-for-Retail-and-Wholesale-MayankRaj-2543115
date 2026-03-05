import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Phone } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        contact: '',
        email: '',
        password: '',
    });
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
            navigate('/account');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="design-wrapper animate-fade-in">
            <div className="design-card" style={{ padding: '3rem 2.5rem', borderRadius: '40px' }}>
                <h2 className="design-heading">Register Access</h2>

                {error && (
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', width: '100%', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="design-input-container">
                        <div className="design-input-icon"><User size={20} /></div>
                        <input type="text" id="firstName" className="design-input-field" placeholder="First Name" value={formData.firstName} onChange={handleChange} disabled={loading} />
                    </div>

                    <div className="design-input-container">
                        <div className="design-input-icon"><User size={20} /></div>
                        <input type="text" id="lastName" className="design-input-field" placeholder="Last Name" value={formData.lastName} onChange={handleChange} disabled={loading} />
                    </div>

                    <div className="design-input-container">
                        <div className="design-input-icon"><Phone size={20} /></div>
                        <input type="tel" id="contact" className="design-input-field" placeholder="Contact Number" value={formData.contact} onChange={handleChange} disabled={loading} />
                    </div>

                    <div className="design-input-container">
                        <div className="design-input-icon"><Mail size={20} /></div>
                        <input type="email" id="email" className="design-input-field" placeholder="Email Address" value={formData.email} onChange={handleChange} disabled={loading} />
                    </div>

                    <div className="design-input-container">
                        <div className="design-input-icon"><Lock size={20} /></div>
                        <input type="password" id="password" className="design-input-field" placeholder="Password" value={formData.password} onChange={handleChange} disabled={loading} />
                    </div>

                    <button type="submit" className="design-btn" style={{ marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <p className="design-footer-text">
                        Already have an account? <Link to="/login" className="design-link-bold">Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
