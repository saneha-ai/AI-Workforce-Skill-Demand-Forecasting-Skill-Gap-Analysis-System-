import React, { useState } from 'react';
import { Activity, ShieldCheck, AlertTriangle, Zap, Server } from 'lucide-react';
import axios from 'axios';

const DriftDashboard = ({ userContext }) => {
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [result, setResult] = useState(null);
    const [simType, setSimType] = useState(null);

    const simulate = async (type) => {
        setStatus('loading');
        setSimType(type);
        setResult(null);

        let payload = {};
        if (type === 'normal') {
            payload = {
                skills_batch: [
                    ["python", "data analysis", "sql", "machine learning"],
                    ["java", "software engineering", "react", "node.js"],
                    ["project management", "agile", "communication"],
                    ["python", "pandas", "numpy", "scikit-learn"]
                ]
            };
        } else if (type === 'user' && userContext) {
            // Use user's uploaded skills repeated to form a batch
            const userSkills = userContext.extracted_skills || ["python", "generic"];
            payload = {
                skills_batch: [
                    userSkills,
                    userSkills,
                    userSkills,
                    userSkills
                ]
            };
        } else {
            // Drifting data (Cooking/Medical domain)
            payload = {
                skills_batch: [
                    ["surgery", "patient care", "anatomy", "medicine"],
                    ["cooking", "chef", "culinary arts", "food safety"],
                    ["painting", "art", "sculpture", "history"],
                    ["farming", "agriculture", "soil", "crops"]
                ]
            };
        }

        try {
            const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8006').replace(/\/$/, '');
            const res = await axios.post(`${apiUrl}/debug_drift`, payload);
            setResult(res.data);
            setStatus('success');
        } catch (e) {
            console.error("Drift check failed", e);
            setStatus('error');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold gradient-text pb-2">MLOps Observability Hub</h1>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Monitor your AI model's health in real-time. Detect "Data Drift" when incoming resumes
                    deviate significantly from the training distribution.
                </p>
            </div>

            {/* Status Monitor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metric 1 */}
                <div className="glass-panel p-6 flex flex-col items-center text-center">
                    <div className="p-3 bg-blue-500/10 rounded-full text-blue-400 mb-4">
                        <Activity size={32} />
                    </div>
                    <div className="text-slate-400 text-sm">Model Status</div>
                    <div className="text-2xl font-bold text-white mt-1">Active</div>
                    <div className="text-emerald-400 text-xs mt-2 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Operational
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="glass-panel p-6 flex flex-col items-center text-center">
                    <div className="p-3 bg-purple-500/10 rounded-full text-purple-400 mb-4">
                        <Server size={32} />
                    </div>
                    <div className="text-slate-400 text-sm">Drift Monitor</div>
                    <div className="text-2xl font-bold text-white mt-1">KS Test</div>
                    <div className="text-slate-500 text-xs mt-2">p-value threshold: 0.05</div>
                </div>

                {/* Metric 3: Live Result */}
                <div className={`glass-panel p-6 flex flex-col items-center text-center border-2 transition-colors duration-500 ${status === 'success' && result?.is_drift ? 'border-red-500/50 bg-red-500/5' :
                    status === 'success' && !result?.is_drift ? 'border-emerald-500/50 bg-emerald-500/5' :
                        'border-transparent'
                    }`}>
                    {status === 'loading' ? (
                        <div className="animate-spin text-slate-400 my-auto"><Zap size={32} /></div>
                    ) : status === 'success' ? (
                        <>
                            <div className={`p-3 rounded-full mb-4 ${result.is_drift ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                {result.is_drift ? <AlertTriangle size={32} /> : <ShieldCheck size={32} />}
                            </div>
                            <div className="text-slate-400 text-sm">Current State</div>
                            <div className={`text-2xl font-bold mt-1 ${result.is_drift ? 'text-red-400' : 'text-emerald-400'}`}>
                                {result.is_drift ? 'Drift Detected' : 'Distribution Stable'}
                            </div>
                            <div className="text-xs text-slate-500 mt-2 font-mono">
                                p-val: {result.p_value_avg.toFixed(5)}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="p-3 bg-slate-700/50 rounded-full text-slate-500 mb-4">
                                <Activity size={32} />
                            </div>
                            <div className="text-slate-400 text-sm">Last Check</div>
                            <div className="text-2xl font-bold text-slate-600 mt-1">Waiting...</div>
                        </>
                    )}
                </div>
            </div>

            {/* Simulation Controls */}
            <div className="max-w-4xl mx-auto">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Zap className="text-yellow-400" />
                    Drift Simulation Lab
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Normal Traffic */}
                    <button
                        onClick={() => simulate('normal')}
                        disabled={status === 'loading'}
                        className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-emerald-500/50 transition-all text-left"
                    >
                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-emerald-400 mb-2">Simulate Normal Traffic</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Send a batch of resumes containing relevant tech skills (Python, Java, etc.).
                                <br /><span className="text-slate-500 italic">Expected: No Drift</span>
                            </p>
                            <div className="flex flex-wrap gap-2 opacity-50">
                                <span className="px-2 py-1 bg-slate-800 rounded text-xs">python</span>
                                <span className="px-2 py-1 bg-slate-800 rounded text-xs">react</span>
                            </div>
                        </div>
                    </button>

                    {/* Attack Traffic */}
                    <button
                        onClick={() => simulate('drift')}
                        disabled={status === 'loading'}
                        className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-red-500/50 transition-all text-left"
                    >
                        <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-red-400 mb-2">Simulate Out-of-Domain Data</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Send a batch of resumes from completely different domains (Medical, Culinary, Arts).
                                <br /><span className="text-slate-500 italic">Expected: Drift Alert</span>
                            </p>
                            <div className="flex flex-wrap gap-2 opacity-50">
                                <span className="px-2 py-1 bg-slate-800 rounded text-xs">surgery</span>
                                <span className="px-2 py-1 bg-slate-800 rounded text-xs">cooking</span>
                            </div>
                        </div>
                    </button>

                    {/* User Resume Check */}
                    <button
                        onClick={() => simulate('user')}
                        disabled={status === 'loading' || !userContext}
                        className={`group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 transition-all text-left ${userContext ? 'hover:border-blue-500/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                    >
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-blue-400 mb-2">Check My Resume</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Use the skills extracted from your uploaded resume to test for drift.
                                <br /><span className="text-slate-500 italic">
                                    {userContext ? 'Ready to analyze' : '(Upload resume first)'}
                                </span>
                            </p>
                            {userContext && (
                                <div className="flex flex-wrap gap-2 opacity-50 max-h-16 overflow-hidden">
                                    {userContext.extracted_skills.slice(0, 3).map((skill, i) => (
                                        <span key={i} className="px-2 py-1 bg-slate-800 rounded text-xs">{skill}</span>
                                    ))}
                                    {userContext.extracted_skills.length > 3 && <span className="text-xs self-center">...</span>}
                                </div>
                            )}
                        </div>
                    </button>
                </div>
            </div>

            {/* Logs/Console Output */}
            {result && (
                <div className="max-w-4xl mx-auto glass-panel p-6 font-mono text-sm">
                    <div className="text-slate-500 mb-2 border-b border-white/5 pb-2">System Log</div>
                    <div className="space-y-1">
                        <div className="flex gap-4">
                            <span className="text-slate-600">{new Date().toLocaleTimeString()}</span>
                            <span className="text-blue-400">[INFO]</span>
                            <span>Received batch of {result.p_value_avg ? '4' : '0'} vectors.</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-slate-600">{new Date().toLocaleTimeString()}</span>
                            <span className="text-purple-400">[ALIBI]</span>
                            <span>Running Kolmogorov-Smirnov test on valid features...</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-slate-600">{new Date().toLocaleTimeString()}</span>
                            <span className={result.is_drift ? "text-red-400" : "text-emerald-400"}>
                                [{result.is_drift ? 'ALERT' : 'SUCCESS'}]
                            </span>
                            <span>{result.message} (Avg P-Value: {result.p_value_avg.toFixed(6)})</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriftDashboard;
