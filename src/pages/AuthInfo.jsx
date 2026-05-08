import React from 'react';
import { Link } from 'react-router-dom';
import './AuthInfo.css';

const AuthInfo = () => {
  return (
    <div className="auth-info page-container">
      <h1>How Authentication Works</h1>
      <section className="auth-step">
        <h2>1️⃣ Register</h2>
        <p>
          When you create an account with email and password, we call Firebase
          Authentication to create a user. A Firestore document is also created at
          <code>users/&lt;uid&gt;</code> containing your profile (email, display name,
          first/last name, and timestamps). After registration an email verification
          link is sent automatically – you must click it before you can log in.
        </p>
      </section>
      <section className="auth-step">
        <h2>2️⃣ Login</h2>
        <p>
          On login we sign in with <code>signInWithEmailAndPassword</code>. After a
          successful sign‑in we check <code>auth.currentUser.emailVerified</code>. If
          the email is not verified we sign you out and show an error prompting you
          to verify your email.
        </p>
      </section>
      <section className="auth-step">
        <h2>3️⃣ Social &amp; Phone Login</h2>
        <p>
          Google sign‑in uses <code>signInWithPopup</code> (or redirect fallback).
          Phone login sends an OTP via <code>signInWithPhoneNumber</code>. In both
          cases we upsert the user profile in Firestore so the same <code>users</code>
          collection is used for all auth methods.
        </p>
      </section>
      <section className="auth-step">
        <h2>4️⃣ Post‑login Experience</h2>
        <p>
          Once verified, the <code>AuthContext</code> provides the user object to
          the rest of the app. Protected routes (e.g., Account, Orders) are wrapped
          with <code>ProtectedRoute</code> which redirects unauthenticated users to
          the login page.
        </p>
      </section>
      <p>
        <Link to="/" className="auth-info__back">
          ← Back to Home
        </Link>
      </p>
    </div>
  );
};

export default AuthInfo;
