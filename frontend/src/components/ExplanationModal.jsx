import React from 'react';
import { X, BrainCircuit } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ExplanationModal = ({ jobRole, explanation, baseValue, onClose }) => {
    // explanation is array of { feature: string, value: number }
    // Sort just in case
    const sortedData = [...explanation].sort((a, b) => b.value - a.value).slice(0, 10);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                            <BrainCircuit className="text-purple-400" />
                            Why this Match?
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Key factors contributing to the match with <span className="text-emerald-400">{jobRole}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    <div className="h-[300px] w-full mb-6 relative">
                        {/* Axis Labels Hint */}
                        <div className="absolute top-0 right-0 text-xs text-slate-500">Importance Score</div>

                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sortedData} layout="vertical" margin={{ left: 0, right: 30, top: 10, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="feature"
                                    type="category"
                                    width={100}
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 13, fill: '#cbd5e1' }}
                                    interval={0}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                                    formatter={(value) => [value.toFixed(4), "Importance"]}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {sortedData.map((entry, index) => (
                                        <Cell key={index} fill={index < 3 ? '#a78bfa' : '#475569'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <p className="text-sm text-slate-400 mb-4">
                        The AI found strong overlap between your resume and this job description for these specific skills.
                        Higher values indicate a stronger contribution to the final match score.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        {sortedData.slice(0, 4).map((item, idx) => (
                            <div key={idx} className="p-3 bg-white/5 rounded border border-white/5 flex justify-between items-center">
                                <span className="font-medium text-slate-200 capitalize">{item.feature}</span>
                                <span className="text-purple-400 font-bold text-sm">+{item.value.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExplanationModal;
