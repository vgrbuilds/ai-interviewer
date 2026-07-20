from supabase import Client
from src.core.supabase import supabase
from src.schemas.interview_schema import InterviewCreate, InterviewUpdate

class InterviewService:
    def __init__(self, client: Client):
        self.client = client

    async def create_interview(self, data: InterviewCreate):
        response = self.client.table("interviews").insert({
            "candidate_id": str(data.candidate_id),
            "job_id": str(data.job_id),
            "status": data.status or "preparing"
        }).execute()
        return response.data[0] if response.data else None

    async def get_interview(self, interview_id: str):
        response = self.client.table("interviews").select("*").eq("id", interview_id).execute()
        if not response.data:
            return None
        return response.data[0]

    async def save_interview_questions(self, interview_id: str, questions_list: list[dict]):
        """Batch inserts generated questions and updates interview question_sequence and status to in_progress."""
        if not questions_list:
            return None
            
        response = self.client.table("questions").insert(questions_list).execute()
        if not response.data:
            raise Exception("Failed to insert generated questions into database")
            
        question_ids = [q["id"] for q in response.data]
        
        update_response = self.client.table("interviews").update({
            "question_sequence": question_ids,
            "status": "in_progress",
            "updated_at": "now()"
        }).eq("id", interview_id).execute()
        
        return update_response.data[0] if update_response.data else None

    async def get_current_question(self, interview_id: str):
        """Fetches the next unanswered question object for the interview session."""
        interview = await self.get_interview(interview_id)
        if not interview:
            return None

        q_seq = interview.get("question_sequence") or []
        a_seq = interview.get("answer_sequence") or []

        next_idx = len(a_seq)
        if next_idx >= len(q_seq):
            return {"message": "All questions answered", "question": None, "is_finished": True}

        next_q_id = q_seq[next_idx]
        q_res = self.client.table("questions").select("*").eq("id", next_q_id).execute()
        question = q_res.data[0] if q_res.data else None

        return {
            "question_number": next_idx + 1,
            "total_questions": len(q_seq),
            "question": question,
            "is_finished": False
        }

    async def submit_answer(self, interview_id: str, candidate_id: str, question_id: str, answer_text: str):
        """Inserts answer into database and appends UUID to interview answer_sequence."""
        a_res = self.client.table("answers").insert({
            "interview_id": interview_id,
            "candidate_id": candidate_id,
            "question_id": question_id,
            "answer": answer_text
        }).execute()

        if not a_res.data:
            raise Exception("Failed to record answer in database")

        answer_id = a_res.data[0]["id"]

        interview = await self.get_interview(interview_id)
        if not interview:
            raise Exception("Interview session not found")

        answer_seq = interview.get("answer_sequence") or []
        answer_seq.append(answer_id)

        question_seq = interview.get("question_sequence") or []
        is_completed = len(answer_seq) >= len(question_seq) and len(question_seq) > 0
        new_status = "completed" if is_completed else interview.get("status", "in_progress")

        up_res = self.client.table("interviews").update({
            "answer_sequence": answer_seq,
            "status": new_status,
            "updated_at": "now()"
        }).eq("id", interview_id).execute()

        return {
            "answer": a_res.data[0],
            "interview": up_res.data[0] if up_res.data else None,
            "is_completed": is_completed
        }

    async def get_interview_qa_history(self, interview_id: str) -> list[dict]:
        """Fetches and aligns questions and candidate answers in sequence order."""
        interview = await self.get_interview(interview_id)
        if not interview:
            return []

        q_seq = interview.get("question_sequence") or []
        a_seq = interview.get("answer_sequence") or []

        if not q_seq:
            return []

        q_res = self.client.table("questions").select("*").in_("id", q_seq).execute()
        q_map = {q["id"]: q for q in (q_res.data or [])}

        a_map = {}
        if a_seq:
            a_res = self.client.table("answers").select("*").in_("id", a_seq).execute()
            a_map = {a["id"]: a for a in (a_res.data or [])}

        qa_history = []
        for idx, q_id in enumerate(q_seq):
            q_data = q_map.get(q_id, {})
            a_id = a_seq[idx] if idx < len(a_seq) else None
            a_data = a_map.get(a_id) if a_id else None

            qa_history.append({
                "question_str": q_data.get("question_str", "Question unavailable"),
                "topics": q_data.get("topics", []),
                "difficulty": q_data.get("difficulty", ""),
                "question_type": q_data.get("question_type", ""),
                "candidate_answer": a_data.get("answer") if a_data else "No answer provided"
            })

        return qa_history

    async def get_candidate_interview_history(self, user_id: str):
        """Fetches all past interviews for the candidate with job details."""
        candidate = self.client.table("candidates").select("id").eq("user_id", user_id).execute()
        if not candidate.data:
            return []

        candidate_id = candidate.data[0]["id"]
        response = (
            self.client.table("interviews")
            .select("*, jobs(company_name, job_role)")
            .eq("candidate_id", candidate_id)
            .order("created_at", desc=True)
            .execute()
        )

        history = []
        for row in response.data or []:
            job_info = row.get("jobs") or {}
            history.append({
                "id": row["id"],
                "company_name": job_info.get("company_name", "Company"),
                "job_role": job_info.get("job_role", "Job Position"),
                "status": row["status"],
                "interview_score": row.get("interview_score"),
                "interview_feedback": row.get("interview_feedback"),
                "created_at": row.get("created_at")
            })

        return history

    async def save_interview_evaluation(self, interview_id: str, score: float, feedback: str):
        """Saves final evaluation score and feedback and marks interview status as 'evaluated'."""
        response = self.client.table("interviews").update({
            "interview_score": score,
            "interview_feedback": feedback,
            "status": "evaluated",
            "updated_at": "now()"
        }).eq("id", interview_id).execute()
        return response.data[0] if response.data else None

    async def mark_interview_failed(self, interview_id: str):
        """Marks the interview status as 'failed' if AI preparation or generation fails completely."""
        response = self.client.table("interviews").update({
            "status": "failed",
            "updated_at": "now()"
        }).eq("id", interview_id).execute()
        return response.data[0] if response.data else None

    async def get_interview_report(self, interview_id: str):
        interview = await self.get_interview(interview_id)
        if not interview:
            return None
        return {
            "status": interview.get("status"),
            "interview_score": interview.get("interview_score"),
            "interview_feedback": interview.get("interview_feedback")
        }

    async def get_job_for_interview(self, interview_id: str):
        interview = await self.get_interview(interview_id)
        if not interview or not interview.get("job_id"):
            return None
        return await self.get_job_by_id(interview["job_id"])

    async def update_interview(self, interview_id: str, data: InterviewUpdate):
        update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items()}
        if not update_data:
            return await self.get_interview(interview_id)
        
        if "question_sequence" in update_data and update_data["question_sequence"] is not None:
            update_data["question_sequence"] = [str(x) for x in update_data["question_sequence"]]
        if "answer_sequence" in update_data and update_data["answer_sequence"] is not None:
            update_data["answer_sequence"] = [str(x) for x in update_data["answer_sequence"]]
            
        update_data["updated_at"] = "now()"
        response = self.client.table("interviews").update(update_data).eq("id", interview_id).execute()
        return response.data[0] if response.data else None

    async def delete_interview(self, interview_id: str):
        response = self.client.table("interviews").delete().eq("id", interview_id).execute()
        return response.data if response.data else None

    async def get_job_by_id(self, job_id: str):
        response = self.client.table("jobs").select("*").eq("id", job_id).execute()
        return response.data[0] if response.data else None

interview_service = InterviewService(supabase)