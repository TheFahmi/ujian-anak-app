import React from 'react';

/**
 * Simple markdown-like formatter for chat messages
 * Supports: **bold**, *italic*, `code`, and line breaks
 */

interface FormattedPart {
  type: 'text' | 'bold' | 'italic' | 'code' | 'bolditalic';
  content: string;
}

export const parseMarkdown = (text: string): FormattedPart[] => {
  const parts: FormattedPart[] = [];
  let remaining = text;

  // Regex patterns for markdown
  const patterns = [
    { regex: /\*\*\*(.*?)\*\*\*/g, type: 'bolditalic' as const },
    { regex: /\*\*(.*?)\*\*/g, type: 'bold' as const },
    { regex: /\*(.*?)\*/g, type: 'italic' as const },
    { regex: /`(.*?)`/g, type: 'code' as const },
  ];

  // Combined regex to find all matches
  const combinedRegex = /(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  
  let lastIndex = 0;
  let match;

  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      });
    }

    const matchedText = match[0];
    
    // Determine type and extract content
    if (matchedText.startsWith('***') && matchedText.endsWith('***')) {
      parts.push({
        type: 'bolditalic',
        content: matchedText.slice(3, -3)
      });
    } else if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
      parts.push({
        type: 'bold',
        content: matchedText.slice(2, -2)
      });
    } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
      parts.push({
        type: 'italic',
        content: matchedText.slice(1, -1)
      });
    } else if (matchedText.startsWith('`') && matchedText.endsWith('`')) {
      parts.push({
        type: 'code',
        content: matchedText.slice(1, -1)
      });
    }

    lastIndex = match.index + matchedText.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex)
    });
  }

  // If no matches found, return original text
  if (parts.length === 0) {
    parts.push({ type: 'text', content: text });
  }

  return parts;
};

interface FormattedMessageProps {
  content: string;
  className?: string;
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content, className = '' }) => {
  // Split by newlines first
  const lines = content.split('\n');

  return (
    <span className={className}>
      {lines.map((line, lineIndex) => (
        <React.Fragment key={lineIndex}>
          {lineIndex > 0 && <br />}
          {parseMarkdown(line).map((part, partIndex) => {
            switch (part.type) {
              case 'bold':
                return (
                  <strong key={partIndex} className="font-bold">
                    {part.content}
                  </strong>
                );
              case 'italic':
                return (
                  <em key={partIndex} className="italic">
                    {part.content}
                  </em>
                );
              case 'bolditalic':
                return (
                  <strong key={partIndex} className="font-bold italic">
                    {part.content}
                  </strong>
                );
              case 'code':
                return (
                  <code
                    key={partIndex}
                    className="bg-gray-100 text-[#e11d48] px-1.5 py-0.5 rounded text-xs font-mono"
                  >
                    {part.content}
                  </code>
                );
              default:
                return <span key={partIndex}>{part.content}</span>;
            }
          })}
        </React.Fragment>
      ))}
    </span>
  );
};

export default FormattedMessage;
