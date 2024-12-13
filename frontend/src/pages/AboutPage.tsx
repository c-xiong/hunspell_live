import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import styles from "../styles/AboutPage.module.css";

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem("theme");
      setIsDarkMode(savedTheme === "dark");
    };

    window.addEventListener("storage", handleThemeChange);
    return () => window.removeEventListener("storage", handleThemeChange);
  }, []);

  return (
    <div className={`${styles.page} ${isDarkMode ? styles.darkMode : ""}`}>
      <nav>
        <button
          className={styles.backButton}
          onClick={() => navigate("/")}
          aria-label="Return to home page"
        >
          <FaHome /> Return to Home
        </button>
      </nav>

      <main className={styles.content}>
        <section className={styles.section}>
          <h1 className={styles.title}>About Hunspell Live</h1>
          <div className={styles.version}>Version 1.0.0</div>
          <p className={`${styles.text} ${styles.timestamp}`}>
            Last Updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className={styles.text}>
            Hunspell Live is an open-source customized spell-checking tool
            powered by{" "}
            <a
              href="https://spylls.readthedocs.io/en/latest/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Spylls
            </a>
            . It enables developers and linguistic researchers to perform
            real-time spell checking using custom Hunspell dictionaries.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.subtitle}>Key Features</h2>
          <ul className={styles.featureList}>
            <li>Real-time spell checking with instant feedback</li>
            <li>Personal dictionary management</li>
            <li>
              Support for custom Hunspell dictionaries for linguistic
              researchers
            </li>
            <li>Support for different text directions (LTR and RTL)</li>
            <li>Research-oriented data collection</li>
            <li>Open-source and transparent</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.subtitle}>Research Purpose</h2>
          <p className={styles.text}>
            Hunspell Live aims to bridge Hunspell technology with real-world
            applications while advancing our understanding of spell-checking
            systems. Through the analysis of anonymous usage patterns and
            corrections, we strive to enhance spell-checking accuracy and user
            experience across diverse linguistic backgrounds.
          </p>
        </section>

        <section
          id="privacy"
          className={`${styles.section} ${styles.privacySection}`}
        >
          <h2 className={`${styles.subtitle} ${styles.privacyTitle}`}>
            <span className={styles.privacyIcon}>🔒</span> Privacy & Data Usage
          </h2>
          <div className={styles.privacyContent}>
            <p className={`${styles.text} ${styles.privacyText}`}>
              We take your privacy seriously. Our application uses cookies
              solely for maintaining login sessions. We collect and store basic
              demographic information (age, education level, gender, and native
              languages) and word replacement data for research purposes only.
              As an open-source project, we maintain complete transparency about
              our data handling practices.
            </p>
            <p className={`${styles.text} ${styles.privacyText}`}>
              We guarantee that your personal information will never be sold or
              shared with third parties. All collected data is used exclusively
              for contributing to academic research.
            </p>
          </div>
        </section>

        <section id="terms" className={styles.section}>
          <h2 className={styles.subtitle}>Terms of Use</h2>
          <p className={styles.text}>
            By using Hunspell Live, you agree to our terms and conditions.
          </p>
        </section>

        <section id="contact" className={styles.section}>
          <h2 className={styles.subtitle}>Contact & Support</h2>
          <p className={styles.text}>
            For questions, feedback, or support, please visit our{" "}
            <a
              href="https://github.com/imred42/hunspell_live"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              GitHub repository
            </a>{" "}
            or contact my{"  "}
            <a href="mailto:chenfei.xiong@outlook.com" className={styles.link}>
              email
            </a>
            .
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.subtitle}>Acknowledgments</h2>
          <p className={styles.text}>
            Thanks to{" "}
            <a
              href="https://sinaahmadi.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Dr. Sina Ahmadi
            </a>{" "}
            for his supervision and guidance throughout this project. We're also
            grateful to the{" "}
            <a
              href="https://spylls.readthedocs.io/en/latest/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Spylls
            </a>{" "}
            and{" "}
            <a
              href="https://github.com/hunspell/hunspell"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Hunspell
            </a>{" "}
            communities for their foundational work in spell-checking
            technology.
          </p>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;
