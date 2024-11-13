import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaArrowRight, FaHome } from 'react-icons/fa';
import styles from '../styles/Auth.module.css';
import { apiRequest } from '../config/api';

const Register: React.FC = (): JSX.Element => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest("/auth/register/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        toast.success('Registration successful! You can now log in.');
        navigate('/login');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration failed', error);
      toast.error('Registration failed. Please try again.');
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
        <p className={styles.subtitle}>Join us to access advanced features</p>
        
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