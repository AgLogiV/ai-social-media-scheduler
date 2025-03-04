/**
 * Get the authentication token from local storage
 * @returns {string|null} The authentication token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Set the authentication token in local storage
 * @param {string} token - The authentication token
 */
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Remove the authentication token from local storage
 */
export const removeToken = () => {
  localStorage.removeItem('token');
};

/**
 * Get the authentication header for API requests
 * @returns {Object} The authentication header
 */
export const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if the user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Parse the JWT token to get the user information
 * @returns {Object|null} The user information or null if not authenticated
 */
export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    // JWT tokens are in the format: header.payload.signature
    // We need the payload part
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing token:', error);
    removeToken(); // Invalid token, remove it
    return null;
  }
}; 