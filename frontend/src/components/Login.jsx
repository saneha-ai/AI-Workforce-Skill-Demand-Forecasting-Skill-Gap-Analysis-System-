import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormInput from './FormInput';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:8006') + '/auth/login', formData);
            const { access_token, user } = response.data;

            // Store Session
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));

            navigate('/dashboard'); // Go to main app
        } catch (err) {
            setError(err.response?.data?.detail || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <div className="max-w-md w-full glass-panel p-8">
                <h2 className="text-3xl font-bold text-center mb-6 gradient-text">Welcome Back</h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <FormInput
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                    />
                    <FormInput
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors mt-2 disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-400 text-sm">
                    Don't have an account? <a href="/signup" className="text-blue-400 hover:text-blue-300">Sign Up</a>
                </p>
                <div className="mt-4 text-center text-xs text-gray-500 font-mono">
                    DEBUG: API_URL = {String(import.meta.env.VITE_API_URL)}
                </div>
            </div>
        </div>
    );
};

export default Login;
