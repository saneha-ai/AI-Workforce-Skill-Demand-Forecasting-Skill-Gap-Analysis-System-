import React from 'react';

const FormInput = ({ label, type, name, value, onChange, placeholder, required = true }) => (
    <div className="mb-4">
        <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor={name}>
            {label}
        </label>
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full bg-slate-800 text-white border border-slate-600 rounded py-2 px-3 focus:outline-none focus:border-blue-500 transition-colors"
        />
    </div>
);

export default FormInput;
