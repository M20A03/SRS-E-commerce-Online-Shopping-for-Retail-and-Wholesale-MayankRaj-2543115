import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Uncaught component render error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="container section flex-col items-center justify-center animate-fade-in"
          style={{
            minHeight: '65vh',
            textAlign: 'center',
            paddingTop: '4rem',
            paddingBottom: '4rem',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--brand-danger-bg, #fee2e2)',
              color: 'var(--brand-danger, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <AlertTriangle size={36} />
          </div>

          <h1 className="heading-2" style={{ marginBottom: '0.75rem' }}>
            Something went wrong
          </h1>
          <p
            className="text-muted"
            style={{ maxWidth: '480px', marginBottom: '2rem', fontSize: '1rem' }}
          >
            We encountered an unexpected error while rendering this page. Our technical team has
            been alerted.
          </p>

          <div className="flex gap-4" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.handleReload}
              style={{ minWidth: '140px' }}
            >
              <RefreshCw size={18} />
              Reload Page
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={this.handleGoHome}
              style={{ minWidth: '140px' }}
            >
              <Home size={18} />
              Go to Home
            </button>
          </div>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details
              style={{
                marginTop: '3rem',
                textAlign: 'left',
                maxWidth: '650px',
                width: '100%',
                padding: '1rem',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                fontSize: '0.85rem',
                overflowX: 'auto',
              }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>
                Debug Stack Trace (Development Only)
              </summary>
              <pre style={{ marginTop: '0.75rem', color: 'var(--brand-danger)' }}>
                {this.state.error.toString()}
              </pre>
              <pre style={{ marginTop: '0.5rem', opacity: 0.8, fontSize: '0.75rem' }}>
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
