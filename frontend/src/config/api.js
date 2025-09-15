// API Configuration
// This file handles dynamic API URL configuration

const getApiUrl = () => {
  // Check for environment variable first
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Default to localhost for development
  return 'http://localhost:8080';
};

const API_BASE_URL = getApiUrl();

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  
  // User endpoints
  USER_PROFILE: `${API_BASE_URL}/api/users/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/api/users/update`,
  
  // Add more endpoints as needed
};

// Helper function to update API URL dynamically
export const updateApiUrl = (newUrl) => {
  // This can be used to update the URL at runtime if needed
  localStorage.setItem('apiUrl', newUrl);
  window.location.reload(); // Reload to apply new URL
};

// Check if there's a stored API URL (useful for testing different environments)
const storedUrl = localStorage.getItem('apiUrl');
if (storedUrl) {
  API_ENDPOINTS.LOGIN = `${storedUrl}/api/auth/login`;
  API_ENDPOINTS.REGISTER = `${storedUrl}/api/auth/register`;
  // Update other endpoints...
}

export default API_BASE_URL;