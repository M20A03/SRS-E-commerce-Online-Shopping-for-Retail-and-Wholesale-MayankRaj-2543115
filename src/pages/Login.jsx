import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            navigate('/account');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="design-wrapper animate-fade-in">
            <div className="design-card">
                {error && (
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', width: '100%', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="design-input-container">
                        <div className="design-input-icon">
                            <User size={20} />
                        </div>
                        <input
                            type="email"
                            id="email"
                            className="design-input-field"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="design-input-container">
                        <div className="design-input-icon">
                            <Lock size={20} />
                        </div>
                        <input
                            type="password"
                            id="password"
                            className="design-input-field"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="design-options">
                        <label>
                            <input type="checkbox" className="design-checkbox" disabled={loading} /> Stay Sign In
                        </label>
                        <Link to="#" className="design-link">Forgot Password?</Link>
                    </div>

                    <button type="submit" className="design-btn" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <p className="design-footer-text">
                        Don't have an account? <Link to="/register" className="design-link-bold">Register here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
