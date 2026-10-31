/// <reference types="vite/client" />

/**
 * Centralized API Client Service for CivicPulse
 * Supports VITE_API_URL environment variable for production (Vercel)
 * and falls back to dynamic local resolution for development.
 */

const isBrowser = typeof window !== 'undefined';
const isDirectLocal = isBrowser && (window.location.port === '3000' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));

export const API_BASE = (import.meta.env?.VITE_API_URL as string) || (
  isDirectLocal
    ? 'http://localhost:8000'
    : (isBrowser ? window.location.origin : 'http://localhost:8000')
);

export const WS_URL = (import.meta.env?.VITE_WS_URL as string) || (
  isDirectLocal
    ? 'ws://localhost:8000/ws/live-feed'
    : (isBrowser
        ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/live-feed`
        : 'ws://localhost:8000/ws/live-feed')
);

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('civicpulse_token');
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });
}
