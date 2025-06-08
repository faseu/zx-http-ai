// src/components/AIBox/index.tsx
import {
  DeleteOutlined,
  PaperClipOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Bubble, Sender, Suggestion, XRequest } from '@ant-design/x';
import { request } from '@umijs/max';
import type { UploadFile, UploadProps } from 'antd';
import { Button, Divider, Flex, Space, Upload, message } from 'antd';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import MarkdownIt from 'markdown-it';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import EditCodeModal from './EditCodeModal';
import styles from './index.less';

const BASE_URL =
  'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const MODEL = 'qwen-omni-turbo';
const API_KEY = 'Bearer sk-b423f6e1b3ad43e1a4da384ab19f2577';

const exampleRequest = XRequest({
  baseURL: BASE_URL,
  model: MODEL,
  dangerouslyApiKey: API_KEY,
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

// 定义 ref 接口
export interface AIBoxRef {
  fillInput: (text: string) => void;
}

const AIBox = forwardRef<AIBoxRef>((props, ref) => {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<string>();
  const [lines, setLines] = useState([]);
  const streamingContent = useMemo(() => lines.join(''), [lines]);
  const [messages, setMessages] = useState([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const linesRef = useRef<string[]>([]);
  const abortController = useRef<AbortController>(null);

  // 编辑模态框相关状态
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState('');
  const [currentCodeBlock, setCurrentCodeBlock] = useState<HTMLElement | null>(
    null,
  );

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    fillInput: (text: string) => {
      setValue(text);
    },
  }));

  // 获取文件图标
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return '📄';
      case 'json':
        return '📋';
      case 'md':
        return '📝';
      case 'css':
      case 'less':
      case 'scss':
        return '🎨';
      case 'html':
        return '🌐';
      case 'py':
        return '🐍';
      case 'java':
        return '☕';
      case 'cpp':
      case 'c':
        return '⚙️';
      case 'txt':
      case 'log':
        return '📃';
      case 'csv':
        return '📊';
      case 'xml':
        return '📑';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return '🖼️';
      default:
        return '📄';
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // 文件上传配置
  const uploadProps: UploadProps = {
    multiple: true,
    maxCount: 5,
    accept:
      '.txt,.md,.json,.csv,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.h,.xml,.html,.css,.less,.scss,.yaml,.yml,.ini,.conf,.log',
    fileList,
    beforeUpload: (file) => {
      // 检查文件类型
      const allowedExtensions = [
        '.txt',
        '.md',
        '.json',
        '.csv',
        '.js',
        '.ts',
        '.tsx',
        '.jsx',
        '.py',
        '.java',
        '.cpp',
        '.c',
        '.h',
        '.xml',
        '.html',
        '.css',
        '.less',
        '.scss',
        '.yaml',
        '.yml',
        '.ini',
        '.conf',
        '.log',
      ];
      const fileName = file.name.toLowerCase();
      const isValidType =
        allowedExtensions.some((ext) => fileName.endsWith(ext)) ||
        file.type?.includes('text') ||
        file.type?.includes('application/json') ||
        file.type?.includes('image');

      if (!isValidType) {
        message.error(`不支持的文件类型: ${file.name}`);
        return false;
      }

      // 检查文件大小
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过10MB');
        return false;
      }

      return false; // 阻止自动上传
    },
    onChange: (info) => {
      setFileList(info.fileList);
    },
    onRemove: (file) => {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
    },
    showUploadList: false,
  };

  // 处理文件内容读取
  const readFileContent = async (file: UploadFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('文件读取失败'));

      if (file.originFileObj) {
        if (file.type?.startsWith('image/')) {
          reader.readAsDataURL(file.originFileObj);
        } else {
          reader.readAsText(file.originFileObj, 'UTF-8');
        }
      }
    });
  };

  // 处理附件信息
  const processAttachments = async (fileList: UploadFile[]) => {
    if (fileList.length === 0) return '';

    let attachmentText = '\n\n=== 📎 附件信息 ===\n';

    for (const file of fileList) {
      try {
        const content = await readFileContent(file);
        attachmentText += `\n📄 文件名: ${file.name}\n`;
        attachmentText += `🏷️ 文件类型: ${file.type || '未知'}\n`;
        attachmentText += `📏 文件大小: ${((file.size || 0) / 1024).toFixed(
          2,
        )} KB\n`;

        if (file.type?.startsWith('image/')) {
          attachmentText += `🖼️ 图片内容: [Base64编码的图片数据，请分析图片内容]\n`;
        } else {
          // 限制文本内容长度，避免token超限
          const maxLength = 3000;
          if (content.length > maxLength) {
            const truncatedContent = content.substring(0, maxLength);
            attachmentText += `📝 文件内容:\n\`\`\`\n${truncatedContent}\n\`\`\`\n⚠️ 注意: 文件内容已截断，原文件共${content.length}字符\n`;
          } else {
            attachmentText += `📝 文件内容:\n\`\`\`\n${content}\n\`\`\`\n`;
          }
        }
        attachmentText += '---\n';
      } catch (error) {
        attachmentText += `❌ 文件 ${file.name} 读取失败: ${error.message}\n---\n`;
      }
    }

    return attachmentText;
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const codeBlocks = document.querySelectorAll('.markdown-body pre');
      codeBlocks.forEach((block) => {
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
          setCurrentCodeBlock(codeElement);
          setEditingCode(originalCode);
          setEditModalOpen(true);
        };

        // 提交编译按钮
        const compileButton = document.createElement('button');
        compileButton.className = 'compile-btn';
        compileButton.textContent = '提交编译';
        compileButton.onclick = async () => {
          const code = block.innerText;
          console.log('提交编译:', code);
          compileButton.textContent = '编译中...';

          try {
            // 生成带时间戳的文件名
            const now = new Date();
            const timestamp =
              now.getFullYear() +
              String(now.getMonth() + 1).padStart(2, '0') +
              String(now.getDate()).padStart(2, '0') +
              String(now.getHours()).padStart(2, '0') +
              String(now.getMinutes()).padStart(2, '0') +
              String(now.getSeconds()).padStart(2, '0');

            // 创建文件对象
            const blob = new Blob([code], { type: 'text/plain' });
            const file = new File([blob], 'main.c', { type: 'text/plain' });
            console.log(file);
            // 创建 FormData
            const formData = new FormData();
            formData.append('filename', 'file');
            formData.append('file', file);

            // const result = await fetch('/admin/upload/upcode', {
            //   method: 'POST',
            //   body: formData,
            // });
            // 发送请求
            const result = await request('/admin/upload/upcode', {
              method: 'POST',
              data: formData,
              requestType: 'form', // 让 umi-request 处理 multipart/form-data
            });

            compileButton.textContent = '编译完成';
            message.success('代码提交成功');
          } catch (error) {
            console.error('编译错误:', error);
            compileButton.textContent = '编译失败';
            message.error(error.message || '编译失败，请重试');
          }

          setTimeout(() => (compileButton.textContent = '提交编译'), 2000);
        };

        // 一键升级按钮
        const upgradeButton = document.createElement('button');
        upgradeButton.className = 'upgrade-btn';
        upgradeButton.textContent = '一键升级';
        upgradeButton.onclick = () => {
          const code = block.innerText;
          console.log('一键升级:', code);
          upgradeButton.textContent = '升级中...';
          setTimeout(() => {
            upgradeButton.textContent = '升级完成';
            setTimeout(() => (upgradeButton.textContent = '一键升级'), 1500);
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
      currentCodeBlock.innerHTML = hljs.highlightAuto(newCode).value;
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

  const handleEditCodeCancel = () => {
    setEditModalOpen(false);
    setCurrentCodeBlock(null);
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

  const requestMessages = async (
    messages: { role: string; content: string }[],
  ) => {
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
            if (parsed === '[DONE]') {
              setStatus('success');
            }
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              linesRef.current.push(content);
              setLines([...linesRef.current]);
            }
          } catch (err) {
            console.error('解析 chunk 出错：', err, chunk);
          }
        },
        onStream: (controller) => {
          abortController.current = controller;
        },
      },
    );
  };

  const handleSubmit = async (value) => {
    if (!value.trim() && fileList.length === 0) {
      message.warning('请输入消息或选择附件');
      return;
    }

    try {
      // 处理附件内容
      const attachmentContent = await processAttachments(fileList);
      const finalContent = value + attachmentContent;

      const newMessages = [
        ...messages,
        { role: 'user', content: finalContent },
      ];
      setMessages(newMessages);
      setValue('');
      setFileList([]); // 清空附件列表

      await requestMessages(newMessages);
    } catch (error) {
      message.error('处理附件时出错，请重试');
      console.error('附件处理错误:', error);
    }
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

      {/* 附件显示区域 */}
      {fileList.length > 0 && (
        <div
          style={{
            background: '#1f1f1f',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '8px',
            border: '1px solid #333',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: '#888',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <PaperClipOutlined />
            <span>已选择 {fileList.length} 个附件 (最多5个)</span>
          </div>

          {fileList.map((file) => (
            <div
              key={file.uid}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                background: '#2a2a2a',
                borderRadius: '4px',
                marginBottom: '4px',
                border: '1px solid #404040',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flex: 1,
                  overflow: 'hidden',
                }}
              >
                <span style={{ fontSize: '16px' }}>
                  {getFileIcon(file.name)}
                </span>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#fff',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {file.name}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#888',
                    }}
                  >
                    {formatFileSize(file.size || 0)}
                  </div>
                </div>
              </div>

              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => {
                  const newFileList = fileList.filter(
                    (item) => item.uid !== file.uid,
                  );
                  setFileList(newFileList);
                }}
                style={{
                  color: '#ff4d4f',
                  padding: '2px 4px',
                  height: 'auto',
                  minWidth: 'auto',
                }}
              />
            </div>
          ))}

          <div
            style={{
              fontSize: '11px',
              color: '#666',
              marginTop: '4px',
              textAlign: 'center',
            }}
          >
            支持: .txt, .md, .json, .csv, .js, .ts, .py, .java 等
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
                const { SendButton, SpeechButton } = info.components;
                return (
                  <Space size="small">
                    <Upload {...uploadProps}>
                      <Button
                        type="text"
                        icon={<PaperClipOutlined />}
                        disabled={fileList.length >= 5}
                        style={{
                          width: 42,
                          height: 42,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#141414',
                          borderRadius: '50%',
                          opacity: fileList.length >= 5 ? 0.5 : 1,
                        }}
                        title={
                          fileList.length >= 5
                            ? '最多只能上传5个文件'
                            : '添加附件'
                        }
                      />
                    </Upload>
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
});

export default AIBox;
