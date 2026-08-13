'use client';

import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
    text: string;
    className?: string;
}

/**
 * Render teks dengan dukungan rumus matematika.
 * Mendukung delimiter:
 *   - \( ... \)  -> inline math (KaTeX)
 *   - \[ ... \]  -> display math (block)
 *   - $...$      -> inline math (KaTeX)
 *   - $$...$$    -> display math (block)
 * Teks biasa tanpa delimiter dirender apa adanya.
 */
export default function MathText({ text, className }: MathTextProps) {
    const parts = React.useMemo(() => {
        if (!text) return [{ type: 'text' as const, content: '' }];

        // Regex untuk menangkap math: $$...$$, \[...\], \(...\), $...$
        // Urutan penting: $$ dulu (jangan ketuker dengan $)
        const regex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+?\$)/g;
        const result: Array<{ type: 'text' | 'math'; content: string }> = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                result.push({ type: 'text', content: text.slice(lastIndex, match.index) });
            }
            result.push({ type: 'math', content: match[0] });
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) {
            result.push({ type: 'text', content: text.slice(lastIndex) });
        }
        return result;
    }, [text]);

    return (
        <span className={className}>
            {parts.map((part, i) => {
                if (part.type === 'text') {
                    return <React.Fragment key={i}>{part.content}</React.Fragment>;
                }

                // Math: strip delimiters
                let mathContent = part.content;
                let displayMode = false;
                if (mathContent.startsWith('$$') && mathContent.endsWith('$$')) {
                    mathContent = mathContent.slice(2, -2);
                    displayMode = true;
                } else if (mathContent.startsWith('\\[') && mathContent.endsWith('\\]')) {
                    mathContent = mathContent.slice(2, -2);
                    displayMode = true;
                } else if (mathContent.startsWith('\\(') && mathContent.endsWith('\\)')) {
                    mathContent = mathContent.slice(2, -2);
                } else if (mathContent.startsWith('$') && mathContent.endsWith('$')) {
                    mathContent = mathContent.slice(1, -1);
                }

                try {
                    const html = katex.renderToString(mathContent, {
                        displayMode,
                        throwOnError: false,
                        output: 'html',
                    });
                    return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
                } catch (e) {
                    console.error('KaTeX render error:', e);
                    return <React.Fragment key={i}>{part.content}</React.Fragment>;
                }
            })}
        </span>
    );
}
