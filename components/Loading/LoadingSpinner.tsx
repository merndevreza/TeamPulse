import React from "react";
import styles from "./LoadingSpinner.module.css";

const LoadingSpinner = () => {
  return (
    <div className={styles.container}>
      {/* Circle preloader matching the Lottie animation */}
      <div className={styles.spinnerWrapper}>
        {/* Background circle (gray) */}
        <svg
          className={styles.backgroundCircle}
          width="80"
          height="86"
          viewBox="0 0 80 86"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="40"
            cy="43"
            r="24"
            stroke="#e8e8e8"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
        </svg>

        {/* Animated progress arc (red-orange) */}
        <svg
          className={styles.progressCircle}
          width="80"
          height="86"
          viewBox="0 0 80 86"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className={styles.progressArc}
            cx="40"
            cy="43"
            r="24"
            stroke="#f0522d"
            strokeWidth="8"
            fill="none"
          />
        </svg>
      </div>

      {/* Loading text */}
      {/* <h2 className={styles.title}>
        Loading...
      </h2>
      <p className={styles.description}>
        Please wait while we prepare your content
      </p> */}
    </div>
  );
};

export default LoadingSpinner;
