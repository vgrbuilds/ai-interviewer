const API_URL = import.meta.env.VITE_URL_API || "http://localhost:8000";

export const authService = {
  async signup(email, password) {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Signup failed" }));
      throw new Error(err.detail || "Signup failed");
    }
    const data = await res.json();
    const token = data.access_token || data.session?.access_token;
    if (token) {
      localStorage.setItem("access_token", token);
    }
    return data;
  },

  async signin(email, password) {
    const res = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Signin failed" }));
      throw new Error(err.detail || "Signin failed");
    }
    const data = await res.json();
    const token = data.access_token || data.session?.access_token;
    if (token) {
      localStorage.setItem("access_token", token);
    }
    return data;
  },

  logout() {
    localStorage.removeItem("access_token");
  },

  getToken() {
    return localStorage.getItem("access_token");
  },

  getAuthHeaders() {
    const token = this.getToken();
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }
};