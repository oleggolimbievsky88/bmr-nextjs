/**
 * Redirect to unified login (e.g. when admin session expired).
 * Preserves current path as callbackUrl so user returns after login.
 */
export function redirectToAdminLogin() {
  if (typeof window !== "undefined") {
    const callbackUrl = encodeURIComponent(
      window.location.pathname + window.location.search,
    );
    window.location.href = `/login?callbackUrl=${callbackUrl}`;
  }
}

/**
 * Check if an API response indicates unauthorized (session expired).
 * If so, redirects to admin login and returns true.
 */
export function handleAdmin401(response) {
  if (response?.status === 401) {
    redirectToAdminLogin();
    return true;
  }
  return false;
}
