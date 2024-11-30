import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaUser,
  FaLock,
  FaArrowRight,
  FaHome,
  FaGraduationCap,
  FaBirthdayCake,
  FaVenusMars,
} from "react-icons/fa";
import styles from "../styles/Register.module.css";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { GENDER_CHOICES, EDUCATION_CHOICES } from "../constants/userChoices";

const Register: React.FC = (): JSX.Element => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const { isDarkMode } = useTheme();
  const [birthdate, setBirthdate] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [education, setEducation] = useState<string>("");

  const today = new Date().toISOString().split("T")[0];

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password || !birthdate || !gender || !education) {
      toast.warning("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      console.log("Password must be at least 8 characters long");
      return;
    }

    if (birthdate) {
      const birthdateObj = new Date(birthdate);
      const now = new Date();
      if (birthdateObj > now) {
        toast.error("Date of birth cannot be in the future");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const success = await register(email, password, {
        birthdate,
        gender,
        education,
      });
      if (success) {
        navigate("/login");
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
          toast.error("Registration failed. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
      console.error("Register error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles.container} ${isDarkMode ? "dark-mode" : ""}`}>
      <div className={styles.loginCard}>
        <Link to="/" className={styles.homeButton}>
          <FaHome className={styles.buttonIcon} />
          Return to Home
        </Link>

        <h1 className={styles.title}>Welcome to Hunspell Live</h1>

        <form onSubmit={handleRegister} className={styles.form}>
          <div className={styles.formSectionsContainer}>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Account Information</h2>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <div className={styles.inputWrapper}>
                  <FaUser className={styles.inputIcon} />
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <div className={styles.inputWrapper}>
                  <FaLock className={styles.inputIcon} />
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Personal Information</h2>
              <div className={styles.inputGroup}>
                <label htmlFor="birthdate" className={styles.label}>
                  Date of Birth
                </label>
                <div className={styles.inputWrapper}>
                  <FaBirthdayCake className={styles.inputIcon} />
                  <input
                    id="birthdate"
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    className={styles.input}
                    disabled={isSubmitting}
                    max={today}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="gender" className={styles.label}>
                  Gender
                </label>
                <div className={styles.inputWrapper}>
                  <FaVenusMars className={styles.inputIcon} />
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={styles.input}
                    disabled={isSubmitting}
                    required
                  >
                    <option value="">Select your gender</option>
                    {GENDER_CHOICES.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="education" className={styles.label}>
                  Education Level (Current or Completed)
                </label>
                <div className={styles.inputWrapper}>
                  <FaGraduationCap className={styles.inputIcon} />
                  <select
                    id="education"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className={styles.input}
                    disabled={isSubmitting}
                    required
                  >
                    <option value="">Select your education level</option>
                    {EDUCATION_CHOICES.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Registering..."
            ) : (
              <>
                Register
                <FaArrowRight className={styles.buttonIcon} />
              </>
            )}
          </button>
        </form>

        <p className={styles.registerText}>
          Already have an account?{" "}
          <Link to="/login" className={styles.registerLink}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
