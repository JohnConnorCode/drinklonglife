'use client';

import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { urlFor, getImageDimensions } from '@/lib/image';

// Check if content is Tiptap JSON format
function isTiptapContent(value: any): boolean {
  return value && typeof value === 'object' && value.type === 'doc' && Array.isArray(value.content);
}

// Render Tiptap JSON to HTML
function renderTiptapNode(node: any, key: number = 0): React.ReactNode {
  if (!node) return null;

  // Handle text nodes
  if (node.type === 'text') {
    let text = node.text;

    // Apply marks (bold, italic, etc.)
    if (node.marks && node.marks.length > 0) {
      node.marks.forEach((mark: any) => {
        if (mark.type === 'bold') {
          text = <strong key={key}>{text}</strong>;
        } else if (mark.type === 'italic') {
          text = <em key={key}>{text}</em>;
        } else if (mark.type === 'underline') {
          text = <u key={key}>{text}</u>;
        } else if (mark.type === 'code') {
          text = <code key={key} className="bg-gray-100 px-1 rounded">{text}</code>;
        } else if (mark.type === 'link') {
          text = (
            <a
              key={key}
              href={mark.attrs?.href}
              className="text-accent-primary hover:underline"
              target={mark.attrs?.href?.startsWith('http') ? '_blank' : undefined}
              rel={mark.attrs?.href?.startsWith('http') ? 'noreferrer' : undefined}
            >
              {text}
            </a>
          );
        }
      });
    }

    return text;
  }

  // Handle block nodes
  const children = node.content?.map((child: any, i: number) => renderTiptapNode(child, i)) || [];

  switch (node.type) {
    case 'doc':
      return <>{children}</>;

    case 'paragraph':
      return <p key={key} className="mb-4">{children.length > 0 ? children : <br />}</p>;

    case 'heading':
      const level = node.attrs?.level || 2;
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      const className = level === 1
        ? 'text-3xl font-bold mb-4'
        : level === 2
        ? 'text-2xl font-bold mb-3'
        : 'text-xl font-semibold mb-2';
      return <Tag key={key} className={className}>{children}</Tag>;

    case 'bulletList':
      return <ul key={key} className="list-disc list-inside mb-4 space-y-2">{children}</ul>;

    case 'orderedList':
      return <ol key={key} className="list-decimal list-inside mb-4 space-y-2">{children}</ol>;

    case 'listItem':
      return <li key={key}>{children}</li>;

    case 'blockquote':
      return (
        <blockquote key={key} className="border-l-4 border-accent-primary pl-4 italic my-4 text-gray-700">
          {children}
        </blockquote>
      );

    case 'codeBlock':
      return (
        <pre key={key} className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
          <code>{children}</code>
        </pre>
      );

    case 'horizontalRule':
      return <hr key={key} className="my-8 border-gray-300" />;

    case 'hardBreak':
      return <br key={key} />;

    case 'image':
      return (
        <figure key={key} className="my-6">
          <Image
            src={node.attrs?.src || ''}
            alt={node.attrs?.alt || 'Image'}
            width={node.attrs?.width || 800}
            height={node.attrs?.height || 600}
            className="w-full h-auto rounded-lg"
          />
          {node.attrs?.title && (
            <figcaption className="text-sm text-gray-600 mt-2 text-center">
              {node.attrs.title}
            </figcaption>
          )}
        </figure>
      );

    default:
      // Unknown node type, just render children
      return <div key={key}>{children}</div>;
  }
}

// Portable Text components (for Sanity content)
const PortableTextComponents = {
  types: {
    image: ({ value }: any) => {
      const { width, height } = getImageDimensions(value);
      return (
        <figure className="my-6">
          <Image
            src={urlFor(value).url()}
            alt={value.alt || 'Image'}
            width={width}
            height={height}
            className="w-full h-auto rounded-lg"
          />
          {value.caption && (
            <figcaption className="text-sm text-gray-600 mt-2 text-center">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  marks: {
    link: ({ children, value }: any) => (
      <a
        href={value.href}
        className="text-accent-primary hover:underline"
        target={value.href?.startsWith('http') ? '_blank' : undefined}
        rel={value.href?.startsWith('http') ? 'noreferrer' : undefined}
      >
        {children}
      </a>
    ),
  },
};

export function RichText({ value }: { value: any }) {
  if (!value) return null;

  // Render Tiptap JSON
  if (isTiptapContent(value)) {
    return (
      <div className="prose prose-sm max-w-none">
        {renderTiptapNode(value)}
      </div>
    );
  }

  // Render Portable Text (Sanity format)
  if (Array.isArray(value)) {
    return (
      <div className="prose prose-sm max-w-none">
        <PortableText value={value} components={PortableTextComponents} />
      </div>
    );
  }

  // Fallback: render as plain text
  return <div className="prose prose-sm max-w-none">{String(value)}</div>;
}
