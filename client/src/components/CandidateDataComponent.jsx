import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, Upload, message, Modal, Tag, Spin, Divider } from 'antd';
import { UploadOutlined, DeleteOutlined, LockOutlined, FileTextOutlined } from '@ant-design/icons';
import { candidateService } from '../services/candidate-service';

export const CandidateDataComponent = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await candidateService.getProfile();
      setProfileData(data);
    } catch (err) {
      message.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpload = async (info) => {
    const file = info.file;
    setUploading(true);
    try {
      await candidateService.uploadResume(file);
      message.success("Resume uploaded and parsed successfully!");
      fetchProfile();
    } catch (err) {
      message.error(err.message || "Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProfile = async () => {
    Modal.confirm({
      title: 'Delete Candidate Account?',
      content: 'This will permanently delete your candidate account and all interview history.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await candidateService.deleteProfile();
          message.success("Profile deleted");
          window.location.href = '/';
        } catch (err) {
          message.error("Failed to delete profile");
        }
      }
    });
  };

  const onChangePassword = async (values) => {
    setPassLoading(true);
    try {
      await candidateService.changePassword(values.new_password);
      message.success("Password changed successfully!");
      form.resetFields();
    } catch (err) {
      message.error("Failed to change password");
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12"><Spin size="large" tip="Loading Candidate Profile..." /></div>;
  }

  const candidate = profileData?.candidate || {};
  const profileJson = candidate.profile_jsonb || {};
  const skills = profileJson.skills || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {/* Profile Overview Card */}
      <Card title={<span className="text-xl font-bold text-gray-800">Candidate Information</span>} className="shadow-md rounded-lg">
        <div className="space-y-4">
          <div>
            <span className="text-gray-500 font-medium">Email: </span>
            <span className="font-semibold text-gray-800">{profileData?.email}</span>
          </div>

          <div>
            <span className="text-gray-500 font-medium">Resume File: </span>
            {candidate.resume_path ? (
              <span className="text-indigo-600 font-medium inline-flex items-center gap-1">
                <FileTextOutlined /> {candidate.resume_path}
              </span>
            ) : (
              <span className="text-amber-600 font-medium">No resume uploaded yet</span>
            )}
          </div>

          {/* Parsed Profile Info */}
          {profileJson.name && (
            <div>
              <span className="text-gray-500 font-medium">Parsed Name: </span>
              <span className="font-semibold text-gray-800">{profileJson.name}</span>
            </div>
          )}

          {profileJson.summary && (
            <div>
              <span className="text-gray-500 font-medium">Summary: </span>
              <p className="text-gray-700 bg-gray-50 p-3 rounded mt-1">{profileJson.summary}</p>
            </div>
          )}

          {/* Skills Display */}
          {(skills.languages?.length > 0 || skills.frameworks?.length > 0) && (
            <div>
              <span className="text-gray-500 font-medium block mb-2">Parsed Skills:</span>
              <div className="flex flex-wrap gap-2">
                {skills.languages?.map((s, idx) => <Tag color="blue" key={idx}>{s}</Tag>)}
                {skills.frameworks?.map((s, idx) => <Tag color="purple" key={idx}>{s}</Tag>)}
                {skills.databases?.map((s, idx) => <Tag color="green" key={idx}>{s}</Tag>)}
                {skills.tools?.map((s, idx) => <Tag color="orange" key={idx}>{s}</Tag>)}
              </div>
            </div>
          )}
        </div>

        <Divider />

        {/* Upload Resume Section */}
        <div className="flex items-center gap-4">
          <Upload
            beforeUpload={(file) => {
              handleUpload({ file });
              return false;
            }}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />} loading={uploading} type="primary">
              Upload Resume (PDF/TXT)
            </Button>
          </Upload>
        </div>
      </Card>

      {/* Change Password Card */}
      <Card title={<span className="text-lg font-bold text-gray-800 flex items-center gap-2"><LockOutlined /> Change Password</span>} className="shadow-md rounded-lg">
        <Form form={form} layout="vertical" onFinish={onChangePassword} className="max-w-md">
          <Form.Item
            label="New Password"
            name="new_password"
            rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}
          >
            <Input.Password placeholder="Enter new password" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={passLoading}>
            Update Password
          </Button>
        </Form>
      </Card>

      {/* Delete Account Card */}
      <Card className="shadow-md rounded-lg border-red-200">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-red-600">Delete Profile</h4>
            <p className="text-sm text-gray-500">Permanently remove your candidate profile and all interview history.</p>
          </div>
          <Button danger icon={<DeleteOutlined />} onClick={handleDeleteProfile}>
            Delete Profile
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CandidateDataComponent;