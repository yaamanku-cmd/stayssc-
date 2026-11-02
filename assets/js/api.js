/**
 * STAYSCAPE — REST API Client SDK
 * Connects frontend discovery, checkout, bookings, and admin features with the Node.js/Express backend.
 * Gracefully detects online status and falls back to browser localStorage if offline.
 */

(function (window) {
  'use strict';

  // Determine API base URL
  function resolveBaseUrl() {
    if (window.location.protocol === 'file:') {
      return 'http://localhost:5000/api';
    }
    const port = window.location.port;
    if (port && port !== '5000') {
      // Running on different dev server (e.g. python 8000), target express on 5000
      return 'http://localhost:5000/api';
    }
    return '/api';
  }

  const API_BASE = resolveBaseUrl();

  class StayscapeApiClient {
    constructor() {
      this.baseUrl = API_BASE;
      this.isOnline = false;
      this.hasCheckedHealth = false;
      this.onStatusChangeCallbacks = [];
    }

    /**
     * Subscribe to backend online/offline connectivity changes.
     */
    onStatusChange(cb) {
      if (typeof cb === 'function') {
        this.onStatusChangeCallbacks.push(cb);
        if (this.hasCheckedHealth) {
          cb(this.isOnline);
        }
      }
    }

    notifyStatus(status) {
      this.isOnline = status;
      this.hasCheckedHealth = true;
      this.updateStatusBadge(status);
      this.onStatusChangeCallbacks.forEach(cb => {
        try { cb(status); } catch (e) { console.error(e); }
      });
    }

    /**
     * Ping /api/health to verify connectivity
     */
    async checkHealth() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${this.baseUrl}/health`, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          this.notifyStatus(true);
          return { ok: true, data };
        }
      } catch (err) {
        // Backend not running on expected port or offline
      }
      this.notifyStatus(false);
      return { ok: false };
    }

    /**
     * Update the visual API connection status indicator in the top header
     */
    updateStatusBadge(isOnline) {
      let badge = document.getElementById('api-connectivity-badge');
      if (!badge) {
        const actions = document.querySelector('.nav-actions');
        if (actions) {
          badge = document.createElement('div');
          badge.id = 'api-connectivity-badge';
          badge.className = 'api-status-pill';
          // Insert right before admin link or first child
          actions.insertBefore(badge, actions.firstChild);
        }
      }

      if (badge) {
        if (isOnline) {
          badge.innerHTML = `
            <span class="api-dot online" aria-hidden="true"></span>
            <span class="api-status-text">Backend Connected</span>
          `;
          badge.title = 'Connected to STAYSCAPE Live REST API (Node.js/Express)';
          badge.classList.remove('offline');
          badge.classList.add('online');
        } else {
          badge.innerHTML = `
            <span class="api-dot offline" aria-hidden="true"></span>
            <span class="api-status-text">Demo Storage</span>
          `;
          badge.title = 'Running in client demo mode with local browser storage. Start backend server (npm start) for live API.';
          badge.classList.remove('online');
          badge.classList.add('offline');
        }
      }
    }

    /**
     * Generic fetch wrapper with JSON handling and timeout
     */
    async request(endpoint, options = {}) {
      const url = `${this.baseUrl}${endpoint}`;
      const defaultHeaders = {
        'Accept': 'application/json'
      };

      if (options.body && typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
        defaultHeaders['Content-Type'] = 'application/json';
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), options.timeout || 8000);

        const response = await fetch(url, {
          ...options,
          headers: {
            ...defaultHeaders,
            ...options.headers
          },
          signal: controller.signal
        });
        clearTimeout(timeout);

        let data = null;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        if (!response.ok) {
          const errMsg = data && data.error ? data.error : `HTTP ${response.status}: Request failed`;
          return { success: false, status: response.status, error: errMsg };
        }

        this.notifyStatus(true);
        return { success: true, status: response.status, data: data.data !== undefined ? data.data : data, raw: data };
      } catch (err) {
        console.warn(`[StayscapeAPI] Request failed for ${endpoint}:`, err);
        this.notifyStatus(false);
        return { success: false, error: err.message || 'Network connection failed' };
      }
    }

    // ==========================================
    // Hotels & Destinations
    // ==========================================

    async getHotels(params = {}) {
      const query = new URLSearchParams();
      Object.keys(params).forEach(k => {
        if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
          query.set(k, params[k]);
        }
      });
      const qs = query.toString() ? `?${query.toString()}` : '';
      return this.request(`/hotels${qs}`);
    }

    async getHotelById(id) {
      return this.request(`/hotels/${encodeURIComponent(id)}`);
    }

    async calculatePrice(hotelId, calculationData) {
      return this.request(`/hotels/${encodeURIComponent(hotelId)}/calculate`, {
        method: 'POST',
        body: calculationData
      });
    }

    async getDestinations() {
      return this.request('/destinations');
    }

    // ==========================================
    // Bookings
    // ==========================================

    async getBookings(params = {}) {
      const query = new URLSearchParams();
      Object.keys(params).forEach(k => {
        if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
          query.set(k, params[k]);
        }
      });
      const qs = query.toString() ? `?${query.toString()}` : '';
      return this.request(`/bookings${qs}`);
    }

    async getBookingById(id) {
      return this.request(`/bookings/${encodeURIComponent(id)}`);
    }

    async createBooking(bookingData) {
      return this.request('/bookings', {
        method: 'POST',
        body: bookingData
      });
    }

    async cancelBooking(bookingId, reason = '') {
      return this.request(`/bookings/${encodeURIComponent(bookingId)}/cancel`, {
        method: 'PATCH',
        body: { reason }
      });
    }

    async deleteBooking(bookingId) {
      return this.request(`/bookings/${encodeURIComponent(bookingId)}`, {
        method: 'DELETE'
      });
    }

    // ==========================================
    // Admin Operations
    // ==========================================

    async getAdminStats() {
      return this.request('/admin/stats');
    }

    async createHotel(hotelData) {
      return this.request('/hotels', {
        method: 'POST',
        body: hotelData
      });
    }

    async updateHotel(id, hotelData) {
      return this.request(`/hotels/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: hotelData
      });
    }

    async deleteHotel(id) {
      return this.request(`/hotels/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    }

    async resetDatabase() {
      return this.request('/admin/reset', {
        method: 'POST'
      });
    }

    // ==========================================
    // Reviews
    // ==========================================

    async getReviews(hotelId) {
      const qs = hotelId ? `?hotelId=${encodeURIComponent(hotelId)}` : '';
      return this.request(`/reviews${qs}`);
    }

    async submitReview(reviewData) {
      return this.request('/reviews', {
        method: 'POST',
        body: reviewData
      });
    }
  }

  // Initialize and attach to global scope
  window.StayscapeAPI = new StayscapeApiClient();

  // Run initial health check on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.StayscapeAPI.checkHealth();
    });
  } else {
    window.StayscapeAPI.checkHealth();
  }

})(window);
