export default function LoginPage({ loginForm, setLoginForm, handleLogin, handleGoogleLogin, error }) {
  return (
    <section className="card login-card">
      <h2>Admin Login</h2>
      <p className="muted">Login with admin email/password. Customer storefront has no admin page.</p>
      <form className="form-grid" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="admin@email.com"
          value={loginForm.email}
          onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
        <input
          type="password"
          placeholder="password"
          value={loginForm.password}
          onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
          required
        />
        <button className="btn" type="submit">Sign In</button>
      </form>
      <div className="admin-divider">or continue with</div>
      <div className="form-grid">
        <button className="btn btn-soft google-btn" type="button" onClick={handleGoogleLogin}>
          <span className="google-btn__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.8-6-6.2s2.7-6.2 6-6.2c1.9 0 3.2.8 3.9 1.5l2.6-2.5C16.8 2.9 14.6 2 12 2 6.9 2 2.8 6.3 2.8 11.8S6.9 21.6 12 21.6c6.9 0 9.1-5 9.1-7.6 0-.5 0-.9-.1-1.3H12z"/>
            </svg>
          </span>
          Continue with Google
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
