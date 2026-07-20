import { interviewService } from "./interview-service";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const realtimeService = {
  subscribeToInterview(interviewId, onStatusChange) {
    let active = true;
    let lastStatus = null;

    // Periodic fast polling sync fallback to capture state transitions seamlessly
    const interval = setInterval(async () => {
      if (!active) return;
      try {
        const interview = await interviewService.getInterview(interviewId);
        if (interview && interview.status !== lastStatus) {
          lastStatus = interview.status;
          onStatusChange(interview);
        }
      } catch (e) {
        console.warn("Realtime sync warning:", e);
      }
    }, 1500);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }
};