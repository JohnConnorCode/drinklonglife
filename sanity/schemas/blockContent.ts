import { defineType, defineArrayMember } from 'sanity';

export default defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      title: 'Block',
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
          { title: 'Underline', value: 'underline' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          title: 'Alt Text',
          name: 'alt',
          type: 'string',
        },
        {
          title: 'Caption',
          name: 'caption',
          type: 'string',
        },
      ],
    }),
    // Video Embed
    defineArrayMember({
      type: 'object',
      name: 'videoEmbed',
      title: 'Video Embed',
      fields: [
        {
          name: 'url',
          type: 'url',
          title: 'Video URL',
          description: 'YouTube or Vimeo URL',
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
      preview: {
        select: {
          url: 'url',
        },
        prepare({ url }) {
          return {
            title: 'Video Embed',
            subtitle: url,
          };
        },
      },
    }),
    // Code Block
    defineArrayMember({
      type: 'code',
      name: 'codeBlock',
      title: 'Code Block',
      options: {
        language: 'javascript',
        languageAlternatives: [
          { title: 'JavaScript', value: 'javascript' },
          { title: 'TypeScript', value: 'typescript' },
          { title: 'HTML', value: 'html' },
          { title: 'CSS', value: 'css' },
          { title: 'Python', value: 'python' },
          { title: 'Bash', value: 'bash' },
          { title: 'JSON', value: 'json' },
        ],
        withFilename: true,
      },
    }),
    // Callout Box
    defineArrayMember({
      type: 'object',
      name: 'callout',
      title: 'Callout Box',
      fields: [
        {
          name: 'type',
          type: 'string',
          title: 'Type',
          options: {
            list: [
              { title: '💡 Tip', value: 'tip' },
              { title: 'ℹ️ Info', value: 'info' },
              { title: '⚠️ Warning', value: 'warning' },
              { title: '✅ Success', value: 'success' },
            ],
          },
          initialValue: 'info',
        },
        {
          name: 'title',
          type: 'string',
          title: 'Title',
        },
        {
          name: 'content',
          type: 'text',
          title: 'Content',
          rows: 4,
        },
      ],
      preview: {
        select: {
          type: 'type',
          title: 'title',
        },
        prepare({ type, title }) {
          const emojis = { tip: '💡', info: 'ℹ️', warning: '⚠️', success: '✅' };
          return {
            title: `${emojis[type as keyof typeof emojis] || ''} ${title || 'Callout'}`,
            subtitle: type,
          };
        },
      },
    }),
    // Button/CTA
    defineArrayMember({
      type: 'object',
      name: 'button',
      title: 'Button',
      fields: [
        {
          name: 'text',
          type: 'string',
          title: 'Button Text',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'url',
          type: 'url',
          title: 'URL',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'style',
          type: 'string',
          title: 'Style',
          options: {
            list: [
              { title: 'Primary', value: 'primary' },
              { title: 'Secondary', value: 'secondary' },
            ],
          },
          initialValue: 'primary',
        },
      ],
      preview: {
        select: {
          text: 'text',
          style: 'style',
        },
        prepare({ text, style }) {
          return {
            title: `Button: ${text}`,
            subtitle: style,
          };
        },
      },
    }),
  ],
});
