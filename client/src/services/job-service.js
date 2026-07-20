import { authService } from "./auth-service";

const API_URL = import.meta.env.VITE_URL_API || "http://localhost:8000";

export const jobService = {
  async getAllJobs() {
    const res = await fetch(`${API_URL}/jobs`, {
      headers: authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch jobs");
    return await res.json();
  },

  async createJob(jobData) {
    const res = await fetch(`${API_URL}/jobs`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(jobData),
    });
    if (!res.ok) throw new Error("Failed to create job");
    return await res.json();
  },

  async getJob(jobId) {
    const res = await fetch(`${API_URL}/jobs/${jobId}`, {
      headers: authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch job details");
    return await res.json();
  }
};