// Check if token is expired
export function isTokenExpired() {
    const expiration = localStorage.getItem('expiration');

    // If expiration is missing, consider token expired
    if (!expiration) return true;

    const currentTime = new Date().getTime();
    return currentTime > expiration;
}

// Clear expired token and recaptcha data
export function clearExpiredToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('_grecaptcha');
    localStorage.removeItem('expiration');
    localStorage.removeItem('loginType');
    localStorage.removeItem('username');
}

// Check token expiration every minute
export function setupTokenExpirationCheck() {
    setInterval(() => {
        if (isTokenExpired()) {
            clearExpiredToken();
            window.location.href = '/login'; // Redirect to login
        }
    }, 60* 60 * 1000); // Check every 1 minute
}

// Call this on page load
export function checkTokenOnLoad() {
    if (isTokenExpired()) {
        clearExpiredToken();
        window.location.href = '/login'; // Redirect immediately if expired
    }
}
