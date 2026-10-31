/**
 * Real-Time WebSocket Client for CivicPulse
 */

import { WS_URL } from './api';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private listeners: ((event: any) => void)[] = [];
  private reconnectTimeout: any = null;

  connect() {
    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onmessage = (messageEvent) => {
        try {
          const data = JSON.parse(messageEvent.data);
          this.listeners.forEach((listener) => listener(data));
        } catch (e) {
          console.error('[WebSocket] Parse error:', e);
        }
      };

      this.ws.onclose = () => {
        this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = (err) => {
        console.warn('[WebSocket] Connection error:', err);
        this.ws?.close();
      };
    } catch (e) {
      console.warn('[WebSocket] Init failed:', e);
    }
  }

  subscribe(listener: (event: any) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  disconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.ws?.close();
    this.ws = null;
  }
}

export const wsClient = new WebSocketClient();
