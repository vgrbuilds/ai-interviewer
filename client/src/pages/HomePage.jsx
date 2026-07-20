import React from 'react';
import Navbar from '../components/Navbar';
import { Card, Alert, Statistic, Row, Col, Progress, Tag } from 'antd';
import { TrophyOutlined, CheckCircleOutlined, BulbOutlined, InfoCircleOutlined } from '@ant-design/icons';

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6 text-left">
        {/* High-Contrast Sharp Notice Banner */}
        <Alert
          message={<span className="text-amber-950 font-bold text-base">Analytics Feature Preview (Upcoming)</span>}
          description={<span className="text-slate-900 font-semibold text-sm block mt-1">Note: The metrics below display simulated analytics for demonstration purposes. Full historical performance tracking is coming in a future update!</span>}
          type="warning"
          showIcon
          icon={<InfoCircleOutlined className="text-amber-600 text-2xl" />}
          className="rounded-xl shadow-md bg-amber-50 border-2 border-amber-400 p-4"
        />

        {/* Hero Welcome Banner */}
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg border-0">
          <div className="py-4 space-y-2">
            <h2 className="text-3xl font-extrabold text-white">Welcome Back to Interview.AI</h2>
            <p className="text-indigo-100 text-base max-w-2xl">
              Track your mock interview statistics, practice technical questions, and get AI-generated feedback.
            </p>
          </div>
        </Card>

        {/* Stats Grid (Dummy Data) */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card className="shadow-md rounded-lg text-center border-t-4 border-indigo-500">
              <Statistic
                title={<span className="text-gray-600 font-bold">Interviews Attended</span>}
                value={12}
                prefix={<CheckCircleOutlined className="text-indigo-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-md rounded-lg text-center border-t-4 border-emerald-500">
              <Statistic
                title={<span className="text-gray-600 font-bold">Average AI Score</span>}
                value={8.4}
                precision={1}
                suffix="/ 10.0"
                prefix={<TrophyOutlined className="text-amber-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-md rounded-lg text-center border-t-4 border-purple-500">
              <Statistic
                title={<span className="text-gray-600 font-bold">Skill Readiness</span>}
                value={85}
                suffix="%"
                prefix={<BulbOutlined className="text-purple-600" />}
              />
            </Card>
          </Col>
        </Row>

        {/* Detailed Breakdown Card */}
        <Card title={<span className="text-lg font-bold text-gray-800">Skill Breakdown & Improvement Areas (Dummy Data)</span>} className="shadow-md rounded-lg">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>FastAPI & Python System Design</span>
                <span className="text-emerald-600 font-bold">90%</span>
              </div>
              <Progress percent={90} strokeColor="#10b981" />
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>Behavioral & STAR Method Responses</span>
                <span className="text-indigo-600 font-bold">78%</span>
              </div>
              <Progress percent={78} strokeColor="#6366f1" />
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>Async & Multi-threading Concepts</span>
                <span className="text-amber-600 font-bold">65%</span>
              </div>
              <Progress percent={65} strokeColor="#f59e0b" />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-bold text-gray-800 mb-2">Recommended Focus Areas:</h4>
            <div className="flex flex-wrap gap-2">
              <Tag color="orange">Async Database Pooling</Tag>
              <Tag color="blue">REST Security Best Practices</Tag>
              <Tag color="green">STAR Methodology</Tag>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default HomePage;
