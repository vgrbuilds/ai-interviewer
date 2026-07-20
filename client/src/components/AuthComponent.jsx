import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tabs, Form, Input, Button, message } from 'antd';
import { authService } from '../services/auth-service';

export const AuthComponent = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onLogin = async (values) => {
    setLoading(true);
    try {
      await authService.signin(values.email, values.password);
      message.success("Logged in successfully!");
      navigate('/home');
    } catch (err) {
      message.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (values) => {
    setLoading(true);
    try {
      await authService.signup(values.email, values.password);
      message.success("Signup successful! Welcome aboard.");
      navigate('/home');
    } catch (err) {
      message.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'login',
      label: 'Sign In',
      children: (
        <Form layout="vertical" onFinish={onLogin}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please enter your email', type: 'email' }]}
          >
            <Input placeholder="candidate@example.com" size="large" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password placeholder="••••••••" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Sign In
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'signup',
      label: 'Sign Up',
      children: (
        <Form layout="vertical" onFinish={onSignup}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please enter your email', type: 'email' }]}
          >
            <Input placeholder="candidate@example.com" size="large" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}
          >
            <Input.Password placeholder="••••••••" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Create Account
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-t-4 border-indigo-500 rounded-lg">
      <Tabs defaultActiveKey="login" items={tabItems} centered />
    </Card>
  );
};

export default AuthComponent;
