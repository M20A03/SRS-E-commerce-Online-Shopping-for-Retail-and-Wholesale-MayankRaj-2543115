import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Button } from '../components/Button'; // assuming a button component exists

const SignupPage = ({ onSignupSuccess }) => {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('register'); // register -> emailSent -> otp
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const functions = getFunctions();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const startSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password || !form.confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await sendEmailVerification(userCredential.user, { url: window.location.origin + '/login' });
      setStep('emailSent');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async () => {
    setLoading(true);
    try {
      const requestFn = httpsCallable(functions, 'requestWhatsAppOTP');
      await requestFn({ phone: form.phone }); // phone should be added to form (optional)
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const verifyFn = httpsCallable(functions, 'verifyWhatsAppOTP');
      const result = await verifyFn({ phone: form.phone, code: otp });
      if (result.data.success) {
        onSignupSuccess && onSignupSuccess();
      } else {
        setError('Invalid OTP');
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--signup">
      {step === 'register' && (
        <form onSubmit={startSignup} className="auth-form">
          <h2>Create Account</h2>
          {error && <div className="auth-error">{error}</div>}
          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input type="email" name="email" value={form.email} onChange={handleChange} required disabled={loading} />
          </label>
          <label className="auth-field">
            <span className="auth-label">Password</span>
            <input type="password" name="password" value={form.password} onChange={handleChange} required disabled={loading} />
          </label>
          <label className="auth-field">
            <span className="auth-label">Confirm Password</span>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required disabled={loading} />
          </label>
          <label className="auth-field">
            <span className="auth-label">Phone (for WhatsApp OTP)</span>
            <input type="tel" name="phone" value={form.phone || ''} onChange={handleChange} placeholder="e.g. +919876543210" required disabled={loading} />
          </label>
          <Button type="submit" disabled={loading}>Create Account</Button>
        </form>
      )}
      {step === 'emailSent' && (
        <div className="auth-step">
          <p>A verification email has been sent to <strong>{form.email}</strong>. Please verify your email before continuing.</p>
          <Button onClick={requestOtp} disabled={loading}>Send WhatsApp OTP</Button>
        </div>
      )}
      {step === 'otp' && (
        <form onSubmit={verifyOtp} className="auth-form">
          <h2>Enter WhatsApp OTP</h2>
          {error && <div className="auth-error">{error}</div>}
          <label className="auth-field">
            <span className="auth-label">OTP Code</span>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required disabled={loading} />
          </label>
          <Button type="submit" disabled={loading}>Verify OTP</Button>
        </form>
      )}
    </div>
  );
};

export default SignupPage;
