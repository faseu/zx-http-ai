import { UserOutlined } from '@ant-design/icons';
import { Bubble, Sender, Suggestion, XRequest } from '@ant-design/x';
import { Flex } from 'antd';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
// import 'highlight.js/styles/github.css'; // 你也可以用别的主题
import MarkdownIt from 'markdown-it';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

const BASE_URL =
  'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const MODEL = 'qwen-omni-turbo';
const API_KEY = 'Bearer sk-b423f6e1b3ad43e1a4da384ab19f2577';

const exampleRequest = XRequest({
  baseURL: BASE_URL,
  model: MODEL,
  dangerouslyApiKey: API_KEY,
  /** 🔥🔥 Its dangerously! */
});
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
export default () => {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<string>();
  const [lines, setLines] = useState<Record<string, string>[]>([]);
  const abortController = useRef<AbortController>(null);

  useEffect(() => {
    const codeBlocks = document.querySelectorAll('.markdown-body pre');

    codeBlocks.forEach((block) => {
      // 避免重复添加按钮
      if (block.querySelector('.copy-btn')) return;

      const button = document.createElement('button');
      button.className = 'copy-btn';
      button.textContent = '复制';
      button.onclick = async () => {
        const code = block.innerText;
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = '已复制';
          setTimeout(() => (button.textContent = '复制'), 1500);
        } catch (err) {
          button.textContent = '失败';
        }
      };

      block.style.position = 'relative';
      button.style.position = 'absolute';
      button.style.top = '8px';
      button.style.right = '8px';
      button.style.fontSize = '12px';
      button.style.padding = '2px 6px';
      button.style.background = '#1890ff';
      button.style.color = '#fff';
      button.style.border = 'none';
      button.style.borderRadius = '4px';
      button.style.cursor = 'pointer';
      button.classList.add('copy-btn');

      block.appendChild(button);
    });
  }, [lines]); // 每次 markdown 内容更新都执行一次

  const renderMarkdown = (content) => (
    <div
      dangerouslySetInnerHTML={{ __html: md.render(content) }}
      className="markdown-body"
      style={{ whiteSpace: 'pre-wrap' }}
    />
  );
  const request = async (value) => {
    setStatus('pending');
    setLines([]);
    await exampleRequest.create(
      {
        messages: [{ role: 'user', content: value }],
        stream: true,
      },
      {
        onSuccess: () => {
          setStatus('success');
        },
        onError: (error) => {
          if (error.name === 'AbortError') {
            setStatus('abort');
          }
        },
        onUpdate: (chunk) => {
          try {
            const parsed = JSON.parse(chunk.data); // 第一次 JSON.parse
            const content = parsed.choices?.[0]?.delta?.content || '';

            if (content) {
              setLines((prev) => [...prev, content]);
            }
          } catch (err) {
            console.error('解析 chunk 出错：', err, chunk);
          }
        },
        onStream: (controller) => {
          console.log(controller);
          abortController.current = controller;
        },
      },
    );
  };

  const handleSubmit = (value) => {
    request(value);
  };

  return (
    <Flex vertical className={styles.aiBox} gap={6}>
      <Bubble.List
        style={{ flex: 1 }}
        items={[
          {
            key: '1',
            placement: 'end',
            content: '写一个arduino控制LED灯的程序',
            avatar: { icon: <UserOutlined /> },
          },
          {
            key: '2',
            content:
              '好的，用户让我写一个 Arduino 控制 LED 灯的程序。首先，我需要确定用户的具体需求是什么。控制 LED 灯有很多种方式，比如简单的闪烁、调光或者根据传感器输入变化等。用户没有特别说明，所以应该从最基础的开始，比如让LED 灯闪烁。',
            avatar: { icon: <UserOutlined /> },
          },
          {
            key: 'ai-response',
            content: lines.join(''),
            avatar: { icon: <UserOutlined /> },
            messageRender: renderMarkdown, // 加上这句支持 Markdown 渲染
          },
        ]}
      />
      <Suggestion items={[{ label: 'Write a report', value: 'report' }]}>
        {({ onTrigger, onKeyDown }) => {
          return (
            <Sender
              value={value}
              onChange={(nextVal) => {
                if (nextVal === '/') {
                  onTrigger();
                } else if (!nextVal) {
                  onTrigger(false);
                }
                setValue(nextVal);
              }}
              onSubmit={handleSubmit}
              autoSize={{ minRows: 6, maxRows: 6 }}
              onKeyDown={onKeyDown}
              placeholder='Type "/" to trigger suggestion'
            />
          );
        }}
      </Suggestion>
    </Flex>
  );
};
