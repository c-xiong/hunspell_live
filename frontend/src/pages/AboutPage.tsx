import React, { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import styles from "../styles/AboutPage.module.css";

const AboutPage: React.FC = () => {
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

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`${styles.page} ${isDarkMode ? styles.darkMode : ""}`}>
      <header
        className={`${styles.header} ${isDarkMode ? styles.darkMode : ""}`}
      >
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.logo}>Hunspell Live</div>
            <nav>
              <a href="/" className={styles.navLink}>
                Home
              </a>
            </nav>
          </div>

          <div className={styles.headerRight}>
            <button className={styles.themeToggle} onClick={toggleTheme}>
              {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>
          </div>
        </div>
      </header>

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
            Hunspell Live is a sophisticated open-source spell-checking platform
            that leverages the capabilities of{" "}
            <a
              href="https://spylls.readthedocs.io/en/latest/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Spylls
            </a>
            . This platform facilitates real-time spell checking utilizing
            custom Hunspell dictionaries, serving both software developers and
            linguistic researchers.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.subtitle}>Core Capabilities</h2>
          <ul className={styles.featureList}>
            <li>Advanced real-time spell checking with immediate feedback</li>
            <li>Comprehensive dictionary management system</li>
            <li>
              Integration of custom Hunspell dictionaries for academic research
            </li>
            <li>Multilingual text direction support (LTR and RTL)</li>
            <li>Sophisticated data collection for research purposes</li>
            <li>Transparent, open-source architecture</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.subtitle}>Research Objectives</h2>
          <p className={styles.text}>
            Hunspell Live serves as a bridge between Hunspell technology and
            practical applications while facilitating academic research in
            computational linguistics. Through systematic analysis of anonymized
            usage patterns and corrections, we aim to advance spell-checking
            algorithms and enhance user experience across diverse linguistic
            contexts.
          </p>
        </section>

        <section
          id="privacy"
          className={`${styles.section} ${styles.privacySection}`}
        >
          <h2 className={`${styles.subtitle} ${styles.privacyTitle}`}>
            <span className={styles.privacyIcon}>🔒</span> Data Privacy Protocol
          </h2>
          <div className={styles.privacyContent}>
            <p className={`${styles.text} ${styles.privacyText}`}>
              We maintain stringent privacy standards in our operations. The
              application employs cookies exclusively for session management
              purposes. We collect essential demographic data (age, education
              level, gender, and native languages) and word replacement patterns
              solely for research purposes. As an open-source initiative, we
              maintain complete transparency regarding our data handling
              protocols.
            </p>
            <p className={`${styles.text} ${styles.privacyText}`}>
              We maintain a strict policy against sharing or selling personal
              information to third parties. All collected data is utilized
              exclusively for academic research purposes.
            </p>
          </div>
        </section>

        <section id="terms" className={styles.section}>
          <h2 className={styles.subtitle}>Terms of Service</h2>
          <div className={styles.termsContent}>
            <p className={styles.text}>
              Usage of Hunspell Live is subject to the following terms:
            </p>
            <ul className={`${styles.featureList} ${styles.termsList}`}>
              <li>
                Users consent to participate in research through the collection
                of anonymized spell-checking data.
              </li>
              <li>
                Spell-checking services are provided on an "as is" basis without
                warranty of accuracy.
              </li>
              <li>
                Users agree to utilize the service in compliance with all
                applicable laws.
              </li>
            </ul>
          </div>
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
