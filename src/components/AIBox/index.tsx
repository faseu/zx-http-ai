import { UserOutlined } from '@ant-design/icons';
import { Bubble, Sender, Suggestion, XRequest } from '@ant-design/x';
import { Flex } from 'antd';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
// import 'highlight.js/styles/github.css'; // 你也可以用别的主题
import MarkdownIt from 'markdown-it';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [lines, setLines] = useState([]);
  const streamingContent = useMemo(() => lines.join(''), [lines]);

  const [messages, setMessages] = useState([
    { role: 'system', content: '你好，请问有什么可以帮您？' },
  ]);
  const linesRef = useRef<string[]>([]);
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
      dangerouslySetInnerHTML={{
        __html: md.render(content).replace(/\n$/, ''),
      }}
      className="markdown-body"
      style={{ minHeight: '23px' }}
    />
  );
  const request = async (messages: { role: string; content: string }[]) => {
    setStatus('pending');
    setLines([]);
    linesRef.current = [];

    await exampleRequest.create(
      {
        messages: messages,
        stream: true,
      },
      {
        onSuccess: () => {
          setStatus('success');
          // ✅ 成功后，把累积的内容加入消息流
          const assistantContent = linesRef.current.join('');
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: assistantContent },
          ]);
        },
        onError: (error) => {
          if (error.name === 'AbortError') {
            setStatus('abort');
          }
        },
        onUpdate: (chunk) => {
          try {
            const parsed = JSON.parse(chunk.data);
            console.log(parsed);
            if (parsed === '[DONE]') {
              console.log(parsed);
              setStatus('success');
            }
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              linesRef.current.push(content);
              setLines([...linesRef.current]); // 显示更新 markdown
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
    const newMessages = [...messages, { role: 'user', content: value }];
    setMessages(newMessages);
    setValue('');
    request(newMessages);
  };

  return (
    <Flex vertical className={styles.aiBox} gap={6}>
      <Bubble.List
        style={{ flex: 1 }}
        items={[
          ...messages.map((item, index) => ({
            key: index,
            placement: item.role === 'user' ? 'end' : 'start',
            content: item.content,
            avatar: (
              <img
                style={{ width: '32px', height: '32px' }}
                src="/admin/logo.png"
                alt=""
              />
            ),
            messageRender: renderMarkdown,
          })),
          ...(status === 'pending' && streamingContent
            ? [
                {
                  key: 'streaming',
                  placement: 'start',
                  content: streamingContent,
                  avatar: { icon: <UserOutlined /> },
                  messageRender: renderMarkdown,
                },
              ]
            : []),
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
              placeholder="请输入问题"
            />
          );
        }}
      </Suggestion>
    </Flex>
  );
};
