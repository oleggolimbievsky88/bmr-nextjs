"use client";
import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react"; // Still needed for credentials login
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRecover, setShowRecover] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverMessage, setRecoverMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        const msg = result.error === 'CredentialsSignin'
          ? 'Invalid email or password'
          : result.error
        setError(typeof msg === 'string' ? msg : 'Invalid email or password')
        setIsLoading(false)
        return
      }

      // Success - wait a moment for session to be established, then check user role and redirect
      // Use a small delay to ensure the session is properly set
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Fetch session to get user role
      const sessionResponse = await fetch("/api/auth/session", {
        cache: "no-store",
      });
      const session = await sessionResponse.json();

      // Use window.location for a full page navigation to avoid router state issues
      if (session?.user?.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/my-account";
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // OAuth sign-in disabled for now
  // const handleOAuthSignIn = async (provider) => {
  // 	try {
  // 		await signIn(provider, { callbackUrl: "/my-account" })
  // 	} catch (error) {
  // 		console.error(`OAuth ${provider} error:`, error)
  // 		setError(`Failed to sign in with ${provider}`)
  // 	}
  // }

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setRecoverMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: recoverEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRecoverMessage(data.error || "Failed to send reset email");
        setIsLoading(false);
        return;
      }

      setRecoverMessage(
        "If an account with that email exists, a password reset link has been sent.",
      );
      setRecoverEmail("");
    } catch (error) {
      console.error("Password reset error:", error);
      setRecoverMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flat-spacing-10">
      <div className="container">
        <div className="modern-login-wrapper">
          <div className="modern-login-card">
            {showRecover ? (
              <div id="recover" className="modern-login-form">
                <div className="modern-login-header">
                  <i className="bi bi-person-circle" />
                  <h2>Reset Password</h2>
                </div>
                <p className="modern-login-subtitle">
                  We will send you an email to reset your password
                </p>
                {recoverMessage && (
                  <div
                    className={`modern-alert ${
                      recoverMessage.includes("error") ||
                      recoverMessage.includes("Failed")
                        ? "alert-error"
                        : "alert-success"
                    }`}
                    role="alert"
                  >
                    {recoverMessage}
                  </div>
                )}
                <form onSubmit={handlePasswordReset}>
                  <div className="modern-input-group">
                    <i className="bi bi-envelope modern-input-icon" />
                    <input
                      className="modern-input"
                      placeholder="Email"
                      required
                      type="email"
                      autoComplete="email"
                      id="recover-email"
                      name="email"
                      value={recoverEmail}
                      onChange={(e) => setRecoverEmail(e.target.value)}
                      disabled={isLoading}
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="modern-form-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRecover(false);
                        setRecoverMessage("");
                      }}
                      className="modern-btn modern-btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="modern-btn modern-btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Reset password"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div id="login" className="modern-login-form">
                <div
                  style={{
                    borderBottom: "1px solid #cccccc",
                    paddingBottom: "10px",
                  }}
                >
                  {" "}
                  Login or Create an Account
                </div>

                {error && (
                  <div className="modern-alert alert-error" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="modern-input-group">
                    <i className="bi bi-envelope modern-input-icon" />
                    <input
                      required
                      className="modern-input"
                      placeholder="Email"
                      type="email"
                      autoComplete="email"
                      id="login-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="modern-input-group">
                    <i className="bi bi-lock modern-input-icon" />
                    <input
                      required
                      className="modern-input"
                      placeholder="Password"
                      type="password"
                      id="login-password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      disabled={isLoading}
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="modern-forgot-password">
                    <button
                      type="button"
                      onClick={() => setShowRecover(true)}
                      className="modern-link-btn"
                    >
                      Forgot your password?
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="modern-btn modern-btn-primary modern-btn-login"
                    disabled={isLoading}
                  >
                    <i className="bi bi-arrow-right" />
                    {isLoading ? "Logging in..." : "Login"}
                  </button>

                  {/* Social Login Section - Ready for Google/Facebook */}
                  <div className="modern-social-divider">
                    <span>Or login with:</span>
                  </div>
                  <div className="modern-social-buttons">
                    {/* Placeholder for Google button - will be added later */}
                    <button
                      type="button"
                      className="modern-btn modern-btn-google"
                      disabled
                      style={{ opacity: 0.8, cursor: "not-allowed" }}
                    >
                      <span className="modern-social-icon">G</span>
                      <span>Google</span>
                    </button>
                    {/* Placeholder for Facebook button - will be added later */}
                    <button
                      type="button"
                      className="modern-btn modern-btn-facebook"
                      disabled
                      style={{ opacity: 0.5, cursor: "not-allowed" }}
                    >
                      <span className="modern-social-icon">f</span>
                      <span>Facebook</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
