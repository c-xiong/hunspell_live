import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { FaUser, FaLock, FaArrowRight, FaSun, FaMoon } from 'react-icons/fa';
import styles from '../styles/Login.module.css';
import { useTheme } from '../hooks/useTheme';

const Login: React.FC = (): JSX.Element => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

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
      }
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred. Please try again later.');
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles.container} ${isDarkMode ? 'dark-mode' : ''}`}>
      <header className={`${styles.header} ${isDarkMode ? 'dark-mode' : ''}`}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.logo}>Hunspell Live</div>
            <nav>
              <Link to="/" className={styles.navLink}>
                Home
              </Link>
            </nav>
          </div>
          <div className={styles.headerRight}>
            <button 
              className={styles.themeToggle} 
              onClick={toggleTheme}
              type="button"
            >
              {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <div className={styles.loginCard}>
        <h1 className={styles.title}>Welcome to Hunspell Live</h1>
        
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
          New here?{' '}
          <Link to="/register" className={styles.registerLink}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;