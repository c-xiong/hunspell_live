import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { FaUser, FaLock, FaArrowRight, FaHome } from 'react-icons/fa';
import styles from '../styles/Auth.module.css';

const Login: React.FC = (): JSX.Element => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error('An error occurred during login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <Link to="/" className={styles.homeButton}>
          <FaHome className={styles.buttonIcon} />
          Return to Home
        </Link>
        
        <h1 className={styles.title}>Welcome to Spell Checker</h1>
        <p className={styles.subtitle}>Please sign in to access advanced features</p>
        
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.visuallyHidden}>Email</label>
            <FaUser className={styles.inputIcon} />
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.visuallyHidden}>Password</label>
            <FaLock className={styles.inputIcon} />
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              disabled={isSubmitting}
              required
            />
          </div>

          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Signing in...'
            ) : (
              <>
                Sign In
                <FaArrowRight className={styles.buttonIcon} />
              </>
            )}
          </button>
        </form>

        <p className={styles.registerText}>
          New to Spell Checker?{' '}
          <Link to="/register" className={styles.registerLink}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;