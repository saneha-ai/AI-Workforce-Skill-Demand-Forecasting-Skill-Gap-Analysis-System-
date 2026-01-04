import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const Hero = () => {
    return (
        <div className="text-center space-y-6 pt-12 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                <Sparkles size={12} />
                <span>Powered by Real-Time Data Analysis</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Master Your <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400">
                    Career Path
                </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Upload your resume to get instant job role matches, skill gap analysis, and a personalized learning roadmap based on real industry data.
            </p>

            <div className="flex justify-center gap-4 pt-4">
                <a
                    href="#upload"
                    className="group px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                >
                    Start Analysis <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <button className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-medium transition-all">
                    View Demo
                </button>
            </div>
        </div>
    );
};

export default Hero;
