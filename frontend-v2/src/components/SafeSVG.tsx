'use client';

import React from 'react';

interface SafeSVGProps {
    svg: string;
    className?: string;
    alt?: string;
}

/**
 * Render SVG yang aman (disanitasi).
 * - Buang tag <script>, <foreignObject>, <iframe>, <object>, <embed>, <link>
 * - Buang atribut event handler (on*) dan href/xlink:href javascript:
 * - Buang tag <style> yang bisa menyisipkan CSS berbahaya
 */
function sanitizeSVG(raw: string): string {
    let svg = raw || '';

    // Buang blok <script>...</script> dan <style>...</style>
    svg = svg.replace(/<script[\s\S]*?<\/script>/gi, '');
    svg = svg.replace(/<style[\s\S]*?<\/style>/gi, '');
    svg = svg.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '');
    svg = svg.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
    svg = svg.replace(/<object[\s\S]*?<\/object>/gi, '');
    svg = svg.replace(/<embed[\s\S]*?>/gi, '');
    svg = svg.replace(/<link[\s\S]*?>/gi, '');
    svg = svg.replace(/<meta[\s\S]*?>/gi, '');
    svg = svg.replace(/<form[\s\S]*?<\/form>/gi, '');
    svg = svg.replace(/<input[\s\S]*?>/gi, '');
    svg = svg.replace(/<button[\s\S]*?<\/button>/gi, '');
    svg = svg.replace(/<a[\s\S]*?<\/a>/gi, '');

    // Buang event handler attributes (onclick, onerror, dll)
    svg = svg.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

    // Buang javascript: URL di href / xlink:href
    svg = svg.replace(/\s(?:href|xlink:href)\s*=\s*"(?:javascript|data:text\/html)[^"]*"/gi, '');
    svg = svg.replace(/\s(?:href|xlink:href)\s*=\s*'(?:javascript|data:text\/html)[^']*'/gi, '');

    // Buang atribut lain yang berbahaya
    svg = svg.replace(/\s(?:srcdoc|formaction|autofocus)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

    return svg.trim();
}

export default function SafeSVG({ svg, className, alt }: SafeSVGProps) {
    const clean = React.useMemo(() => sanitizeSVG(svg), [svg]);

    if (!clean) return null;

    // Pastikan punya atribut viewBox supaya bisa responsif (tambah kalau tidak ada)
    let finalSvg = clean;
    if (!finalSvg.includes('viewBox')) {
        finalSvg = finalSvg.replace(/^<svg/, '<svg viewBox="0 0 200 150"');
    }
    if (!finalSvg.includes('role=')) {
        finalSvg = finalSvg.replace(/^<svg/, `<svg role="img" aria-label="${alt || 'diagram'}"`);
    }

    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: finalSvg }}
        />
    );
}
