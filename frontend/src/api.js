const API_BASE = process.env.REACT_APP_API_BASE?.replace(/\/$/, '') || '';

const api = {
  async health() {
    const url = `${API_BASE}/api/health`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return res.json();
  },
};

export default api;
