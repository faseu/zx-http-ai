import { UserOutlined } from '@ant-design/icons';
import { Bubble, Sender, Suggestion, XRequest } from '@ant-design/x';
import { Divider, Flex, Space } from 'antd';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
// import 'highlight.js/styles/github.css'; // 你也可以用别的主题
import MarkdownIt from 'markdown-it';
import { useEffect, useMemo, useRef, useState } from 'react';
import EditCodeModal from './EditCodeModal'; // 引入编辑代码模态框组件
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

  const [messages, setMessages] = useState([]);
  const linesRef = useRef<string[]>([]);
  const abortController = useRef<AbortController>(null);

  // 编辑模态框相关状态
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState('');
  const [currentCodeBlock, setCurrentCodeBlock] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const codeBlocks = document.querySelectorAll('.markdown-body pre');
      codeBlocks.forEach((block) => {
        // 检查是否已经添加过按钮容器，避免重复添加
        if (
          block.querySelector('.copy-container') ||
          block.querySelector('.action-container')
        )
          return;

        // 创建复制按钮容器（右上角）
        const copyContainer = document.createElement('div');
        copyContainer.className = 'copy-container';
        copyContainer.style.position = 'absolute';
        copyContainer.style.top = '8px';
        copyContainer.style.right = '8px';

        // 创建功能按钮容器（右下角）
        const actionContainer = document.createElement('div');
        actionContainer.className = 'action-container';
        actionContainer.style.position = 'absolute';
        actionContainer.style.bottom = '8px';
        actionContainer.style.right = '8px';
        actionContainer.style.display = 'flex';
        actionContainer.style.gap = '8px';
        actionContainer.style.alignItems = 'center';

        // 复制按钮
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-btn';
        copyButton.textContent = '复制';
        copyButton.onclick = async () => {
          const code = block.innerText;
          try {
            await navigator.clipboard.writeText(code);
            copyButton.textContent = '已复制';
            setTimeout(() => (copyButton.textContent = '复制'), 1500);
          } catch (err) {
            copyButton.textContent = '失败';
            setTimeout(() => (copyButton.textContent = '复制'), 1500);
          }
        };

        // 编辑按钮
        const editButton = document.createElement('button');
        editButton.className = 'edit-btn';
        editButton.textContent = '编辑';
        editButton.onclick = () => {
          const codeElement = block.querySelector('code');
          const originalCode = codeElement.innerText;

          // 打开编辑模态框
          setCurrentCodeBlock(codeElement);
          setEditingCode(originalCode);
          setEditModalOpen(true);
        };

        // 提交编译按钮
        const compileButton = document.createElement('button');
        compileButton.className = 'compile-btn';
        compileButton.textContent = '提交编译';
        compileButton.onclick = () => {
          const code = block.innerText;
          // 这里可以添加您的编译逻辑
          console.log('提交编译:', code);
          compileButton.textContent = '编译中...';
          // 模拟编译过程
          setTimeout(() => {
            compileButton.textContent = '编译完成';
            setTimeout(() => (compileButton.textContent = '提交编译'), 2000);
          }, 1000);
        };

        // 一键升级按钮
        const upgradeButton = document.createElement('button');
        upgradeButton.className = 'upgrade-btn';
        upgradeButton.textContent = '一键升级';
        upgradeButton.onclick = () => {
          const code = block.innerText;
          // 这里可以添加您的升级逻辑
          console.log('一键升级:', code);
          upgradeButton.textContent = '升级中...';
          // 模拟升级过程
          setTimeout(() => {
            upgradeButton.textContent = '升级完成';
            setTimeout(() => (upgradeButton.textContent = '一键升级'), 2000);
          }, 1500);
        };

        // 通用按钮样式
        const buttonStyle = {
          fontSize: '12px',
          padding: '4px 8px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '500',
          transition: 'all 0.2s ease',
        };

        // 应用样式到各个按钮
        Object.assign(copyButton.style, buttonStyle, {
          background: '#282c34',
          color: '#fff',
        });

        Object.assign(editButton.style, buttonStyle, {
          background: '#52c41a',
          color: '#fff',
        });

        Object.assign(compileButton.style, buttonStyle, {
          background: '#4091ED',
          color: '#fff',
        });

        Object.assign(upgradeButton.style, buttonStyle, {
          background: '#F39800',
          color: '#fff',
        });

        // 添加悬停效果
        const addHoverEffect = (button, hoverColor) => {
          button.onmouseenter = () => {
            button.style.opacity = '0.8';
            button.style.transform = 'translateY(-1px)';
          };
          button.onmouseleave = () => {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
          };
        };

        addHoverEffect(copyButton, '#40a9ff');
        addHoverEffect(editButton, '#73d13d');
        addHoverEffect(compileButton, '#4091ED');
        addHoverEffect(upgradeButton, '#ffa940');

        // 将按钮添加到对应容器
        copyContainer.appendChild(copyButton);
        actionContainer.appendChild(editButton);
        actionContainer.appendChild(compileButton);
        actionContainer.appendChild(upgradeButton);

        // 设置代码块样式并添加按钮容器
        block.style.position = 'relative';
        block.appendChild(copyContainer);
        block.appendChild(actionContainer);
      });
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [messages]);

  // 处理编辑代码保存
  const handleEditCodeSave = (newCode: string) => {
    if (currentCodeBlock) {
      // 更新代码块内容
      currentCodeBlock.innerHTML = hljs.highlightAuto(newCode).value;

      // 找到对应的编辑按钮并显示保存状态
      const editButton = currentCodeBlock
        .closest('pre')
        ?.querySelector('.edit-btn') as HTMLButtonElement;
      if (editButton) {
        editButton.textContent = '已保存';
        setTimeout(() => (editButton.textContent = '编辑'), 1500);
      }
    }
    setEditModalOpen(false);
    setCurrentCodeBlock(null);
  };

  // 处理编辑模态框取消
  const handleEditCodeCancel = () => {
    setEditModalOpen(false);
    setCurrentCodeBlock(null);
  };

  // 创建编辑模态框的函数
  const createEditModal = (codeBlock, originalCode, onSave) => {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    // 创建模态框
    const modal = document.createElement('div');
    modal.style.backgroundColor = '#fff';
    modal.style.borderRadius = '8px';
    modal.style.padding = '20px';
    modal.style.width = '80%';
    modal.style.maxWidth = '800px';
    modal.style.maxHeight = '80%';
    modal.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';

    // 创建标题
    const title = document.createElement('h3');
    title.textContent = '编辑代码';
    title.style.margin = '0 0 16px 0';
    title.style.color = '#333';

    // 创建文本域
    const textarea = document.createElement('textarea');
    textarea.value = originalCode;
    textarea.style.width = '100%';
    textarea.style.height = '400px';
    textarea.style.fontFamily = 'Monaco, Menlo, "Ubuntu Mono", monospace';
    textarea.style.fontSize = '14px';
    textarea.style.border = '1px solid #d9d9d9';
    textarea.style.borderRadius = '6px';
    textarea.style.padding = '12px';
    textarea.style.resize = 'vertical';
    textarea.style.outline = 'none';
    textarea.style.backgroundColor = '#fafafa';

    // 创建按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.gap = '12px';
    buttonContainer.style.marginTop = '16px';

    // 创建取消按钮
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.border = '1px solid #d9d9d9';
    cancelButton.style.borderRadius = '6px';
    cancelButton.style.backgroundColor = '#fff';
    cancelButton.style.cursor = 'pointer';
    cancelButton.onclick = () => {
      document.body.removeChild(overlay);
    };

    // 创建保存按钮
    const saveButton = document.createElement('button');
    saveButton.textContent = '保存';
    saveButton.style.padding = '8px 16px';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '6px';
    saveButton.style.backgroundColor = '#1890ff';
    saveButton.style.color = '#fff';
    saveButton.style.cursor = 'pointer';
    saveButton.onclick = () => {
      const newCode = textarea.value;
      onSave(newCode);
      document.body.removeChild(overlay);
    };

    // 组装模态框
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(saveButton);
    modal.appendChild(title);
    modal.appendChild(textarea);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);

    // 添加到页面
    document.body.appendChild(overlay);

    // 聚焦到文本域
    textarea.focus();

    // 点击遮罩关闭
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    };

    // ESC键关闭
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(overlay);
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
  };

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
      {messages.length > 0 && (
        <Bubble.List
          style={{ flex: 1 }}
          items={[
            ...messages.map((item, index) => ({
              key: index,
              placement: item.role === 'user' ? 'end' : 'start',
              content: item.content,
              avatar:
                item.role === 'user' ? (
                  { icon: <UserOutlined /> }
                ) : (
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
                    avatar: (
                      <img
                        style={{ width: '32px', height: '32px' }}
                        src="/admin/logo.png"
                        alt=""
                      />
                    ),
                    messageRender: renderMarkdown,
                  },
                ]
              : []),
          ]}
        />
      )}
      {!messages.length && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img style={{ width: '305px' }} src="/admin/ai-prompt.png" alt="" />
          <div style={{ fontSize: '18px', marginTop: '32px' }}>
            你好，我是即插智联，一款自然语言编程的小小智能体！
          </div>
        </div>
      )}

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
              placeholder="发送消息..."
              actions={(node, info) => {
                const { SendButton, LoadingButton, ClearButton, SpeechButton } =
                  info.components;
                console.log(node, info);
                return (
                  <Space size="small">
                    <SpeechButton
                      type="text"
                      icon={
                        <img
                          src="/admin/speech.png"
                          width={42}
                          height={42}
                          alt=""
                        />
                      }
                    />
                    <Divider type="vertical" />
                    {status === 'pending' ? (
                      <SendButton
                        type="text"
                        disabled
                        icon={
                          <img
                            src="/admin/send1.png"
                            width={42}
                            height={42}
                            alt=""
                          />
                        }
                      />
                    ) : (
                      <SendButton
                        type="text"
                        icon={
                          <img
                            src="/admin/send1.png"
                            width={42}
                            height={42}
                            alt=""
                          />
                        }
                      />
                    )}
                  </Space>
                );
              }}
            />
          );
        }}
      </Suggestion>

      {/* 编辑代码模态框 */}
      <EditCodeModal
        open={editModalOpen}
        initialCode={editingCode}
        title="编辑代码"
        onOk={handleEditCodeSave}
        onCancel={handleEditCodeCancel}
      />
    </Flex>
  );
};
