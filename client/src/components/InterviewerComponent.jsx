import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Input, Progress, Spin, Result, Tag, message, Modal, Tooltip } from 'antd';
import {
  AudioOutlined,
  AudioMutedOutlined,
  SoundOutlined,
  PhoneOutlined,
  SendOutlined,
  TrophyOutlined,
  SyncOutlined,
  VideoCameraOutlined,
  VideoCameraAddOutlined,
  RobotOutlined,
  UserOutlined
} from '@ant-design/icons';
import { interviewService } from '../services/interview-service';
import { realtimeService } from '../services/realtime_service';

export const InterviewerComponent = () => {
  const { id: interviewId } = useParams();
  const navigate = useNavigate();

  // Session state
  const [session, setSession] = useState(null);
  const [currentQuestionData, setCurrentQuestionData] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState(null);

  // Meet Controls state
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [camEnabled, setCamEnabled] = useState(true);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize webcam
  useEffect(() => {
    if (camEnabled && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => setCamEnabled(false));
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [camEnabled]);

  // TTS Speech Synthesis
  const speakQuestion = (text) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // STT Speech Recognition
  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      message.warning("Voice dictation is not supported in this browser. Please type your response.");
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        message.info("Listening... Speak your answer now.");
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          setAnswerText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  // Fetch session & auto-speak question
  const fetchSessionState = async () => {
    try {
      const interview = await interviewService.getInterview(interviewId);
      setSession(interview);

      if (interview.status === 'in_progress') {
        const qData = await interviewService.getCurrentQuestion(interviewId);
        setCurrentQuestionData(qData);

        if (qData?.question?.question_str) {
          speakQuestion(qData.question.question_str);
        }
      } else if (interview.status === 'evaluated') {
        const rep = await interviewService.getReport(interviewId);
        setReport(rep);
      }
    } catch (err) {
      console.error("Fetch session error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionState();

    const unsubscribe = realtimeService.subscribeToInterview(interviewId, (updatedSession) => {
      setSession(updatedSession);
      if (updatedSession.status === 'in_progress') {
        fetchSessionState();
      } else if (updatedSession.status === 'evaluated') {
        interviewService.getReport(interviewId).then(setReport);
      }
    });

    return () => {
      unsubscribe();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [interviewId]);

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      message.warning("Please record or type an answer before submitting.");
      return;
    }
    if (!currentQuestionData?.question?.id) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    setSubmitting(true);
    try {
      const result = await interviewService.submitAnswer(
        interviewId,
        currentQuestionData.question.id,
        answerText
      );
      message.success("Answer submitted!");
      setAnswerText('');

      if (result.is_completed) {
        setSession({ ...session, status: 'completed' });
      } else {
        const nextQ = await interviewService.getCurrentQuestion(interviewId);
        setCurrentQuestionData(nextQ);
        if (nextQ?.question?.question_str) {
          speakQuestion(nextQ.question.question_str);
        }
      }
    } catch (err) {
      message.error(err.message || "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndCall = () => {
    Modal.confirm({
      title: 'End Interview Session?',
      content: 'Are you sure you want to leave this Interview Meeting room?',
      okText: 'End Session',
      okType: 'danger',
      onOk: () => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        navigate('/jobs');
      }
    });
  };

  if (loading) {
    return (
      <div className="py-20 text-center bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <Spin size="large" tip={<span className="text-white">Joining Interview Meeting Room...</span>} />
      </div>
    );
  }

  const status = session?.status || 'preparing';

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between p-4">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center bg-gray-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-gray-800 shadow-xl mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <span className="font-bold text-lg text-gray-200">AI Interview Session</span>
          <Tag color="purple">INTERVIEW MEETING ROOM</Tag>
        </div>

        {status === 'in_progress' && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-400">
              Question {currentQuestionData?.question_number || 1} / {currentQuestionData?.total_questions || 5}
            </span>
            <Progress
              percent={Math.round(
                ((currentQuestionData?.question_number || 1) / (currentQuestionData?.total_questions || 5)) * 100
              )}
              size="small"
              strokeColor="#6366f1"
              className="w-32"
            />
          </div>
        )}
      </div>

      {/* Main Meet Call Area */}
      <div className="flex-grow flex flex-col justify-center max-w-6xl w-full mx-auto">
        {/* State 1: PREPARING */}
        {status === 'preparing' && (
          <Card className="bg-gray-900 border-gray-800 text-center py-16 rounded-3xl shadow-2xl text-white">
            <Spin indicator={<SyncOutlined spin className="text-5xl text-indigo-500 mb-6" />} />
            <h2 className="text-3xl font-extrabold text-white">Connecting to AI Interviewer...</h2>
            <p className="text-gray-400 max-w-md mx-auto mt-3">
              The AI model is preparing questions based on your resume and job description.
            </p>
          </Card>
        )}

        {/* State 2: IN_PROGRESS (Interview Meeting Call Video Tiles) */}
        {status === 'in_progress' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AI Interviewer Video Tile */}
              <div className="relative bg-gray-900 rounded-3xl border border-gray-800 h-72 flex flex-col justify-center items-center overflow-hidden shadow-2xl">
                <div className="relative flex items-center justify-center mb-3">
                  <div
                    className={`w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-4xl shadow-xl transition-all duration-300 ${
                      isAiSpeaking ? 'ring-8 ring-indigo-500/50 scale-105' : ''
                    }`}
                  >
                    <RobotOutlined className="text-white" />
                  </div>
                  {isAiSpeaking && (
                    <div className="absolute -bottom-2 bg-indigo-600 text-xs px-3 py-0.5 rounded-full font-bold animate-pulse">
                      SPEAKING...
                    </div>
                  )}
                </div>

                <span className="font-bold text-gray-200">AI Interviewer</span>

                {/* Subtitle Display */}
                <div className="absolute bottom-3 inset-x-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-gray-800 text-center">
                  <p className="text-indigo-200 text-sm font-semibold line-clamp-2">
                    "{currentQuestionData?.question?.question_str || 'Loading question...'}"
                  </p>
                </div>
              </div>

              {/* Candidate Video Tile */}
              <div className="relative bg-gray-900 rounded-3xl border border-gray-800 h-72 flex justify-center items-center overflow-hidden shadow-2xl">
                {camEnabled ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-3xl transform -scale-x-100"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-4xl mb-2 text-gray-400">
                      <UserOutlined />
                    </div>
                    <span className="text-gray-400 text-sm">Camera Muted</span>
                  </div>
                )}

                <span className="absolute bottom-3 left-4 bg-black/60 px-3 py-1 rounded-lg text-xs font-bold">
                  You (Candidate)
                </span>

                {isRecording && (
                  <div className="absolute top-4 right-4 bg-red-600/90 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-2 animate-pulse shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-white"></div> RECORDING VOICE...
                  </div>
                )}
              </div>
            </div>

            {/* Response Input / Speech Dictation Display */}
            <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 shadow-xl">
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">
                Your Recorded Answer (Dictated / Typed):
              </label>
              <Input.TextArea
                rows={3}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Click the mic icon below to dictate your answer by voice, or type manually..."
                className="bg-gray-950 text-gray-100 border-gray-800 rounded-xl text-base p-3"
              />
            </div>
          </div>
        )}

        {/* State 3: COMPLETED */}
        {status === 'completed' && (
          <Card className="bg-gray-900 border-gray-800 text-center py-16 rounded-3xl shadow-2xl text-white">
            <Spin indicator={<SyncOutlined spin className="text-5xl text-purple-500 mb-6" />} />
            <h2 className="text-3xl font-extrabold text-white">Analyzing Interview Responses</h2>
            <p className="text-gray-400 max-w-md mx-auto mt-3">
              The AI Evaluator Agent is grading your performance and generating detailed report feedback...
            </p>
          </Card>
        )}

        {/* State 4: EVALUATED */}
        {status === 'evaluated' && (
          <Card className="bg-gray-900 border-gray-800 rounded-3xl shadow-2xl p-8 text-center text-white">
            <Result
              icon={<TrophyOutlined className="text-amber-400 text-6xl" />}
              title={<span className="text-3xl font-extrabold text-white">Interview Evaluated!</span>}
              subTitle={<span className="text-gray-400">Interview Meeting session finished successfully.</span>}
            />

            <div className="max-w-md mx-auto my-6 p-6 bg-emerald-950/60 rounded-2xl border border-emerald-500/30">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Final Score
              </span>
              <span className="text-5xl font-black text-emerald-400">
                {report?.interview_score != null ? Number(report.interview_score).toFixed(1) : 'N/A'}{' '}
                <span className="text-lg font-normal text-emerald-500">/ 10.0</span>
              </span>
            </div>

            <div className="text-left bg-gray-950 p-6 rounded-2xl border border-gray-800 space-y-2">
              <h4 className="font-bold text-lg text-gray-200">AI Feedback Summary:</h4>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {report?.interview_feedback || 'No feedback available.'}
              </p>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <Button type="primary" size="large" onClick={() => navigate('/history')}>
                View In History
              </Button>
              <Button type="default" size="large" onClick={() => navigate('/jobs')}>
                Return to Jobs
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Interview Meeting Bottom Controls Bar */}
      {status === 'in_progress' && (
        <div className="mt-4 bg-gray-900/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-gray-800 shadow-2xl flex justify-between items-center max-w-4xl w-full mx-auto">
          {/* Audio & Video Toggles */}
          <div className="flex items-center gap-3">
            <Tooltip title={isRecording ? 'Stop Dictating Voice' : 'Start Dictating Voice (Mic)'}>
              <Button
                type={isRecording ? 'primary' : 'default'}
                shape="circle"
                size="large"
                danger={isRecording}
                icon={isRecording ? <AudioOutlined /> : <AudioMutedOutlined />}
                onClick={toggleRecording}
                className={isRecording ? 'animate-bounce' : ''}
              />
            </Tooltip>

            <Tooltip title={camEnabled ? 'Turn Off Camera' : 'Turn On Camera'}>
              <Button
                type="default"
                shape="circle"
                size="large"
                icon={camEnabled ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />}
                onClick={() => setCamEnabled(!camEnabled)}
              />
            </Tooltip>

            <Tooltip title="Re-Read Question Aloud (TTS)">
              <Button
                type="default"
                shape="circle"
                size="large"
                icon={<SoundOutlined />}
                onClick={() => speakQuestion(currentQuestionData?.question?.question_str)}
              />
            </Tooltip>
          </div>

          {/* Submit Response */}
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            loading={submitting}
            onClick={handleSubmitAnswer}
            className="bg-indigo-600 hover:bg-indigo-700 font-semibold px-6 rounded-2xl"
          >
            Submit Answer
          </Button>

          {/* End Call Button */}
          <Tooltip title="End Interview">
            <Button
              type="primary"
              danger
              shape="circle"
              size="large"
              icon={<PhoneOutlined className="transform rotate-[135deg]" />}
              onClick={handleEndCall}
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default InterviewerComponent;
