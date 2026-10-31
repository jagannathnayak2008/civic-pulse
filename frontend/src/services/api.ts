/// <reference types="vite/client" />

/**
 * Centralized API Client Service for CivicPulse
 * Supports VITE_API_URL environment variable for production (Render / Vercel)
 * and falls back to dynamic local resolution for development.
 */

const isBrowser = typeof window !== 'undefined';
const envApiUrl = import.meta.env?.VITE_API_URL;
const envWsUrl = import.meta.env?.VITE_WS_URL;

export const API_BASE = (envApiUrl && envApiUrl.trim() !== '')
  ? envApiUrl.replace(/\/+$/, '')
  : (isBrowser
      ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'http://localhost:8000'
          : `http://${window.location.hostname}:8000`)
      : 'http://localhost:8000');

export const WS_URL = (envWsUrl && envWsUrl.trim() !== '')
  ? envWsUrl
  : (isBrowser
      ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'ws://localhost:8000/ws/live-feed'
          : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8000/ws/live-feed`)
      : 'ws://localhost:8000/ws/live-feed');

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
