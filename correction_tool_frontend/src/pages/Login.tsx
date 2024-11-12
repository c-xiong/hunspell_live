import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { FaUser, FaLock, FaArrowRight } from 'react-icons/fa';
import styles from '../styles/Login.module.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Welcome to Spell Checker</h1>
        <p className={styles.subtitle}>Please sign in to access advanced features</p>
        
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <FaUser className={styles.inputIcon} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.inputGroup}>
            <FaLock className={styles.inputIcon} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              disabled={isSubmitting}
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