import { authService } from "./auth-service";

const API_URL = import.meta.env.VITE_URL_API || "http://localhost:8000";

export const candidateService = {
  async getProfile() {
    const res = await fetch(`${API_URL}/candidates/me`, {
      headers: authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch candidate profile");
    return await res.json();
  },

  async changePassword(newPassword) {
    const res = await fetch(`${API_URL}/candidates/change-password`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ new_password: newPassword }),
    });
    if (!res.ok) throw new Error("Failed to change password");
    return await res.json();
  },

  async uploadResume(file) {
    const formData = new FormData();
    formData.append("file", file);

    const token = authService.getToken();
    const res = await fetch(`${API_URL}/candidates/resume`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload resume");
    return await res.json();
  },

  async deleteProfile() {
    const res = await fetch(`${API_URL}/candidates/profile`, {
      method: "DELETE",
      headers: authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete candidate profile");
    return await res.json();
  }
};
