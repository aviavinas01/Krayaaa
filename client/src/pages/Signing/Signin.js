import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseconfig';
import './Login.css'; // Import the new CSS

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

function Login() {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email.endsWith('@kiit.ac.in')) {
        await signOut(auth);
        alert('Only KIIT university accounts are allowed');
        return;
      }
    } catch (err) {
      console.error('Google sign-in failed:', err);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Left Side: Branding/Welcome */}
        <div className="login-hero">
          <h1>Krayaa</h1>
          <p>The exclusive community for KIITians.</p>
          <div className="hero-features">
            <span>✓ Learn </span>
            <span>✓ Build </span>
            <span>✓ Grow </span>
          </div>
        </div>

        {/* Right Side: Action Area */}
        <div className="login-action-area">
          <div className="auth-container">
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Sign in with your university email to continue</p>
            
            <button className="google-login-btn" onClick={handleGoogleLogin}>
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google Icon" 
              />
              Continue with Google
            </button>
            
            <p className="auth-footer">
              Only <strong>@kiit.ac.in</strong> accounts are supported.
            </p>
          </div>
        </div>
      </div>
    </div>
    
  );
}

export default Login;