"use client";
import React, { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

const MAX_LOGIN_ATTEMPTS = 3;

export default function Login() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showPasswordResetSuggestion, setShowPasswordResetSuggestion] =
    useState(false);
  const [resendVerifyMessage, setResendVerifyMessage] = useState("");
  const [resendVerifyError, setResendVerifyError] = useState("");
  const [resendVerifyLoading, setResendVerifyLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setResendVerifyMessage("");
    setResendVerifyError("");
  }, []);

  const handleForgotEmailChange = useCallback((e) => {
    setForgotEmail(e.target.value);
    setError("");
    setSuccess("");
  }, []);

  const closeModal = useCallback(() => {
    if (typeof window !== "undefined" && window.bootstrap) {
      const modalElement = document.getElementById("login");
      if (modalElement) {
        const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
      }
    }
  }, []);

  const handleLogin = async (e) => {
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
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        // Check for specific error messages
        if (result.error.includes("verify your email")) {
          setError(
            "Please verify your email before logging in. Check your inbox for the verification link.",
          );
        } else if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          setShowPasswordResetSuggestion(true);
          setError(
            `Invalid email or password. You've tried ${newAttempts} times.`,
          );
        } else {
          setError("Invalid email or password");
        }

        setIsLoading(false);
        return;
      }

      // Success - reset attempts
      setLoginAttempts(0);
      setShowPasswordResetSuggestion(false);

      // Wait a moment for session to be established
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Fetch session to get user role
      const sessionResponse = await fetch("/api/auth/session", {
        cache: "no-store",
      });
      const session = await sessionResponse.json();

      closeModal();

      // Use window.location for a full page navigation
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!agreeToTerms) {
      setError("Please agree to the Terms & Conditions");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if email already exists
        if (data.error && data.error.toLowerCase().includes("email")) {
          setError(
            "An account with this email already exists. Please log in instead.",
          );
          return;
        }
        setError(data.error || "Registration failed");
        return;
      }

      setSuccess(
        "Account created successfully! Please check your email to verify your account.",
      );

      // Store email/password for auto-login
      const registeredEmail = formData.email;
      const registeredPassword = formData.password;

      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
      });
      setAgreeToTerms(false);

      // Auto-login after registration
      setTimeout(async () => {
        const result = await signIn("credentials", {
          email: registeredEmail,
          password: registeredPassword,
          redirect: false,
        });

        if (!result?.error) {
          closeModal();
          await new Promise((r) => setTimeout(r, 100));
          const sessionRes = await fetch("/api/auth/session", {
            cache: "no-store",
          });
          const session = await sessionRes.json();
          window.location.href =
            session?.user?.role === "admin" ? "/admin" : "/my-account";
        }
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send reset email");
        return;
      }

      setSuccess(
        data.message ||
          "If an account with that email exists, a password reset link has been sent. Check your inbox!",
      );
      setForgotEmail("");
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!formData.email) {
      setResendVerifyError("Please enter your email above.");
      return;
    }
    setResendVerifyError("");
    setResendVerifyMessage("");
    setResendVerifyLoading(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setResendVerifyError(data.error || "Failed to send. Please try again.");
        return;
      }
      setResendVerifyMessage(
        data.message ||
          "A new verification link has been sent. Check your inbox.",
      );
    } catch (err) {
      console.error("Resend verification error:", err);
      setResendVerifyError("An error occurred. Please try again.");
    } finally {
      setResendVerifyLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    try {
      await signIn(provider, { callbackUrl: "/my-account" });
    } catch (error) {
      console.error(`OAuth ${provider} error:`, error);
      setError(`Failed to sign in with ${provider}`);
    }
  };

  const switchToLogin = useCallback(() => {
    setIsRegisterMode(false);
    setIsForgotPasswordMode(false);
    setError("");
    setSuccess("");
    setResendVerifyMessage("");
    setResendVerifyError("");
    setFormData({
      firstname: "",
      lastname: "",
      email: "",
      password: "",
    });
    setAgreeToTerms(false);
  }, []);

  const switchToRegister = useCallback(() => {
    setIsRegisterMode(true);
    setIsForgotPasswordMode(false);
    setError("");
    setSuccess("");
    setLoginAttempts(0);
    setShowPasswordResetSuggestion(false);
    setFormData({
      firstname: "",
      lastname: "",
      email: "",
      password: "",
    });
    setAgreeToTerms(false);
  }, []);

  const switchToForgotPassword = useCallback(() => {
    setIsForgotPasswordMode(true);
    setIsRegisterMode(false);
    setError("");
    setSuccess("");
    setForgotEmail(formData.email || "");
  }, [formData.email]);

  const renderForgotPasswordForm = () => (
    <>
      <div className="modern-auth-header">
        <div className="modern-auth-title">
          <h2>Reset Password</h2>
        </div>
        <button
          type="button"
          className="modern-auth-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        >
          <i className="bi bi-x-lg" />
        </button>
      </div>

      <p className="modern-auth-subtitle">
        Enter your email and we'll send you a link to reset your password.
      </p>

      {error && (
        <div className="modern-auth-alert modern-auth-alert-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div
          className="modern-auth-alert modern-auth-alert-success"
          role="alert"
        >
          {success}
        </div>
      )}

      <div className="modern-auth-form">
        <form onSubmit={handleForgotPassword}>
          <div className="modern-input-group">
            <i className="bi bi-envelope modern-input-icon" />
            <input
              className="modern-input"
              placeholder="Email"
              type="email"
              autoComplete="email"
              required
              id="forgot-email"
              value={forgotEmail}
              onChange={handleForgotEmailChange}
              disabled={isLoading}
              suppressHydrationWarning
            />
          </div>
          <button
            type="submit"
            className="modern-btn modern-btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="modern-auth-switch" style={{ marginTop: "20px" }}>
          <span>
            Remember your password?{" "}
            <button
              type="button"
              onClick={switchToLogin}
              className="modern-auth-link"
            >
              Back to login
            </button>
          </span>
        </div>
      </div>
    </>
  );

  const renderLoginForm = () => (
    <>
      <div className="modern-auth-header">
        <div className="modern-auth-title">
          <h2>Log in</h2>
        </div>
        <button
          type="button"
          className="modern-auth-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        >
          <i className="bi bi-x-lg" />
        </button>
      </div>

      <div className="modern-auth-switch">
        <span>
          Don't have an account?{" "}
          <button
            type="button"
            onClick={switchToRegister}
            className="modern-auth-link"
          >
            Create account
          </button>
        </span>
      </div>

      {error && (
        <div className="modern-auth-alert modern-auth-alert-error" role="alert">
          {error}
          {error.includes("verify your email") && (
            <>
              <p style={{ marginTop: 8, marginBottom: 0 }}>
                Didn&apos;t receive it?{" "}
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isLoading || resendVerifyLoading}
                  className="modern-auth-link"
                  style={{
                    fontWeight: 600,
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor:
                      isLoading || resendVerifyLoading
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {resendVerifyLoading
                    ? "Sending..."
                    : "Resend verification link"}
                </button>
              </p>
              {resendVerifyError && (
                <p style={{ marginTop: 6, marginBottom: 0 }}>
                  {resendVerifyError}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {resendVerifyMessage && (
        <div
          className="modern-auth-alert modern-auth-alert-success"
          role="alert"
        >
          {resendVerifyMessage}
        </div>
      )}

      {showPasswordResetSuggestion && (
        <div
          className="modern-auth-alert modern-auth-alert-warning"
          role="alert"
        >
          <strong>Having trouble logging in?</strong>
          <p style={{ margin: "8px 0 0" }}>
            If you've forgotten your password, you can{" "}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                switchToForgotPassword();
              }}
              className="modern-auth-link"
              style={{ fontWeight: 600 }}
            >
              reset it here
            </button>
            .
          </p>
        </div>
      )}

      {success && (
        <div
          className="modern-auth-alert modern-auth-alert-success"
          role="alert"
        >
          {success}
        </div>
      )}

      <div className="modern-auth-form">
        <form onSubmit={handleLogin}>
          <div className="modern-input-group">
            <i className="bi bi-envelope modern-input-icon" />
            <input
              className="modern-input"
              placeholder="Email"
              type="email"
              autoComplete="email"
              required
              name="email"
              id="login-email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              suppressHydrationWarning
            />
          </div>
          <div className="modern-input-group modern-input-password">
            <i className="bi bi-lock modern-input-icon" />
            <input
              className="modern-input"
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              required
              name="password"
              id="login-password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              suppressHydrationWarning
            />
            <button
              type="button"
              className="modern-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
            </button>
          </div>
          <div className="modern-forgot-password">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                switchToForgotPassword();
              }}
              className="modern-auth-link"
            >
              Forgot your password?
            </button>
          </div>
          <button
            type="submit"
            className="modern-btn modern-btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="modern-social-divider">
          <span>Or login with:</span>
        </div>
        <div className="modern-social-buttons">
          <button
            type="button"
            className="modern-btn modern-btn-google"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isLoading}
          >
            <span className="modern-social-icon modern-social-icon-google">
              <img
                src="/images/logo/Google_logo.png"
                alt="Google"
                width={24}
                height={24}
                className="modern-social-icon-img"
              />
            </span>
            <span>Sign in with Google</span>
          </button>
          <button
            type="button"
            className="modern-btn modern-btn-facebook"
            onClick={() => handleOAuthSignIn("facebook")}
            disabled={isLoading}
          >
            <span className="modern-social-icon modern-social-icon-facebook">
              f
            </span>
            <span>Sign in with Facebook</span>
          </button>
        </div>
      </div>
    </>
  );

  const renderRegisterForm = () => (
    <>
      <div className="modern-auth-header">
        <div className="modern-auth-title">
          <span className="modern-auth-icon">+</span>
          <h2>Create an account</h2>
        </div>
        <button
          type="button"
          className="modern-auth-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        >
          <i className="bi bi-x-lg" />
        </button>
      </div>

      <div className="modern-auth-switch">
        <span>
          Already have an account?{" "}
          <button
            type="button"
            onClick={switchToLogin}
            className="modern-auth-link"
          >
            Log in
          </button>
        </span>
      </div>

      {error && (
        <div className="modern-auth-alert modern-auth-alert-error" role="alert">
          {error}
          {error.toLowerCase().includes("already exists") && (
            <p style={{ margin: "8px 0 0" }}>
              <button
                type="button"
                onClick={switchToLogin}
                className="modern-auth-link"
                style={{ fontWeight: 600 }}
              >
                Click here to log in
              </button>
            </p>
          )}
        </div>
      )}

      {success && (
        <div
          className="modern-auth-alert modern-auth-alert-success"
          role="alert"
        >
          {success}
        </div>
      )}

      <div className="modern-auth-form">
        <form onSubmit={handleRegister}>
          <div className="modern-auth-name-row">
            <div className="modern-input-group">
              <i className="bi bi-person modern-input-icon" />
              <input
                className="modern-input"
                placeholder="First name"
                type="text"
                required
                name="firstname"
                id="register-firstname"
                autoComplete="given-name"
                value={formData.firstname}
                onChange={handleChange}
                disabled={isLoading}
                suppressHydrationWarning
              />
            </div>
            <div className="modern-input-group">
              <i className="bi bi-person modern-input-icon" />
              <input
                className="modern-input"
                placeholder="Last name"
                type="text"
                required
                name="lastname"
                id="register-lastname"
                autoComplete="family-name"
                value={formData.lastname}
                onChange={handleChange}
                disabled={isLoading}
                suppressHydrationWarning
              />
            </div>
          </div>
          <div className="modern-input-group">
            <i className="bi bi-envelope modern-input-icon" />
            <input
              className="modern-input"
              placeholder="Email"
              type="email"
              autoComplete="email"
              required
              name="email"
              id="register-email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              suppressHydrationWarning
            />
          </div>
          <div className="modern-input-group modern-input-password">
            <i className="bi bi-lock modern-input-icon" />
            <input
              className="modern-input"
              placeholder="Password (min 8 characters)"
              type={showPassword ? "text" : "password"}
              required
              name="password"
              id="register-password"
              autoComplete="new-password"
              minLength={8}
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              suppressHydrationWarning
            />
            <button
              type="button"
              className="modern-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
            </button>
          </div>
          <div className="modern-auth-checkbox">
            <input
              type="checkbox"
              id="agree-terms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              disabled={isLoading}
            />
            <label htmlFor="agree-terms">
              I agree to the{" "}
              <Link href="/terms-conditions" className="modern-auth-link">
                Terms & Conditions
              </Link>
            </label>
          </div>
          <button
            type="submit"
            className="modern-btn modern-btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="modern-social-divider">
          <span>Or register with:</span>
        </div>
        <div className="modern-social-buttons">
          <button
            type="button"
            className="modern-btn modern-btn-google"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isLoading}
          >
            <span className="modern-social-icon modern-social-icon-google">
              <img
                src="/images/logo/Google_logo.png"
                alt="Google"
                width={24}
                height={24}
                className="modern-social-icon-img"
              />
            </span>
            <span>Sign in with Google</span>
          </button>
          <button
            type="button"
            className="modern-btn modern-btn-facebook"
            onClick={() => handleOAuthSignIn("facebook")}
            disabled={isLoading}
          >
            <span className="modern-social-icon modern-social-icon-facebook">
              f
            </span>
            <span>Sign in with Facebook</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div
      className="modal modalCentered fade modern-auth-modal modal-part-content"
      id="login"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modern-auth-content">
          <div
            className="modern-auth-panel"
            style={{
              display:
                !isForgotPasswordMode && !isRegisterMode ? "block" : "none",
            }}
            aria-hidden={isForgotPasswordMode || isRegisterMode}
          >
            {renderLoginForm()}
          </div>
          <div
            className="modern-auth-panel"
            style={{ display: isRegisterMode ? "block" : "none" }}
            aria-hidden={!isRegisterMode}
          >
            {renderRegisterForm()}
          </div>
          <div
            className="modern-auth-panel"
            style={{ display: isForgotPasswordMode ? "block" : "none" }}
            aria-hidden={!isForgotPasswordMode}
          >
            {renderForgotPasswordForm()}
          </div>
        </div>
      </div>
    </div>
  );
}
