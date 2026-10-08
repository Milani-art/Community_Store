import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Fired when the saved login is no longer valid. Navbar listens for it.
export const AUTH_EXPIRED_EVENT = 'auth:expired';

// Reads the `exp` (seconds since epoch) claim from a JWT without verifying it.
// The server still does the real verification; this only lets the UI react early.
const getTokenExpiry = (token) => {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
        const payload = JSON.parse(atob(padded));
        return typeof payload.exp === 'number' ? payload.exp : null;
    } catch {
        return null;
    }
};

export const isTokenExpired = (token) => {
    const exp = getTokenExpiry(token);
    return exp !== null && exp * 1000 <= Date.now();
};

const expireSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
};

// Interceptor to inject JWT token (and drop it if it has already expired)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            if (isTokenExpired(token)) {
                expireSession();
            } else {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// If the server answers 401 to a request that carried a token, the login is no longer valid.
// (The backend currently tends to answer 403 instead, which is why the expiry check above exists.)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const url = error?.config?.url || '';
        const hadToken = Boolean(error?.config?.headers?.Authorization);
        if (status === 401 && hadToken && !url.startsWith('/auth/') && localStorage.getItem('token')) {
            expireSession();
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
};

export const productApi = {
    getAll: () => api.get('/products'),
    getById: (id) => api.get(`/products/${id}`),
    getByCategory: (category) => api.get(`/products/category/${category}`),
    search: (query) => api.get(`/products/search?q=${encodeURIComponent(query)}`),
    create: (productData) => api.post('/products', productData),
};

export const bulletinApi = {
    getAll: () => api.get('/bulletin'),
    create: (postData) => api.post('/bulletin', postData),
};

export const orderApi = {
    create: (orderData) => api.post('/orders', orderData),
    createPayFastCheckout: (orderData) => api.post('/orders/payfast/checkout', orderData),
    getMyOrders: () => api.get('/orders/my-orders'),
};

export const userApi = {
    getAllUsers: () => api.get('/users'),

    getPendingVerifications: () => api.get('/users/pending-verification'),

    verifyUser: (userId) => api.put(`/users/${userId}/verify`),

    banUser: (userId) => api.put(`/users/${userId}/ban`),

    unbanUser: (userId) => api.put(`/users/${userId}/unban`),

    deleteUser: (userId) => api.delete(`/users/${userId}`),
};

export default api;

// Pulls a readable message out of an Axios error.
// Order: backend ApiResponse.message -> backend-down detection -> fallback.
export const getErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
    const serverMessage = err?.response?.data?.message;
    if (serverMessage) return serverMessage;

    // No response at all: network error / server unreachable.
    if (err?.request && !err?.response) {
        return 'Cannot reach the server. Is the backend running?';
    }

    // Vite's dev proxy answers with an empty 500 (or 502/503/504) when the backend is down.
    const status = err?.response?.status;
    const body = err?.response?.data;
    const emptyBody = body === undefined || body === null || body === '';
    if ([500, 502, 503, 504].includes(status) && emptyBody) {
        return 'Cannot reach the server. Is the backend running?';
    }

    return fallback;
};