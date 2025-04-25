import { useState } from "react";

export default function FindMeButton({ onFindMe, loading, error }) {
  const [showError, setShowError] = useState(false);

  const handleClick = () => {
    onFindMe();
    if (error) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  return (
    <div className="find-me-container">
      <button
        onClick={handleClick}
        disabled={loading}
        className="find-me-button"
        title="Find my location"
      >
        {loading ? "Loading..." : "📍 Find Me"}
      </button>
      {showError && error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
} 