import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaUser,
  FaLock,
  FaArrowRight,
  FaGraduationCap,
  FaBirthdayCake,
  FaVenusMars,
  FaLanguage,
  FaSun,
  FaMoon,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import styles from "../styles/Register.module.css";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { GENDER_CHOICES, EDUCATION_CHOICES, LANGUAGE_CHOICES } from "../constants/userChoices";
import Select from 'react-select';

type OptionType = {
  value: string;
  label: string;
};

const Register: React.FC = (): JSX.Element => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<OptionType | null>(null);
  const [education, setEducation] = useState<OptionType | null>(null);
  const [motherLanguages, setMotherLanguages] = useState<OptionType[]>([]);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password || !age || !gender?.value || !education?.value || motherLanguages.length === 0) {
      toast.warning("Please fill in all fields including at least one native language");
      return;
    }

    const ageNumber = parseInt(age);
    if (isNaN(ageNumber) || ageNumber <= 0) {
      toast.error("Please enter a valid age");
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

    setIsSubmitting(true);
    try {
      await register(email, password, {
        age: ageNumber,
        gender: gender?.value,
        education: education?.value,
        mother_languages: motherLanguages.map(option => option.value)
      });
      
      toast.success("Registration successful! Please login.");
      navigate("/login");
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

  const handleLanguageChange = (
    selectedOptions: readonly OptionType[] | null
  ) => {
    setMotherLanguages(selectedOptions ? [...selectedOptions] : []);
  };

  return (
    <div className={`${styles.container} ${isDarkMode ? "dark-mode" : ""}`}>
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
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Personal Information</h2>
              <div className={styles.inputGroup}>
                <label htmlFor="age" className={styles.label}>
                  Age
                </label>
                <div className={styles.inputWrapper}>
                  <FaBirthdayCake className={styles.inputIcon} />
                  <input
                    id="age"
                    type="number"
                    min="1"
                    placeholder="Enter your age"
                    value={age}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || (parseInt(value) > 0 && !value.includes("."))) {
                        setAge(value);
                      }
                    }}
                    className={styles.input}
                    disabled={isSubmitting}
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
                    value={gender?.value || ''}
                    onChange={(e) => setGender({ value: e.target.value, label: e.target.options[e.target.selectedIndex].text })}
                    disabled={isSubmitting}
                    className={styles.select}
                    required
                  >
                    <option value="">Select your gender</option>
                    {GENDER_CHOICES.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
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
                    value={education?.value || ''}
                    onChange={(e) => setEducation({ value: e.target.value, label: e.target.options[e.target.selectedIndex].text })}
                    disabled={isSubmitting}
                    className={styles.select}
                    required
                  >
                    <option value="">Select your education level</option>
                    {EDUCATION_CHOICES.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="motherLanguages" className={styles.label}>
                  Native Language(s)
                </label>
                <div className={styles.inputWrapper}>
                  <FaLanguage className={styles.inputIcon} />
                  <Select
                    id="motherLanguages"
                    isMulti
                    options={LANGUAGE_CHOICES}
                    value={motherLanguages}
                    onChange={handleLanguageChange}
                    isDisabled={isSubmitting}
                    className={styles.reactSelect}
                    classNamePrefix="select"
                    placeholder="Select your mother language(s)"
                    required
                  />
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
