import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Target, CheckCircle, AlertTriangle, BookOpen, Building, BrainCircuit, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import ExplanationModal from './ExplanationModal';

const JobDashboard = ({ data }) => {
    const { matches, extracted_skills } = data;
    const [report, setReport] = useState(null);
    const [loadingReport, setLoadingReport] = useState(false);

    // Explanation State
    const [explanationData, setExplanationData] = useState(null);
    const [explainingJob, setExplainingJob] = useState(null); // stores job_role being explained

    const handleExplain = async (jobRole) => {
        setExplainingJob(jobRole);
        try {
            const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8006').replace(/\/$/, '');
            const res = await axios.post(`${apiUrl}/explain_match`, {
                skills: extracted_skills,
                job_role: jobRole
            });
            setExplanationData(res.data);
        } catch (e) {
            console.error("Explanation failed", e);
            alert("Could not load explanation. Ensure backend is running.");
        } finally {
            setExplainingJob(null);
        }
    };

    useEffect(() => {
        // Fetch Company Report on Mount
        const fetchReport = async () => {
            setLoadingReport(true);
            try {
                const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8006').replace(/\/$/, '');
                const res = await axios.post(`${apiUrl}/generate_report`, {
                    skills: extracted_skills,
                    matches: matches
                });
                setReport(res.data.report);
            } catch (e) {
                console.error("Report generation failed", e);
                setReport("error");
            } finally {
                setLoadingReport(false);
            }
        };
        fetchReport();
    }, [data]);

    const chartData = matches.map(job => ({
        name: job.job_role.split(' ')[0], // Short name
        score: job.match_score,
        fullRole: job.job_role
    }));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel p-6">
                    <div className="text-slate-400 text-sm mb-1">Top Match</div>
                    <div className="text-2xl font-bold gradient-text">{matches[0]?.job_role || 'N/A'}</div>
                    <div className="text-sm text-emerald-400 mt-2">{matches[0]?.match_score}% Match</div>
                </div>
                <div className="glass-panel p-6">
                    <div className="text-slate-400 text-sm mb-1">Skills Detected</div>
                    <div className="text-2xl font-bold text-white">{extracted_skills.length}</div>
                    <div className="text-sm text-blue-400 mt-2">Verified from dataset</div>
                </div>

            </div>


            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col: Job List & Chart */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-panel p-6">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Target className="text-blue-400" size={20} />
                            Top Job Matches
                        </h2>
                        <div className="h-64 mb-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#3B82F6'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-4">
                            {matches.map((job, idx) => (
                                <div key={idx} className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium text-lg">{job.job_role}</h3>
                                                <button
                                                    onClick={() => handleExplain(job.job_role)}
                                                    disabled={explainingJob === job.job_role}
                                                    className="p-1.5 rounded-full bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
                                                    title="Explain this match"
                                                >
                                                    {explainingJob === job.job_role ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <BrainCircuit size={16} />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-emerald-400 font-medium text-sm">{job.company}</p>
                                            <p className="text-slate-400 text-xs mt-1">{job.domain} • {job.min_experience}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${idx === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {job.match_score}%
                                        </div>
                                    </div>

                                    {/* Missing Skills Section in Job Card */}
                                    {job.missing_skills.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-white/5">
                                            <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Skill Gaps to Close</div>
                                            <div className="flex flex-wrap gap-2">
                                                {job.missing_skills.slice(0, 5).map((skill, i) => (
                                                    <span key={i} className="px-2 py-1 bg-red-500/10 text-red-300 text-xs rounded border border-red-500/10">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {job.missing_skills.length > 5 && (
                                                    <span className="text-xs text-slate-500 self-center">+{job.missing_skills.length - 5} more</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Col: Extracted Skills & Mentor */}
                <div className="space-y-8">
                    <div className="glass-panel p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <CheckCircle className="text-emerald-400" size={20} />
                            Your Skills
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {extracted_skills.map((skill, i) => (
                                <span key={i} className="px-3 py-1 bg-white/10 text-slate-200 text-sm rounded-full border border-white/5">
                                    {skill}
                                </span>
                            ))}
                            {extracted_skills.length === 0 && (
                                <p className="text-slate-500 italic">No skills detected. Try a more detailed resume.</p>
                            )}
                        </div>
                    </div>

                    {/* Recommended Learning Path (Static/Mock based on top missing) */}
                    {matches[0] && matches[0].missing_skills.length > 0 && (
                        <div className="glass-panel p-6 border-l-4 border-l-yellow-500">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <BookOpen className="text-yellow-400" size={20} />
                                Recommended Next Step
                            </h2>
                            <p className="text-slate-300 text-sm mb-4">
                                To improve your chances for <strong>{matches[0].job_role}</strong>, prioritize learning:
                            </p>
                            <ul className="space-y-2">
                                {matches[0].missing_skills.slice(0, 3).map((skill, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                        <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-xs">
                                            {i + 1}
                                        </span>
                                        Learn {skill}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            {/* Company Recommendation Report */}
            <div className="glass-panel p-8 mt-8">
                <h3 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-2">
                    <Building size={24} /> Career Strategy & Company Recommendations
                </h3>
                {loadingReport ? (
                    <div className="text-slate-400 animate-pulse">Generating personalized strategy...</div>
                ) : report === "error" ? (
                    <div className="text-red-400 bg-red-500/10 p-4 rounded border border-red-500/20">
                        <h4 className="font-bold flex items-center gap-2"><AlertTriangle size={16} /> Report Generation Failed</h4>
                        <p className="text-sm mt-1">Unable to connect to the recommendation server. Please try again later.</p>
                    </div>
                ) : (
                    <div className="prose prose-invert max-w-none prose-headings:text-emerald-400 prose-p:text-slate-300 prose-li:text-slate-300">
                        <ReactMarkdown>{report}</ReactMarkdown>
                    </div>
                )}
            </div>
            {/* Explanation Modal */}
            {explanationData && (
                <ExplanationModal
                    jobRole={explanationData.job_role}
                    explanation={explanationData.explanation}
                    onClose={() => setExplanationData(null)}
                />
            )}
        </div>
    );
};

export default JobDashboard;
