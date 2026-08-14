"use client";

import React, { useState } from 'react';

interface PasswordInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    inputClassName?: string;
    required?: boolean;
    id?: string;
    name?: string;
}

export default function PasswordInput({
    value,
    onChange,
    placeholder,
    inputClassName = '',
    required,
    id,
    name,
}: PasswordInputProps) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative w-full">
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                id={id}
                name={name}
                className={`${inputClassName} pr-12`}
            />
            <button
                type="button"
                onClick={() => setShow(s => !s)}
                tabIndex={-1}
                aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer hover:bg-gray-100/60 transition-colors text-[#64748b]"
            >
                <span className="material-symbols-outlined text-xl leading-none">
                    {show ? 'visibility_off' : 'visibility'}
                </span>
            </button>
        </div>
    );
}
