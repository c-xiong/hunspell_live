import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaArrowRight, FaHome } from 'react-icons/fa';
import styles from '../styles/Auth.module.css';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const Register: React.FC = (): JSX.Element => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const { isDarkMode } = useTheme();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      console.log('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await register(email, password);
      if (success) {
        navigate('/login');
      }
    } catch (error: any) {
      if (error.response?.data) {
        const data = error.response.data;
        if (data.email && Array.isArray(data.email)) {
          toast.error(data.email[0]);
        } else if (data.password && Array.isArray(data.password)) {
          toast.error(data.password[0]);
        } else if (data.detail) {
          toast.error(data.detail);
        } else {
          toast.error('Registration failed. Please try again.');
        }
      } else {
        toast.error('An unexpected error occurred. Please try again later.');
      }
      console.error('Register error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles.container} ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className={styles.loginCard}>
        <Link to="/" className={styles.homeButton}>
          <FaHome className={styles.buttonIcon} />
          Return to Home
        </Link>
        
        <h1 className={styles.title}>Welcome to Hunspell Live</h1>
        
        <form onSubmit={handleRegister} className={styles.form}>
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
              'Registering...'
            ) : (
              <>
                Register
                <FaArrowRight className={styles.buttonIcon} />
              </>
            )}
          </button>
        </form>

        <p className={styles.registerText}>
          Already have an account?{' '}
          <Link to="/login" className={styles.registerLink}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;