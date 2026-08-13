'use client';

import React from 'react';
import DOMPurify from 'dompurify';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import MathText from '@/components/MathText';

interface RichTextProps {
    html: string;
    className?: string;
}

/**
 * Render HTML aman (DOMPurify) + render rumus $...$ (KaTeX) + gambar.
 * Dipakai untuk konten WYSIWYG (TipTap) di soal & jawaban.
 * Fallback ke teks biasa kalau input bukan HTML.
 */
export default function RichText({ html, className }: RichTextProps) {
    const rendered = React.useMemo(() => {
        if (!html) return '';

        // Render KaTeX dulu (sebelum sanitasi, karena KaTeX output HTML valid)
        let content = html;
        // Inline math $...$ (hindari $$ double)
        content = content.replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => {
            try {
                return katex.renderToString(m.trim(), { displayMode: true, throwOnError: false });
            } catch { return _; }
        });
        content = content.replace(/\$([^$\n]+?)\$/g, (_, m) => {
            try {
                return katex.renderToString(m.trim(), { displayMode: false, throwOnError: false });
            } catch { return _; }
        });

        // Sanitasi
        const clean = DOMPurify.sanitize(content, {
            ADD_TAGS: ['math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'mfrac', 'msqrt', 'mroot', 'msub', 'msup', 'msubsup'],
            ADD_ATTR: ['xmlns', 'viewBox', 'aria-hidden', 'style'],
            ALLOWED_URI_REGEXP: /^(?:https?:|data:image\/|blob:|mailto:|tel:)/i,
        });

        return clean;
    }, [html]);

    if (!rendered) return null;

    return (
        <div
            className={`richtext ${className || ''}`}
            dangerouslySetInnerHTML={{ __html: rendered }}
        />
    );
}

/**
 * Deteksi apakah teks adalah HTML (dari WYSIWYG) atau teks biasa.
 * Teks biasa (soal lama) → dirender polos (aman).
 */
export function isHtml(text?: string | null): boolean {
    if (!text) return false;
    const t = text.trim();
    if (!t) return false;
    return /<[a-z][\s\S]*>/i.test(t) && !t.startsWith('\\') && !t.startsWith('$');
}

/**
 * Render cerdas: HTML (WYSIWYG) → RichText; teks biasa/LaTeX → MathText.
 * Dipakai di soal, pilihan, penjelasan di semua halaman.
 */
export function SmartText({ text, diagramSvg, diagramAlt, className }: {
    text?: string | null;
    diagramSvg?: string | null;
    diagramAlt?: string;
    className?: string;
}) {
    if (isHtml(text)) {
        return <RichText html={text || ''} className={className} />;
    }
    return <MathText text={text || ''} diagramSvg={diagramSvg || undefined} diagramAlt={diagramAlt} className={className} />;
}
