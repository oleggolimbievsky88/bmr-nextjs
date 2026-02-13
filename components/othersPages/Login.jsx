"use client";
import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

const MAX_LOGIN_ATTEMPTS = 3;

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || null;
  const recoverFromUrl = searchParams.get("recover") === "1";
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRecover, setShowRecover] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverMessage, setRecoverMessage] = useState("");
  const [recoverIsError, setRecoverIsError] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showPasswordResetSuggestion, setShowPasswordResetSuggestion] =
    useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendVerifyMessage, setResendVerifyMessage] = useState("");
  const [resendVerifyError, setResendVerifyError] = useState("");
  const [resendVerifyLoading, setResendVerifyLoading] = useState(false);

  // Redirect already logged-in users to the correct dashboard
  useEffect(() => {
    if (status !== "authenticated" || !session) return;
    if (session.user?.role === "admin") {
      router.replace(
        callbackUrl && callbackUrl.startsWith("/admin")
          ? callbackUrl
          : "/admin",
      );
      return;
    }
    if (
      callbackUrl &&
      callbackUrl.startsWith("/") &&
      !callbackUrl.startsWith("//")
    ) {
      router.replace(callbackUrl);
      return;
    }
    router.replace("/my-account");
  }, [session, status, router, callbackUrl]);

  // Show recover form when landing from /login?recover=1 (e.g. from checkout)
  useEffect(() => {
    if (recoverFromUrl) setShowRecover(true);
  }, [recoverFromUrl]);

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
          const msg =
            result.error === "CredentialsSignin"
              ? "Invalid email or password"
              : result.error;
          setError(typeof msg === "string" ? msg : "Invalid email or password");
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

      // Use window.location for a full page navigation
      if (session?.user?.role === "admin") {
        window.location.href =
          callbackUrl && callbackUrl.startsWith("/admin")
            ? callbackUrl
            : "/admin";
      } else if (callbackUrl && callbackUrl.startsWith("/")) {
        window.location.href = callbackUrl;
      } else {
        window.location.href = "/my-account";
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    try {
      await signIn(provider, { callbackUrl: callbackUrl || "/my-account" });
    } catch (err) {
      console.error(`OAuth ${provider} error:`, err);
      setError(`Failed to sign in with ${provider}`);
    }
  };

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

      let data = {};
      try {
        data = await response.json();
      } catch (_) {
        data = {};
      }

      if (!response.ok) {
        setRecoverIsError(true);
        setRecoverMessage(data.error || "Failed to send reset email");
        return;
      }

      setRecoverIsError(false);
      setRecoverMessage(
        data.message ||
          "If an account with that email exists, a password reset link has been sent. Check your inbox!",
      );
      setRecoverEmail("");
    } catch (err) {
      console.error("Password reset error:", err);
      setRecoverIsError(true);
      setRecoverMessage("An error occurred. Please try again.");
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

  const switchToRecover = useCallback(() => {
    setShowRecover(true);
    setRecoverEmail(formData.email || "");
    setRecoverMessage("");
    setError("");
    const params = new URLSearchParams();
    params.set("recover", "1");
    if (callbackUrl) params.set("callbackUrl", callbackUrl);
    router.replace(`/login?${params.toString()}`, { scroll: false });
  }, [formData.email, callbackUrl, router]);

  const switchToLogin = useCallback(() => {
    setShowRecover(false);
    setRecoverMessage("");
    setError("");
    const url = callbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login";
    router.replace(url, { scroll: false });
  }, [callbackUrl, router]);

  // Don't show form while checking session or redirecting logged-in user
  if (status === "loading" || status === "authenticated") {
    return (
      <section className="flat-spacing-10">
        <div className="container">
          <div className="text-center py-5">
            <div
              className="spinner-border text-danger"
              role="status"
              aria-hidden="true"
            />
            <p className="mt-2 mb-0">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="container">
        <div className="modern-login-wrapper">
          <div className="modern-login-card">
            {showRecover ? (
              <div id="login-recover" className="modern-login-form">
                <div className="modern-login-header">
                  <i className="bi bi-key" />
                  <h2>Reset Password</h2>
                </div>
                <p className="modern-login-subtitle">
                  Enter your email and we'll send you a link to reset your
                  password.
                </p>
                {recoverMessage && (
                  <div
                    className={`modern-alert ${recoverIsError ? "alert-error" : "alert-success"}`}
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
                      onClick={switchToLogin}
                      className="modern-btn modern-btn-secondary"
                    >
                      Back to Login
                    </button>
                    <button
                      type="submit"
                      className="modern-btn modern-btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Send Reset Link"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div id="login-page-form" className="modern-login-form">
                <div className="modern-login-header">
                  <i className="bi bi-person-circle" />
                  <h2>Welcome Back</h2>
                </div>

                <p className="modern-login-subtitle">
                  Sign in to your account or{" "}
                  <Link href="/register" className="modern-link">
                    create a new account
                  </Link>
                </p>

                {error && (
                  <div className="modern-alert alert-error" role="alert">
                    {error}
                    {error.includes("verify your email") && (
                      <>
                        <p style={{ marginTop: 8, marginBottom: 0 }}>
                          Didn&apos;t receive it?{" "}
                          <button
                            type="button"
                            onClick={handleResendVerification}
                            disabled={isLoading || resendVerifyLoading}
                            className="modern-link"
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
                  <div className="modern-alert alert-success" role="alert">
                    {resendVerifyMessage}
                  </div>
                )}

                {showPasswordResetSuggestion && (
                  <div className="modern-alert alert-warning" role="alert">
                    <strong>Having trouble logging in?</strong>
                    <p style={{ margin: "8px 0 0" }}>
                      If you've forgotten your password, you can{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          switchToRecover();
                        }}
                        className="modern-link"
                        style={{
                          fontWeight: 600,
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                        }}
                      >
                        reset it here
                      </button>
                      .
                    </p>
                    <p style={{ margin: "8px 0 0" }}>
                      Don't have an account?{" "}
                      <Link
                        href="/register"
                        className="modern-link"
                        style={{ fontWeight: 600 }}
                      >
                        Create one now
                      </Link>
                    </p>
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
                  <div className="modern-input-group modern-input-password">
                    <i className="bi bi-lock modern-input-icon" />
                    <input
                      required
                      className="modern-input"
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      id="login-password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      disabled={isLoading}
                      suppressHydrationWarning
                    />
                    <button
                      type="button"
                      className="modern-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i
                        className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                      />
                    </button>
                  </div>
                  <div className="modern-forgot-password">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        switchToRecover();
                      }}
                      className="modern-auth-link"
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        textDecoration: "underline",
                        color: "#be0000",
                        fontSize: 14,
                      }}
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

                  {/* Social Login Section */}
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
                      <span className="modern-social-icon">G</span>
                      <span>Google</span>
                    </button>
                    <button
                      type="button"
                      className="modern-btn modern-btn-facebook"
                      onClick={() => handleOAuthSignIn("facebook")}
                      disabled={isLoading}
                    >
                      <span className="modern-social-icon">f</span>
                      <span>Facebook</span>
                    </button>
                  </div>
                </form>

                <div className="modern-login-footer">
                  <p>
                    Don't have an account?{" "}
                    <Link href="/register" className="modern-link">
                      Create one now
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
