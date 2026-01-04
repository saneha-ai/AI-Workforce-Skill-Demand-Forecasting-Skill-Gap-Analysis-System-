import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ResumeUpload from './components/ResumeUpload';
import JobDashboard from './components/JobDashboard';
import ChatInterface from './components/ChatInterface';
import Login from './components/Login';
import Signup from './components/Signup';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// Main Layout (Navbar + Content)
const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen relative z-10">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>
            <footer className="py-8 text-center text-slate-500 text-sm">
                <p>© 2024 AI Career Mentor. Powered by Real Job Data.</p>
            </footer>
        </div>
    );
};

// Application Home (Dashboard)
const MainApp = () => {
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAnalysisComplete = (data) => {
        setAnalysisResult(data);
        setTimeout(() => {
            document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <div className="space-y-24">
            <section id="home">
                <Hero />
            </section>

            <section id="upload" className="max-w-4xl mx-auto">
                <ResumeUpload onAnalysisComplete={handleAnalysisComplete} setLoading={setLoading} />
            </section>

            {analysisResult && (
                <section id="dashboard">
                    <JobDashboard data={analysisResult} />
                </section>
            )}

            <ChatInterface context={analysisResult} />
        </div>
    );
};

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30">
                {/* Background Effects */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[128px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[128px]"></div>
                </div>

                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Protected Routes inside Layout */}
                    <Route path="/" element={
                        <Navigate to="/dashboard" />
                    } />

                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Layout>
                                <MainApp />
                            </Layout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
