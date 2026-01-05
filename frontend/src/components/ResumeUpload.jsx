import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const ResumeUpload = ({ onAnalysisComplete, setLoading }) => {
    const [error, setError] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploadStatus('uploading');
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Direct localhost URL for simplicity in this setup
            const response = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:8006') + '/upload_resume', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setUploadStatus('success');
            setLoading(false);
            onAnalysisComplete(response.data);
        } catch (err) {
            console.error(err);
            setError('Failed to analyze resume. Please ensure the backend is running.');
            setUploadStatus('error');
            setLoading(false);
        }
    }, [onAnalysisComplete, setLoading]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt']
        },
        maxFiles: 1
    });

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`glass-panel p-12 text-center cursor-pointer transition-all border-2 border-dashed
          ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/30'}
          ${uploadStatus === 'error' ? 'border-red-500/50' : ''}
        `}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                        {uploadStatus === 'uploading' ? (
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                        ) : uploadStatus === 'success' ? (
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        ) : uploadStatus === 'error' ? (
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        ) : (
                            <UploadCloud className="w-8 h-8 text-slate-400" />
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">
                            {isDragActive ? "Drop it here!" : "Upload your Resume"}
                        </h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto">
                            Drag & drop your PDF here, or click to browse files.
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2 justify-center">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}
        </div>
    );
};

export default ResumeUpload;
