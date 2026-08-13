'use client';

import React, { useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipTapImage from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

interface WysiwygEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    minHeight?: number;
}

/**
 * WYSIWYG editor (TipTap) untuk soal & jawaban PG.
 * Fitur: tebal, miring, coret, judul, list, quote, kode,
 * sisip rumus $...$ (KaTeX), upload gambar (kompres → data URL).
 */
export default function WysiwygEditor({ value, onChange, placeholder, minHeight = 120 }: WysiwygEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            TipTapImage.configure({ inline: true, allowBase64: true }),
            Placeholder.configure({ placeholder: placeholder || 'Tulis di sini...' }),
        ],
        content: value || '',
        editorProps: {
            attributes: {
                class: 'wysiwyg-content focus:outline-none',
                style: `min-height:${minHeight}px`,
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    const insertMath = () => {
        if (!editor) return;
        const { from } = editor.state.selection;
        editor.chain().focus().insertContent(' $\\frac{1}{2}$ ').run();
    };

    const handleFile = (file: File) => {
        if (!editor || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            // Kompres gambar agar tidak membengkakkan JSON
            const img = new Image();
            img.onload = () => {
                const MAX = 800;
                let w = img.width;
                let h = img.height;
                if (w > MAX) { h = h * MAX / w; w = MAX; }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                ctx.drawImage(img, 0, 0, w, h);
                const compressed = canvas.toDataURL('image/jpeg', 0.75);
                editor.chain().focus().setImage({ src: compressed }).run();
            };
            img.src = result;
        };
        reader.readAsDataURL(file);
    };

    const buttonClass = (active?: boolean) =>
        `px-2 py-1 rounded-md text-sm font-bold border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer ${
            active ? 'bg-[#6c5ce7] text-white border-[#6c5ce7]' : 'bg-white text-gray-700'
        }`;

    return (
        <div className="wysiwyg border-2 border-gray-200 rounded-lg focus-within:border-[#6c5ce7] transition-colors bg-white">
            <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0 z-10">
                <button type="button" className={buttonClass(editor?.isActive('bold'))} onClick={() => editor?.chain().focus().toggleBold().run()} title="Tebal"><b>B</b></button>
                <button type="button" className={buttonClass(editor?.isActive('italic'))} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Miring"><i>I</i></button>
                <button type="button" className={buttonClass(editor?.isActive('strike'))} onClick={() => editor?.chain().focus().toggleStrike().run()} title="Coret"><s>S</s></button>
                <span className="w-px h-5 bg-gray-300 mx-1" />
                <button type="button" className={buttonClass(editor?.isActive('heading', { level: 2 }))} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="Judul">H</button>
                <button type="button" className={buttonClass(editor?.isActive('bulletList'))} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="List">•≡</button>
                <button type="button" className={buttonClass(editor?.isActive('orderedList'))} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="List angka">1≡</button>
                <span className="w-px h-5 bg-gray-300 mx-1" />
                <button type="button" className={buttonClass()} onClick={insertMath} title="Sisip rumus (LaTeX)">
                    <span className="font-serif italic">Σ</span>
                </button>
                <button type="button" className={buttonClass()} onClick={() => fileInputRef.current?.click()} title="Upload gambar">
                    🖼️
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFile(f);
                        e.target.value = '';
                    }}
                />
            </div>
            <EditorContent editor={editor} className="px-3 py-2" />
        </div>
    );
}
