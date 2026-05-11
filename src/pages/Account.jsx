import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase-config';
import { User, Mail, Phone, ShoppingBag, CheckCircle, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

const Account = () => {
    const { user, updateProfile, logout, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const checkoutPrompt = location.state?.prompt || 'Please create an account to continue checkout.';
    const returnTo = location.state?.from || '/checkout';

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

    const [formOverrides, setFormOverrides] = useState({});

    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [accessRequest, setAccessRequest] = useState({ reason: '' });
    const [requestState, setRequestState] = useState({ loading: false, text: '', type: '' });
    const [authState, setAuthState] = useState({ loading: false, text: '', type: '' });

    const formData = {
        firstName: formOverrides.firstName ?? user?.firstName ?? derivedName.firstName ?? '',
        lastName: formOverrides.lastName ?? user?.lastName ?? derivedName.lastName ?? '',
        contact: formOverrides.contact ?? user?.contact ?? '',
        email: formOverrides.email ?? user?.email ?? '',
    };

    if (!user) {
        return (
            <div className="container section animate-fade-in">
                <div className="account-guest card" style={{ maxWidth: '760px', margin: '0 auto', padding: '2.5rem' }}>
                    <div className="flex-col items-center text-center gap-4" style={{ maxWidth: '620px', margin: '0 auto' }}>
                        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--gradient-accent)', display: 'grid', placeItems: 'center', color: '#fff', boxShadow: 'var(--shadow-glow)' }}>
                            <Sparkles size={32} />
                        </div>
                        <p className="glass-chip glass-chip--accent" style={{ margin: 0 }}>Secure sign-in</p>
                        <h1 className="heading-1 mb-2">Continue with your account</h1>
                        <p className="text-muted" style={{ maxWidth: '540px', fontSize: '1.05rem', lineHeight: 1.7 }}>
                            {checkoutPrompt}
                        </p>
                        <div className="card" style={{ width: '100%', marginTop: '1rem', padding: '1.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                            <h2 className="heading-3 mb-3">What you get</h2>
                            <ul className="text-muted" style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.8, textAlign: 'left' }}>
                                <li>Continue to checkout without losing your cart.</li>
                                <li>Track orders and payment history.</li>
                                <li>Request admin access from the same profile later.</li>
                            </ul>
                        </div>
                        {authState.text && (
                            <div style={{
                                width: '100%',
                                padding: '0.9rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: authState.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: authState.type === 'success' ? 'var(--success-color)' : '#ef4444',
                                border: `1px solid ${authState.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                            }}>
                                {authState.text}
                            </div>
                        )}
                        <button
                            className="btn btn-primary"
                            style={{ minWidth: '220px' }}
                            disabled={authState.loading}
                            onClick={async () => {
                                setAuthState({ loading: true, text: '', type: '' });
                                const result = await loginWithGoogle();
                                if (result.success) {
                                    setAuthState({ loading: false, text: 'Signed in successfully. Redirecting...', type: 'success' });
                                    navigate(returnTo, { replace: true });
                                } else {
                                    setAuthState({ loading: false, text: 'Sign-in could not be completed. Please try again.', type: 'error' });
                                }
                            }}
                        >
                            {authState.loading ? 'Signing in...' : 'Continue with Google'} <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormOverrides((prev) => ({ ...prev, [e.target.id]: e.target.value }));
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

    const handleAccessRequestSubmit = async (e) => {
        e.preventDefault();
        setRequestState({ loading: true, text: '', type: '' });

        try {
            await addDoc(collection(db, 'adminAccessRequests'), {
                uid: user.uid,
                email: user.email || '',
                displayName: profileTitle,
                reason: accessRequest.reason.trim(),
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            setAccessRequest({ reason: '' });
            setRequestState({ loading: false, text: 'Request sent to the super-admin.', type: 'success' });
        } catch (requestError) {
            setRequestState({
                loading: false,
                text: requestError.message || 'Failed to send access request.',
                type: 'error'
            });
        }
    };

    return (
        <div className="container section animate-fade-in">
            <div className="grid grid-cols-4 gap-8">
                <div className="card" style={{ padding: '2rem', height: 'fit-content' }}>
                    <div className="flex-col items-center justify-center text-center mb-6">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={profileTitle} referrerPolicy="no-referrer"
                                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', border: '2px solid var(--border-color)' }}
                            />
                        ) : (
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#fff' }}>
                                <User size={36} />
                            </div>
                        )}
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
                                        style={{ paddingLeft: '2.5rem', opacity: 0.7 }}
                                        value={formData.email}
                                        disabled={true}
                                    />
                                </div>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.3rem' }}>
                                    Managed by Google
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
                                <button type="button" className="btn btn-outline" onClick={() => { setIsEditing(false); setFormOverrides({}); setMessage({}); }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </form>

                    <div className="card" style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
                        <h3 className="heading-3 mb-2">Request Admin Access</h3>
                        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                            If you need admin access for your Gmail account, send a request to the super-admin from here.
                        </p>

                        <form onSubmit={handleAccessRequestSubmit} className="flex-col gap-4">
                            <textarea
                                className="input"
                                rows="3"
                                placeholder="Why do you need admin access?"
                                value={accessRequest.reason}
                                onChange={(event) => setAccessRequest({ reason: event.target.value })}
                                required
                            />
                            <button type="submit" className="btn btn-primary" disabled={requestState.loading}>
                                {requestState.loading ? 'Sending Request...' : 'Send Access Request'}
                            </button>
                        </form>

                        {requestState.text && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '0.875rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: requestState.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: requestState.type === 'success' ? 'var(--success-color)' : '#ef4444',
                                border: `1px solid ${requestState.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                            }}>
                                {requestState.text}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;
