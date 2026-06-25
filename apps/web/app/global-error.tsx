"use client";

import { useEffect } from "react";

import { logError } from "@/shared/utils/error";

/**
 * Last line of defence. This only renders when the root layout itself throws,
 * which means providers and global CSS may not be available — so the markup is
 * fully self-contained with inline styles and its own <html>/<body>.
 */
const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    logError("app/global-error", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0b0b0f",
          color: "#e5e7eb",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#9ca3af",
              margin: 0,
            }}
          >
            Error
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: "12px 0" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#9ca3af", lineHeight: 1.6, margin: "0 0 24px" }}>
            The app ran into an unexpected problem. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              cursor: "pointer",
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              fontWeight: 600,
              color: "#0b0b0f",
              background: "#e5e7eb",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
