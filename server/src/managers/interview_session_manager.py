import logging
from typing import Dict, Any

from src.services.interview_service import interview_service
from src.agents.interview_planner import interview_planner_agent
from src.agents.questions_generator import questions_generator_agent
from src.agents.answers_evaluator import answers_evaluator_agent

logger = logging.getLogger("interview_session_manager")

class InterviewSessionManager:
    async def prepare_interview_session(self, interview_id: str) -> Dict[str, Any]:
        """
        Orchestrates the in-memory AI planning and question generation pipeline.
        Includes retry logic for transient LLM errors and marks status as 'failed' on hard failure.
        """
        try:
            # Step 1: Generate Interview Plan Blueprint (In-Memory)
            logger.info(f"Generating interview plan for interview_id: {interview_id}")
            blueprint = await interview_planner_agent.generate_plan(interview_id)
            
            # Step 2: Generate Questions (In-Memory with Retry Loop)
            logger.info(f"Generating questions for interview_id: {interview_id}")
            questions = []
            max_retries = 2
            
            for attempt in range(1, max_retries + 1):
                try:
                    questions = await questions_generator_agent.generate_questions(blueprint)
                    if questions and len(questions) > 0:
                        break
                except Exception as err:
                    logger.warning(f"Attempt {attempt} failed generating questions: {err}")
                    if attempt == max_retries:
                        raise err

            if not questions:
                raise ValueError("Questions generator returned an empty list of questions")

            # Step 3: Atomic Database Save & Status Transition ('preparing' -> 'in_progress')
            updated_interview = await interview_service.save_interview_questions(
                interview_id=interview_id,
                questions_list=questions
            )
            
            logger.info(f"Interview session {interview_id} successfully prepared and set to in_progress")
            return updated_interview

        except Exception as e:
            logger.error(f"Error preparing interview session {interview_id}: {str(e)}")
            # Mark interview as failed so candidate can see status and option to retry
            try:
                await interview_service.mark_interview_failed(interview_id)
            except Exception as fail_err:
                logger.error(f"Failed to mark interview {interview_id} as failed: {str(fail_err)}")
                
            raise e

    async def evaluate_interview_session(self, interview_id: str) -> Dict[str, Any]:
        """
        Orchestrates the evaluation phase once an interview is completed.
        Fetches Q&A history, invokes AnswersEvaluatorAgent, saves score/feedback, and sets status to 'evaluated'.
        """
        try:
            logger.info(f"Starting evaluation for interview_id: {interview_id}")
            qa_history = await interview_service.get_interview_qa_history(interview_id)
            if not qa_history:
                raise ValueError(f"No Q&A history found for interview {interview_id}")

            evaluation = await answers_evaluator_agent.evaluate_answers(qa_history)

            updated_interview = await interview_service.save_interview_evaluation(
                interview_id=interview_id,
                score=evaluation["interview_score"],
                feedback=evaluation["interview_feedback"]
            )
            
            logger.info(f"Interview {interview_id} successfully evaluated with score {evaluation['interview_score']}")
            return updated_interview

        except Exception as e:
            logger.error(f"Error evaluating interview session {interview_id}: {str(e)}")
            raise e

interview_session_manager = InterviewSessionManager()