export const API_URL = 'http://localhost:8080/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    let data;
    try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
    } catch (e) {
        console.error('Failed to parse JSON response', e);
        throw new Error('Invalid server response');
    }

    if (!response.ok) {
        const errorMessage = data?.message || (typeof data === 'string' ? data : JSON.stringify(data)) || 'An error occurred';
        throw new Error(errorMessage);
    }

    return data;
}
