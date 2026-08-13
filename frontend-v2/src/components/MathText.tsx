'use client';

import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import SafeSVG from '@/components/SafeSVG';

interface MathTextProps {
    text: string;
    className?: string;
    /** Render diagram SVG (dari AI generator / manual admin) */
    diagramSvg?: string;
    /** Alt text untuk diagram */
    diagramAlt?: string;
}

/**
 * Render teks dengan dukungan:
 * 1. Rumus matematika (KaTeX):
 *    - \( ... \)  -> inline math
 *    - \[ ... \]  -> display math (block)
 *    - $...$      -> inline math
 *    - $$...$$    -> display math (block)
 * 2. Gambar markdown: ![alt](https://...)
 * 3. Diagram SVG via prop diagramSvg (disanitasi)
 * Teks biasa tanpa delimiter dirender apa adanya.
 */
export default function MathText({ text, className, diagramSvg, diagramAlt }: MathTextProps) {
    const parts = React.useMemo(() => {
        if (!text) return [{ type: 'text' as const, content: '' }];

        // Split jadi: math blocks, image markdown, teks biasa
        // Urutan: $$, \[ \], \( \), $, ![alt](url)
        const regex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)|\$[^$\n]+?\$)/g;
        const result: Array<{ type: 'text' | 'math' | 'image'; content: string; alt?: string; src?: string }> = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                result.push({ type: 'text', content: text.slice(lastIndex, match.index) });
            }
            if (match[0].startsWith('![')) {
                // Image markdown
                result.push({ type: 'image', content: match[0], alt: match[2] || '', src: match[3] || '' });
            } else {
                result.push({ type: 'math', content: match[0] });
            }
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) {
            result.push({ type: 'text', content: text.slice(lastIndex) });
        }
        return result;
    }, [text]);

    return (
        <span className={className}>
            {diagramSvg && (
                <SafeSVG
                    svg={diagramSvg}
                    className="my-2 w-full max-w-[280px] mx-auto"
                    alt={diagramAlt || 'diagram'}
                />
            )}
            {parts.map((part, i) => {
                if (part.type === 'text') {
                    return <React.Fragment key={i}>{part.content}</React.Fragment>;
                }

                if (part.type === 'image') {
                    return (
                        <img
                            key={i}
                            src={part.src}
                            alt={part.alt || ''}
                            className="inline-block max-w-full h-auto my-1 rounded-xl border border-[#e2e8f0]"
                            loading="lazy"
                        />
                    );
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
