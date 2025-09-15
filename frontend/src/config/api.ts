// API Configuration
const isDevelopment = process.env.NODE_ENV === 'development';

// Check if we're accessing from a tunnel URL
const isLocalTunnel = window.location.hostname.includes('lhr.life') || window.location.hostname.includes('loca.lt');

// Use the appropriate API URL
const API_BASE_URL = isLocalTunnel
  ? 'https://1866a568d2ea17.lhr.life'
  : isDevelopment 
  ? `http://${window.location.hostname}:8080`
  : 'https://your-production-api.com';

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  },
  ADMIN: {
    STATS: `${API_BASE_URL}/api/admin/stats`,
    USERS: `${API_BASE_URL}/api/admin/users`,
  },
  // Add more endpoints as needed
};

export default API_BASE_URL;
