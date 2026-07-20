import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, message, Tag, Spin, Empty } from 'antd';
import { PlusOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../services/job-service';
import { interviewService } from '../services/interview-service';

export const JobComponent = () => {
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const data = await jobService.getAllJobs();
      setJobs(data);
    } catch (err) {
      message.error("Failed to load jobs from database");
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (values) => {
    setCreateLoading(true);
    try {
      const created = await jobService.createJob({
        company_name: values.company_name,
        job_role: values.job_role,
        job_description: values.job_description,
        job_skills: { required: values.skills ? values.skills.split(",").map(s => s.trim()) : [] }
      });
      message.success("Job posting created successfully!");
      setJobs([created, ...jobs]);
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      message.error(err.message || "Failed to create job posting");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStartInterview = async (jobId) => {
    setStartLoading(jobId);
    try {
      const session = await interviewService.createInterview(jobId);
      message.success("Interview session initialized! Preparing questions...");
      navigate(`/interview/${session.id}`);
    } catch (err) {
      message.error(err.message || "Failed to start interview session");
    } finally {
      setStartLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Available Job Postings</h2>
          <p className="text-gray-500 text-sm">Select a job role to begin your tailored AI interview session.</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setIsModalOpen(true)}
        >
          Post New Job
        </Button>
      </div>

      {loadingJobs ? (
        <div className="text-center py-16">
          <Spin size="large" tip="Loading jobs from database..." />
        </div>
      ) : jobs.length === 0 ? (
        <Card className="shadow-md rounded-lg text-center py-12">
          <Empty
            description={<span className="text-gray-500 text-base">No job postings found in the database.</span>}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
            >
              Post First Job
            </Button>
          </Empty>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="shadow-md rounded-lg hover:shadow-lg transition-shadow border-t-4 border-indigo-500"
              actions={[
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  loading={startLoading === job.id}
                  onClick={() => handleStartInterview(job.id)}
                  className="bg-indigo-600 hover:bg-indigo-700 font-semibold"
                >
                  Start AI Interview
                </Button>
              ]}
            >
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                  {job.company_name || 'Company'}
                </span>
                <h3 className="text-xl font-bold text-gray-800">{job.job_role}</h3>
                <p className="text-gray-600 text-sm line-clamp-3">{job.job_description}</p>
                {job.job_skills?.required && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {job.job_skills.required.map((skill, idx) => (
                      <Tag color="blue" key={idx}>{skill}</Tag>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal to Create Job */}
      <Modal
        title="Post a New Job Role"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateJob} className="mt-4">
          <Form.Item
            label="Company Name"
            name="company_name"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input placeholder="e.g. Google" />
          </Form.Item>
          <Form.Item
            label="Job Role"
            name="job_role"
            rules={[{ required: true, message: 'Please enter job role' }]}
          >
            <Input placeholder="e.g. Senior Backend Engineer" />
          </Form.Item>
          <Form.Item
            label="Job Description"
            name="job_description"
            rules={[{ required: true, message: 'Please enter job description' }]}
          >
            <Input.TextArea rows={4} placeholder="Describe the responsibilities and tech stack..." />
          </Form.Item>
          <Form.Item
            label="Required Skills (Comma-separated)"
            name="skills"
          >
            <Input placeholder="Python, FastAPI, React, PostgreSQL" />
          </Form.Item>
          <Form.Item className="flex justify-end gap-2 mb-0">
            <Button onClick={() => setIsModalOpen(false)} className="mr-2">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={createLoading}>
              Create Job
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default JobComponent;
