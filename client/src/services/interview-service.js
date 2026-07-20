import { authService } from "./auth-service";

const API_URL = import.meta.env.VITE_URL_API || "http://localhost:8000";

export const interviewService = {
  async createInterview(jobId, candidateId) {
    const res = await fetch(`${API_URL}/interviews`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({
        job_id: jobId,
        candidate_id: candidateId || "00000000-0000-0000-0000-000000000000"
      }),
    });
    if (!res.ok) throw new Error("Failed to create interview session");
    return await res.json();
  },

  async getHistory() {
    const res = await fetch(`${API_URL}/interviews/history`, {
      headers: authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch interview history");
    return await res.json();
  },

  async getInterview(interviewId) {
    const res = await fetch(`${API_URL}/interviews/${interviewId}`, {
      headers: authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch interview status");
    return await res.json();
  },

  async getCurrentQuestion(interviewId) {
    const res = await fetch(`${API_URL}/interviews/${interviewId}/current-question`, {
      headers: authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch current question");
    return await res.json();
  },

  async submitAnswer(interviewId, questionId, answerText) {
    const res = await fetch(`${API_URL}/interviews/${interviewId}/answer`, {
      method: "POST",
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({
        question_id: questionId,
        answer: answerText
      }),
    });
    if (!res.ok) throw new Error("Failed to submit answer");
    return await res.json();
  },

  async getReport(interviewId) {
    const res = await fetch(`${API_URL}/interviews/${interviewId}/report`, {
      headers: authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch evaluation report");
    return await res.json();
  },

  async getJob(interviewId) {
    const res = await fetch(`${API_URL}/interviews/${interviewId}/job`, {
      headers: authService.getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch interview job details");
    return await res.json();
  }
};