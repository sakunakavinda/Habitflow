import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#0a0d14',
          color: '#f3f4f6',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '460px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '2rem',
            backdropFilter: 'blur(16px)'
          }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.75rem', color: '#ef4444' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              An unexpected error occurred while loading this view. You can reload the page to continue.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.65rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
