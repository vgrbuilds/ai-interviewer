import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Card, Tag, Spin, Empty, Button, Collapse } from 'antd';
import { CalendarOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { interviewService } from '../services/interview-service';

export const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await interviewService.getHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load interview history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusTag = (status) => {
    switch (status) {
      case 'evaluated':
        return <Tag color="emerald">EVALUATED</Tag>;
      case 'completed':
        return <Tag color="purple">EVALUATING...</Tag>;
      case 'in_progress':
        return <Tag color="blue">IN PROGRESS</Tag>;
      case 'failed':
        return <Tag color="red">FAILED</Tag>;
      default:
        return <Tag color="gold">PREPARING</Tag>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6 text-left">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Past Interview History</h2>
          <p className="text-gray-500 text-sm">Review your past mock interviews, scores, and detailed AI feedback summaries.</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Spin size="large" tip="Loading past interview history..." />
          </div>
        ) : history.length === 0 ? (
          <Card className="shadow-md rounded-lg text-center py-12">
            <Empty description={<span className="text-gray-500 text-base">No past interviews found.</span>}>
              <Button type="primary" onClick={() => navigate('/jobs')}>
                Start Your First Interview
              </Button>
            </Empty>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Card
                key={item.id}
                className="shadow-md rounded-xl border-l-4 border-indigo-600 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {item.company_name}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800 mt-1">{item.job_role}</h3>
                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <CalendarOutlined /> {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusTag(item.status)}
                    {item.interview_score != null && (
                      <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 text-center">
                        <span className="text-xs text-emerald-700 font-bold block">AI Score</span>
                        <span className="text-xl font-extrabold text-emerald-600">
                          {Number(item.interview_score).toFixed(1)} <span className="text-xs text-emerald-700">/ 10</span>
                        </span>
                      </div>
                    )}
                    <Button
                      type="default"
                      icon={<ArrowRightOutlined />}
                      onClick={() => navigate(`/interview/${item.id}`)}
                    >
                      View Session
                    </Button>
                  </div>
                </div>

                {item.interview_feedback && (
                  <Collapse
                    ghost
                    items={[
                      {
                        key: 'feedback',
                        label: <span className="font-bold text-gray-700">View Detailed AI Feedback</span>,
                        children: (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                            {item.interview_feedback}
                          </div>
                        ),
                      },
                    ]}
                  />
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
