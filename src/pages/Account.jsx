import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, ShoppingBag, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import {
    updateEmail,
    reauthenticateWithCredential,
    EmailAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase-config';

const Account = () => {
    const { user, updateProfile, logout } = useAuth();
    const navigate = useNavigate();

    const splitName = (value = '') => {
        const normalized = String(value || '').trim();
        if (!normalized) return { firstName: '', lastName: '' };
        const parts = normalized.split(/\s+/);
        return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') };
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

    // Email change state
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [emailChangeLoading, setEmailChangeLoading] = useState(false);
    const [emailChangeMsg, setEmailChangeMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!user) navigate('/login');
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

    const handleEmailChange = async (e) => {
        e.preventDefault();
        setEmailChangeLoading(true);
        setEmailChangeMsg({ type: '', text: '' });

        try {
            // Re-authenticate first
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);

            // Update email in Firebase Auth
            await updateEmail(auth.currentUser, newEmail.trim());

            // Update in Firestore via updateProfile
            await updateProfile({ email: newEmail.trim() });

            setEmailChangeMsg({ type: 'success', text: 'Email updated successfully! Please verify your new email.' });
            setTimeout(() => {
                setShowEmailModal(false);
                setNewEmail('');
                setCurrentPassword('');
                setEmailChangeMsg({ type: '', text: '' });
            }, 2000);
        } catch (err) {
            let msg = err.message || 'Failed to update email.';
            if (err.code === 'auth/wrong-password') msg = 'Incorrect password. Please try again.';
            if (err.code === 'auth/email-already-in-use') msg = 'This email is already in use by another account.';
            if (err.code === 'auth/invalid-email') msg = 'Invalid email address.';
            if (err.code === 'auth/requires-recent-login') msg = 'Session expired. Please enter your current password to confirm.';
            setEmailChangeMsg({ type: 'error', text: msg });
        } finally {
            setEmailChangeLoading(false);
        }
    };

    return (
        <div className="container section animate-fade-in">
            <div className="grid grid-cols-4 gap-8">

                {/* Sidebar */}
                <div className="card" style={{ padding: '2rem', height: 'fit-content' }}>
                    <div className="flex-col items-center justify-center text-center mb-6">
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#fff' }}>
                            <User size={36} />
                        </div>
                        <h3 className="heading-3">{profileTitle}</h3>
                        <p className="text-muted" style={{ fontSize: '0.85rem' }}>{user.email}</p>
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
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: message.type === 'success' ? 'var(--success-color)' : '#ef4444',
                            border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                        }}>
                            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
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
                                    <input
                                        type="email"
                                        id="email"
                                        className="input"
                                        style={{ paddingLeft: '2.5rem', paddingRight: '7rem', opacity: 0.7 }}
                                        value={formData.email}
                                        disabled={true}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEmailModal(true)}
                                        style={{
                                            position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                                            fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-color)',
                                            background: 'var(--accent-light)', padding: '0.25rem 0.6rem',
                                            borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer'
                                        }}
                                    >
                                        Change
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.3rem' }}>
                                    Requires password confirmation
                                </p>
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
                                <button type="button" className="btn btn-outline" onClick={() => { setIsEditing(false); setFormData({ firstName: displayFirstName, lastName: displayLastName, contact: user?.contact || '', email: user?.email || '' }); setMessage({}); }}>
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

            {/* Email Change Modal */}
            {showEmailModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 80,
                    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                    display: 'grid', placeItems: 'center', padding: '1rem'
                }} onClick={() => setShowEmailModal(false)}>
                    <div
                        className="card"
                        style={{ width: 'min(100%, 480px)', padding: '2rem', position: 'relative' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-light)', display: 'grid', placeItems: 'center', color: 'var(--accent-color)' }}>
                                <Lock size={18} />
                            </div>
                            <div>
                                <h3 className="heading-3" style={{ marginBottom: 0 }}>Change Email</h3>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>Enter your password to confirm</p>
                            </div>
                        </div>

                        {emailChangeMsg.text && (
                            <div style={{
                                padding: '0.875rem', marginBottom: '1rem', borderRadius: 'var(--radius-md)',
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                backgroundColor: emailChangeMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                color: emailChangeMsg.type === 'success' ? 'var(--success-color)' : '#ef4444',
                                border: `1px solid ${emailChangeMsg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                            }}>
                                {emailChangeMsg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                                <span style={{ fontSize: '0.875rem' }}>{emailChangeMsg.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleEmailChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="label">New Email Address</label>
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="Enter new email"
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Current Password</label>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="Enter your password to confirm"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setShowEmailModal(false); setEmailChangeMsg({ type: '', text: '' }); }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={emailChangeLoading}>
                                    {emailChangeLoading ? 'Updating...' : 'Update Email'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Account;
