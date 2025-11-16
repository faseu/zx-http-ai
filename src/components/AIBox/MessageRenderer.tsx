import { UserOutlined } from '@ant-design/icons';
import { Bubble } from '@ant-design/x';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import MarkdownIt from 'markdown-it';
import React from 'react';
import './index.less';
import type { ChatMessage } from './types';

const md = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${
          hljs.highlight(str, { language: lang }).value
        }</code></pre>`;
      } catch (__) {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

interface MessageRendererProps {
  messages: ChatMessage[];
  streamingContent?: string;
  status?: string;
}

const MessageRenderer: React.FC<MessageRendererProps> = ({
  messages,
  streamingContent,
  status,
}) => {
  const renderMarkdown = (content: string) => (
    <div
      dangerouslySetInnerHTML={{
        __html: md.render(content).replace(/\n$/, ''),
      }}
      className="markdown-body"
      style={{ minHeight: '23px' }}
    />
  );

  const bubbleItems = [
    ...messages.map((item, index) => ({
      key: index,
      placement: item.role === 'user' ? 'end' : 'start',
      content: item.content,
      avatar:
        item.role === 'user' ? (
          { icon: <UserOutlined /> }
        ) : (
          <div
            style={{
              width: '36px',
              height: '36px',
              background: '#141414',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
            }}
          >
            <img
              style={{ width: '18px', height: '18px' }}
              src="/admin/logo.png"
              alt=""
            />
          </div>
        ),
      messageRender: (content: string) => (
        <div
          data-message-index={index}
          dangerouslySetInnerHTML={{
            __html: md.render(content).replace(/\n$/, ''),
          }}
          className="markdown-body"
          style={{ minHeight: '23px' }}
        />
      ),
    })),
    ...(status === 'pending' && streamingContent
      ? [
          {
            key: 'streaming',
            placement: 'start',
            content: streamingContent,
            avatar: (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  background: '#141414',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                }}
              >
                <img
                  style={{ width: '18px', height: '18px' }}
                  src="/admin/logo.png"
                  alt=""
                />
              </div>
            ),
            messageRender: (content: string) => (
              <div
                data-message-index="streaming"
                dangerouslySetInnerHTML={{
                  __html: md.render(content).replace(/\n$/, ''),
                }}
                className="markdown-body"
                style={{ minHeight: '23px' }}
              />
            ),
          },
        ]
      : []),
  ];

  return <Bubble.List style={{ flex: 1 }} items={bubbleItems} />;
};

export default MessageRenderer;
