import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, ShoppingBag } from 'lucide-react';

const Account = () => {
    const { user, updateProfile, logout } = useAuth();
    const navigate = useNavigate();

    const splitName = (value = '') => {
        const normalized = String(value || '').trim();
        if (!normalized) {
            return { firstName: '', lastName: '' };
        }

        const parts = normalized.split(/\s+/);
        return {
            firstName: parts[0] || '',
            lastName: parts.slice(1).join(' ')
        };
    };

    const derivedName = splitName(user?.displayName || '');
    const displayFirstName = user?.firstName || derivedName.firstName;
    const displayLastName = user?.lastName || derivedName.lastName;
    const profileTitle = `${displayFirstName} ${displayLastName}`.trim() || user?.displayName || 'Customer';

    const [formData, setFormData] = useState(() => ({
        firstName: user?.firstName || derivedName.firstName || '',
        lastName: user?.lastName || derivedName.lastName || '',
        contact: user?.contact || '',
        email: user?.email || '',
    }));

    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

    
   const result = await updateProfile({
            firstName: formData.firstName,
            lastName: formData.lastName,
            contact: formData.contact,
        });

        if (result.success) {
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to update profile.' });
        }
    };

    return (
        <div className="container section animate-fade-in">
            <div className="grid grid-cols-4 gap-8">

                {/* Sidebar */}
                <div className="card" style={{ padding: '2rem', height: 'fit-content' }}>
                    <div className="flex-col items-center justify-center text-center mb-6">
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--accent-color)' }}>
                            <User size={40} />
                        </div>
                        <h3 className="heading-3">{profileTitle}</h3>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>{user.email}</p>
                    </div>

                    <div className="flex-col gap-2">
                        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => setIsEditing(true)}>
                            <User size={18} /> Profile Details
                        </button>
                        <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }} onClick={() => navigate('/orders')}>
                            <ShoppingBag size={18} /> Order History
                        </button>
                    </div>

                    <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <button className="btn btn-outline" style={{ width: '100%', color: '#ef4444', borderColor: '#ef4444' }} onClick={() => { logout(); navigate('/'); }}>
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="card" style={{ gridColumn: 'span 3', padding: '2.5rem' }}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="heading-2">Account Details</h2>
                        {!isEditing && (
                            <button className="btn btn-outline" onClick={() => setIsEditing(true)}>Edit Profile</button>
                        )}
                    </div>

                    {message.text && (
                        <div style={{
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: message.type === 'success' ? '#22c55e' : '#ef4444'
                        }}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex-col gap-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="label" htmlFor="firstName">First Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input type="text" id="firstName" className="input" style={{ paddingLeft: '2.5rem' }} value={formData.firstName} onChange={handleChange} disabled={!isEditing} />
                                </div>
                            </div>
                            <div>
                                <label className="label" htmlFor="lastName">Last Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input type="text" id="lastName" className="input" style={{ paddingLeft: '2.5rem' }} value={formData.lastName} onChange={handleChange} disabled={!isEditing} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="label" htmlFor="email">Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input type="email" id="email" className="input" style={{ paddingLeft: '2.5rem' }} value={formData.email} disabled={true} title="Email cannot be changed" />
                                </div>
                            </div>
                            <div>
                                <label className="label" htmlFor="contact">Contact Number</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input type="tel" id="contact" className="input" style={{ paddingLeft: '2.5rem' }} value={formData.contact} onChange={handleChange} disabled={!isEditing} />
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end gap-4 mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                                <button type="button" className="btn btn-outline" onClick={() => { setIsEditing(false); setFormData({ ...user }); setMessage({}); }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Account;
