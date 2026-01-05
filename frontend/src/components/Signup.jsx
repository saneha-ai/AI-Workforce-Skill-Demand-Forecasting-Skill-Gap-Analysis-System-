import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormInput from './FormInput';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phone: '',
        signup_password: '',  // renamed to avoid autofill clashes if any
        skill_category: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Prepare payload (field mapping)
        const payload = {
            fullname: formData.fullname,
            email: formData.email,
            phone: formData.phone,
            password: formData.signup_password,
            skill_category: formData.skill_category
        };

        try {
            const response = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:8006') + '/auth/signup', payload);
            const { access_token, user } = response.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-8">
            <div className="max-w-md w-full glass-panel p-8">
                <h2 className="text-3xl font-bold text-center mb-6 gradient-text">Create Account</h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <FormInput
                        label="Full Name"
                        type="text"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleChange}
                        placeholder="John Doe"
                    />
                    <FormInput
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                    />
                    <FormInput
                        label="Phone Number"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 234 567 890"
                        required={false}
                    />
                    <FormInput
                        label="Skill Category (Optional)"
                        type="text"
                        name="skill_category"
                        value={formData.skill_category}
                        onChange={handleChange}
                        placeholder="e.g. Developer, Designer"
                        required={false}
                    />
                    <FormInput
                        label="Password"
                        type="password"
                        name="signup_password"
                        value={formData.signup_password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors mt-2 disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-400 text-sm">
                    Already have an account? <a href="/login" className="text-blue-400 hover:text-blue-300">Login</a>
                </p>
                <div className="mt-4 text-center text-xs text-gray-500 font-mono">
                    DEBUG: API_URL = {String(import.meta.env.VITE_API_URL)}
                </div>
            </div>
        </div>
    );
};

export default Signup;
