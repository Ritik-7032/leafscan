const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper to fetch with JWT token and standard error handling
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('leafscan_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Auto logout on unauthorized
      localStorage.removeItem('leafscan_token');
      localStorage.removeItem('leafscan_user');
      window.dispatchEvent(new Event('auth-changed'));
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }
    return data;
  } catch (err) {
    console.warn(`[API] Error on ${endpoint}:`, err.message);
    throw err;
  }
}

export const authAPI = {
  async login(email, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem('leafscan_token', data.token);
      localStorage.setItem('leafscan_user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('auth-changed'));
    }
    return data;
  },

  async register(name, email, password) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (data.token) {
      localStorage.setItem('leafscan_token', data.token);
      localStorage.setItem('leafscan_user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('auth-changed'));
    }
    return data;
  },

  async resetPassword(email, newPassword) {
    return await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });
  },

  async getMe() {
    return await apiRequest('/auth/me');
  },

  logout() {
    localStorage.removeItem('leafscan_token');
    localStorage.removeItem('leafscan_user');
    window.dispatchEvent(new Event('auth-changed'));
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('leafscan_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    return !!localStorage.getItem('leafscan_token');
  }
};

export const scanAPI = {
  async saveScan(scanData) {
    const token = localStorage.getItem('leafscan_token');
    if (!token) {
      // Offline / Guest mode: save locally to localStorage history
      this.saveLocalScan(scanData);
      return { local: true, scan: scanData };
    }

    try {
      const saved = await apiRequest('/scans', {
        method: 'POST',
        body: JSON.stringify(scanData),
      });
      // Also cache in local list
      this.saveLocalScan(saved.scan || scanData);
      return saved;
    } catch (err) {
      // Backend failed or waking up (Render): queue offline
      console.log('[Scan] Queuing scan in offline storage due to network/server timeout');
      this.saveLocalScan(scanData);
      this.queueOfflineSync(scanData);
      return { offline: true, scan: scanData };
    }
  },

  async getScans() {
    const token = localStorage.getItem('leafscan_token');
    if (!token) {
      return this.getLocalScans();
    }
    try {
      const data = await apiRequest('/scans');
      return data.scans || [];
    } catch (err) {
      return this.getLocalScans();
    }
  },

  async deleteScan(scanId) {
    const token = localStorage.getItem('leafscan_token');
    if (token && scanId && !scanId.startsWith('local_')) {
      try {
        await apiRequest(`/scans/${scanId}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Failed to delete on server, deleting locally');
      }
    }
    const local = this.getLocalScans().filter(s => (s._id !== scanId && s.id !== scanId));
    localStorage.setItem('leafscan_history', JSON.stringify(local));
    return true;
  },

  async getStats() {
    const token = localStorage.getItem('leafscan_token');
    if (token) {
      try {
        return await apiRequest('/stats');
      } catch (err) {
        // Fallback to local stats calculation
      }
    }
    const scans = this.getLocalScans();
    const diseaseCounts = {};
    let healthyCount = 0;
    let diseasedCount = 0;

    scans.forEach(s => {
      if (s.isHealthy) healthyCount++;
      else diseasedCount++;
      diseaseCounts[s.disease] = (diseaseCounts[s.disease] || 0) + 1;
    });

    return {
      totalScans: scans.length,
      healthyCount,
      diseasedCount,
      diseaseBreakdown: Object.entries(diseaseCounts).map(([name, count]) => ({ name, count }))
    };
  },

  getLocalScans() {
    try {
      const s = localStorage.getItem('leafscan_history');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  },

  saveLocalScan(scanData) {
    const existing = this.getLocalScans();
    const item = {
      ...scanData,
      _id: scanData._id || `local_${Date.now()}`,
      createdAt: scanData.createdAt || new Date().toISOString()
    };
    const updated = [item, ...existing.filter(s => s._id !== item._id)].slice(0, 50);
    localStorage.setItem('leafscan_history', JSON.stringify(updated));
  },

  queueOfflineSync(scanData) {
    try {
      const queue = JSON.parse(localStorage.getItem('leafscan_sync_queue') || '[]');
      queue.push(scanData);
      localStorage.setItem('leafscan_sync_queue', JSON.stringify(queue));
    } catch (e) {}
  },

  async processSyncQueue() {
    const token = localStorage.getItem('leafscan_token');
    if (!token) return;
    try {
      const queue = JSON.parse(localStorage.getItem('leafscan_sync_queue') || '[]');
      if (!queue.length) return;
      for (const item of queue) {
        await apiRequest('/scans', { method: 'POST', body: JSON.stringify(item) });
      }
      localStorage.removeItem('leafscan_sync_queue');
    } catch (e) {
      console.log('[Sync] Server still unavailable, will retry later');
    }
  }
};
