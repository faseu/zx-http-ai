// src/components/AIBox/index.tsx - 添加编译完成遮罩功能

import {
  BorderOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  DownOutlined,
  PaperClipOutlined,
  UpOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Bubble, Sender, Suggestion } from '@ant-design/x';
import { request } from '@umijs/max';
import {
  Button,
  Divider,
  Flex,
  message,
  Popconfirm,
  Progress,
  Space,
  Upload,
  UploadFile,
  UploadProps,
} from 'antd';
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

// 使用OpenAI SDK配置
const API_KEY = 'sk-27b6793c7f634c038eb344a0d2bd39c9'; // 替换为你的实际API Key
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

// 定义组件ref接口
export interface AIBoxRef {
  fillInput: (text: string) => void;
  addFile: (file: File) => Promise<void>; // 新增：添加文件的方法
}

// 定义文件状态接口
interface FileWithStatus extends UploadFile {
  fileId?: string; // 阿里云百炼返回的file-id
  uploadStatus?: 'uploading' | 'success' | 'error';
  uploadProgress?: number;
}

// 添加 props 接口，接收编译完成回调
interface AIBoxProps {
  onCompileSuccess?: () => void; // 编译成功回调
}

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

const AIBox = forwardRef<AIBoxRef, AIBoxProps>(({ onCompileSuccess }, ref) => {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<string>();
  const [lines, setLines] = useState([]);
  const streamingContent = useMemo(() => lines.join(''), [lines]);
  const [messages, setMessages] = useState([]);
  const [fileList, setFileList] = useState<FileWithStatus[]>([]);
  const linesRef = useRef<string[]>([]);
  const abortController = useRef<AbortController | null>(null); // 修改为可以为null

  // 编辑模态框相关状态
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState('');
  const [currentCodeBlock, setCurrentCodeBlock] = useState<HTMLElement | null>(
    null,
  );
  const [fileListCollapsed, setFileListCollapsed] = useState(false);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    fillInput: (text: string) => {
      setValue(text);
    },
    // 新增：程序化添加文件的方法
    addFile: async (file: File) => {
      try {
        // 验证文件
        if (!validateFile(file)) {
          throw new Error('文件验证失败');
        }

        // 创建文件对象
        const fileWithStatus: FileWithStatus = {
          uid: `programmatic-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          originFileObj: file,
          uploadStatus: 'uploading',
          uploadProgress: 0,
          status: 'uploading',
        };

        // 添加到文件列表
        setFileList((prev) => [...prev, fileWithStatus]);

        // 模拟上传进度
        let progressValue = 0;
        const progressInterval = setInterval(() => {
          progressValue += 10;
          if (progressValue <= 90) {
            setFileList((prev) =>
              prev.map((item) =>
                item.uid === fileWithStatus.uid
                  ? { ...item, uploadProgress: progressValue }
                  : item,
              ),
            );
          }
        }, 100);

        // 执行实际上传
        const fileId = await uploadFileWithOpenAI(file);

        clearInterval(progressInterval);

        // 更新文件状态为成功
        setFileList((prev) =>
          prev.map((item) =>
            item.uid === fileWithStatus.uid
              ? {
                  ...item,
                  uploadStatus: 'success',
                  uploadProgress: 100,
                  fileId: fileId,
                  status: 'done',
                }
              : item,
          ),
        );

        console.log('程序化添加文件成功:', file.name, 'File ID:', fileId);
        message.success(`文件 ${file.name} 已成功添加到AI对话中`);
      } catch (error) {
        console.error('程序化添加文件失败:', error);
        message.error(`添加文件失败: ${error.message}`);

        // 移除失败的文件
        setFileList((prev) =>
          prev.filter((item) => item.originFileObj !== file),
        );
        throw error;
      }
    },
  }));

  // 停止回复功能
  const stopReply = () => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
    setStatus('stopped');

    // 如果有流式内容，保存到历史消息中
    if (linesRef.current.length > 0) {
      const assistantContent = linesRef.current.join('');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `${assistantContent}\n\n[回复已停止]` },
      ]);
    }

    setLines([]);
    linesRef.current = [];
    message.info('已停止回复');
  };

  // 使用OpenAI SDK上传文件到阿里云百炼
  const uploadFileWithOpenAI = async (file: File): Promise<string> => {
    try {
      // 创建FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'file-extract');

      // 使用fetch调用OpenAI兼容接口
      const response = await fetch(`${BASE_URL}/files`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `上传失败: ${response.status} ${response.statusText}\n${errorData}`,
        );
      }

      const result = await response.json();
      console.log('文件上传成功:', result);
      return result.id; // 返回file-id
    } catch (error) {
      console.error('上传文件失败:', error);
      throw error;
    }
  };

  // 使用OpenAI兼容接口进行聊天
  const chatWithOpenAI = async (messages: any[]) => {
    try {
      // 创建新的AbortController
      const controller = new AbortController();
      abortController.current = controller;

      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen-long',
          messages: messages,
          stream: true,
          stream_options: {
            include_usage: true,
          },
        }),
        signal: controller.signal, // 添加取消信号
      });

      if (!response.ok) {
        throw new Error(
          `Chat API调用失败: ${response.status} ${response.statusText}`,
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      setStatus('pending');
      setLines([]);
      linesRef.current = [];

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n').filter((line) => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                setStatus('success');
                const assistantContent = linesRef.current.join('');
                setMessages((prev) => [
                  ...prev,
                  { role: 'assistant', content: assistantContent },
                ]);
                abortController.current = null; // 清空控制器
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  linesRef.current.push(content);
                  setLines([...linesRef.current]);
                }
              } catch (parseError) {
                console.warn('解析chunk失败:', parseError, data);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
        abortController.current = null; // 确保清空控制器
      }
    } catch (error) {
      // 检查是否是用户主动取消
      if (error.name === 'AbortError') {
        console.log('请求已被用户取消');
        return; // 不显示错误消息，因为是用户主动取消
      }

      console.error('聊天请求失败:', error);
      setStatus('error');
      message.error(`请求失败: ${error.message}`);
      abortController.current = null; // 清空控制器
    }
  };

  // 获取文件图标
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'docx':
      case 'pdf':
        return '📄';
      case 'xlsx':
        return '📊';
      case 'txt':
      case 'md':
        return '📝';
      case 'epub':
      case 'mobi':
        return '📚';
      case 'csv':
        return '📋';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'bmp':
        return '🖼️';
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return '⚛️';
      case 'py':
        return '🐍';
      case 'java':
        return '☕';
      case 'cpp':
      case 'c':
        return '⚙️';
      case 'json':
        return '🔧';
      case 'xml':
        return '📑';
      case 'html':
        return '🌐';
      case 'css':
      case 'less':
      case 'scss':
        return '🎨';
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

  // 检查文件类型和大小
  const validateFile = (file: File): boolean => {
    // 支持的文件格式
    const supportedTextFormats = [
      '.txt',
      '.docx',
      '.pdf',
      '.xlsx',
      '.epub',
      '.mobi',
      '.md',
      '.csv',
    ];
    const supportedImageFormats = ['.bmp', '.png', '.jpg', '.jpeg', '.gif'];
    const supportedCodeFormats = [
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
      '.json',
    ];

    const allSupportedFormats = [
      ...supportedTextFormats,
      ...supportedImageFormats,
      ...supportedCodeFormats,
    ];

    const fileName = file.name.toLowerCase();
    const isValidType = allSupportedFormats.some((ext) =>
      fileName.endsWith(ext),
    );

    if (!isValidType) {
      message.error(`不支持的文件类型: ${file.name}`);
      return false;
    }

    // 检查文件大小：图片20MB，其他150MB
    const isImage = supportedImageFormats.some((ext) => fileName.endsWith(ext));
    const maxSize = isImage ? 20 * 1024 * 1024 : 150 * 1024 * 1024;

    if (file.size > maxSize) {
      message.error(
        `文件大小超出限制: ${file.name} (最大${isImage ? '20MB' : '150MB'})`,
      );
      return false;
    }

    return true;
  };

  // 自定义上传处理
  const handleCustomUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;

    console.log('customRequest 被触发，文件:', file.name, 'UID:', file.uid);

    // 更新文件状态为上传中
    setFileList((prev) => {
      console.log(
        '设置上传中状态，当前文件列表:',
        prev.map((f) => ({ name: f.name, uid: f.uid })),
      );
      const updated = prev.map((item) =>
        item.uid === file.uid
          ? { ...item, uploadStatus: 'uploading', uploadProgress: 0 }
          : item,
      );
      console.log(
        '更新后的文件列表:',
        updated.map((f) => ({
          name: f.name,
          uid: f.uid,
          status: f.uploadStatus,
        })),
      );
      return updated;
    });

    try {
      // 模拟上传进度
      let progressValue = 0;
      const progressInterval = setInterval(() => {
        progressValue += 10;
        if (progressValue <= 90) {
          setFileList((prev) =>
            prev.map((item) =>
              item.uid === file.uid
                ? { ...item, uploadProgress: progressValue }
                : item,
            ),
          );
        }
      }, 200);

      // 使用OpenAI SDK上传文件
      console.log('开始上传文件到阿里云百炼...');
      const fileId = await uploadFileWithOpenAI(file);
      console.log('文件上传成功，获得file-id:', fileId);

      clearInterval(progressInterval);

      // 更新文件状态为成功
      setFileList((prev) => {
        console.log('设置成功状态，文件ID:', fileId);
        const updated = prev.map((item) =>
          item.uid === file.uid
            ? {
                ...item,
                uploadStatus: 'success',
                uploadProgress: 100,
                fileId: fileId,
                status: 'done',
              }
            : item,
        );
        console.log(
          '成功状态更新后的文件:',
          updated.find((f) => f.uid === file.uid),
        );
        return updated;
      });

      onSuccess({ fileId }, file);
      message.success(`${file.name} 上传成功，File ID: ${fileId}`);
    } catch (error) {
      console.error('上传失败:', error);

      // 更新文件状态为错误
      setFileList((prev) =>
        prev.map((item) =>
          item.uid === file.uid
            ? { ...item, uploadStatus: 'error', uploadProgress: 0 }
            : item,
        ),
      );

      onError(error);
      message.error(`${file.name} 上传失败: ${error.message}`);
    }
  };

  // 文件上传配置
  const uploadProps: UploadProps = {
    accept:
      '.txt,.docx,.pdf,.xlsx,.epub,.mobi,.md,.csv,.bmp,.png,.jpg,.jpeg,.gif',
    multiple: true,
    maxCount: 100, // 阿里云百炼支持最多100个文件
    fileList,
    customRequest: handleCustomUpload,
    beforeUpload: (file) => {
      // 在这里进行文件验证，返回true允许上传，false阻止上传
      return validateFile(file);
    },
    onChange: (info) => {
      console.log(
        'Upload onChange 触发，文件列表:',
        info.fileList.map((f) => ({
          name: f.name,
          uid: f.uid,
          status: f.status,
          uploadStatus: (f as FileWithStatus).uploadStatus,
          fileId: (f as FileWithStatus).fileId,
        })),
      );

      // 保持自定义状态，不被 Upload 组件覆盖
      setFileList((prev) => {
        return info.fileList.map((newFile) => {
          const existingFile = prev.find(
            (f) => f.uid === newFile.uid,
          ) as FileWithStatus;
          if (existingFile) {
            // 保持已有的自定义状态
            return {
              ...newFile,
              uploadStatus: existingFile.uploadStatus,
              uploadProgress: existingFile.uploadProgress,
              fileId: existingFile.fileId,
            } as FileWithStatus;
          }
          return newFile as FileWithStatus;
        });
      });
    },
    onRemove: (file) => {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
    },
    showUploadList: false,
  };

  // 构建包含file-id的消息修改 buildMessagesWithFiles 函数，让 AI 有记忆功能
  const buildMessagesWithFiles = (
    userInput: string,
    files: FileWithStatus[],
    previousMessages: any[], // 新增：传入历史消息
  ) => {
    const messages: any[] = [
      { role: 'system', content: 'You are a helpful assistant.' },
    ];

    // 添加file-id到system messages（只在第一次上传文件时添加）
    const successFiles = files.filter(
      (file) => file.fileId && file.uploadStatus === 'success',
    );

    console.log(
      '构建消息 - 成功的文件:',
      successFiles.map((f) => ({ name: f.name, fileId: f.fileId })),
    );

    // 如果有新上传的文件，添加文件ID
    successFiles.forEach((file) => {
      console.log(`添加文件ID到消息: fileid://${file.fileId}`);
      messages.push({
        role: 'system',
        content: `fileid://${file.fileId}`,
      });
    });

    // 添加所有历史消息（排除系统消息和文件ID消息）
    previousMessages.forEach((msg) => {
      // 过滤掉系统消息和文件ID消息，只保留真实的对话内容
      if (msg.role !== 'system' && !msg.content.startsWith('fileid://')) {
        // 清理显示用的附件信息，只保留纯文本内容
        let cleanContent = msg.content;
        if (msg.role === 'user') {
          // 移除用户消息中的附件显示信息
          cleanContent = cleanContent.replace(/\n\n📎 附件 \(\d+个\):.*$/, '');
        }
        messages.push({
          role: msg.role,
          content: cleanContent,
        });
      }
    });

    // 添加当前用户消息
    if (userInput.trim()) {
      messages.push({
        role: 'user',
        content: userInput,
      });
    }

    console.log('最终构建的消息（包含历史）:', messages);
    return messages;
  };

  // 修改后的 handleSubmit 函数
  const handleSubmit = async (value: string) => {
    // 如果正在回复中，禁止发送新消息
    if (status === 'pending') {
      message.warning('AI正在回复中，请等待回复完成或点击停止按钮');
      return;
    }

    if (!value.trim() && fileList.length === 0) {
      message.warning('请输入消息或选择附件');
      return;
    }

    // 检查是否有文件正在上传
    const uploadingFiles = fileList.filter(
      (file) => file.uploadStatus === 'uploading',
    );
    if (uploadingFiles.length > 0) {
      message.warning('请等待文件上传完成');
      return;
    }

    // 检查是否有上传失败的文件
    const failedFiles = fileList.filter(
      (file) => file.uploadStatus === 'error',
    );
    if (failedFiles.length > 0) {
      message.warning('请移除上传失败的文件');
      return;
    }

    // 获取成功上传的文件
    const successFiles = fileList.filter(
      (file) => file.fileId && file.uploadStatus === 'success',
    );

    console.log('文件状态检查:');
    console.log('总文件数:', fileList.length);
    console.log('上传中的文件:', uploadingFiles.length);
    console.log('失败的文件:', failedFiles.length);
    console.log('成功的文件:', successFiles.length);
    console.log(
      '文件详情:',
      fileList.map((f) => ({
        name: f.name,
        status: f.uploadStatus,
        fileId: f.fileId ? `${f.fileId.substring(0, 20)}...` : 'none',
      })),
    );

    try {
      // 构建包含file-id和历史消息的消息数组
      const apiMessages = buildMessagesWithFiles(value, fileList, messages); // 传入历史消息

      console.log(
        '发送的消息结构（包含历史）:',
        JSON.stringify(apiMessages, null, 2),
      );

      // 添加到历史消息（显示用）
      const displayMessages = [...messages];
      if (value.trim()) {
        let displayContent = value;
        if (successFiles.length > 0) {
          displayContent += `\n\n📎 附件 (${
            successFiles.length
          }个): ${successFiles.map((f) => f.name).join(', ')}`;
        }
        displayMessages.push({ role: 'user', content: displayContent });
      }

      setMessages(displayMessages);
      setValue('');

      // 清空文件列表（可选：如果希望文件只在当前对话中生效）
      // setFileList([]);

      // 调用聊天API
      await chatWithOpenAI(apiMessages);
    } catch (error) {
      message.error('发送消息失败，请重试');
      console.error('发送错误:', error);
    }
  };

  // 渲染文件列表
  const renderFileList = () => {
    if (fileList.length === 0) return null;

    return (
      <div
        style={{
          background: '#1f1f1f',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '8px',
          border: '1px solid #333',
        }}
      >
        {/* 文件列表头部 - 可点击折叠 */}
        <div
          style={{
            fontSize: '12px',
            color: '#888',
            marginBottom: fileListCollapsed ? '0' : '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            padding: '4px 0',
            transition: 'all 0.3s ease',
          }}
          onClick={() => setFileListCollapsed(!fileListCollapsed)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <PaperClipOutlined />
            <span>已选择 {fileList.length} 个附件</span>
          </div>

          {/* 折叠/展开图标 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#666',
              fontSize: '10px',
            }}
          >
            <span>{fileListCollapsed ? '展开' : '收起'}</span>
            {fileListCollapsed ? <DownOutlined /> : <UpOutlined />}
          </div>
        </div>

        {/* 文件列表内容 - 可折叠 */}
        <div
          style={{
            maxHeight: fileListCollapsed ? '0' : '120px',
            overflow: 'hidden',
            transition: 'max-height 0.3s ease, opacity 0.3s ease',
            opacity: fileListCollapsed ? 0 : 1,
          }}
        >
          {/* 横向排列的文件卡片 */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'thin',
            }}
          >
            {fileList.map((file) => (
              <div
                key={file.uid}
                style={{
                  width: '100px',
                  height: '100px',
                  background: '#2a2a2a',
                  borderRadius: '8px',
                  border: '1px solid #404040',
                  padding: '6px',
                  boxSizing: 'border-box',
                  position: 'relative',
                  flexShrink: 0, // 防止卡片被压缩
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {/* 删除按钮 */}
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
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    color: '#ff4d4f',
                    padding: '1px',
                    height: 'auto',
                    minWidth: 'auto',
                    fontSize: '10px',
                    zIndex: 2,
                  }}
                />

                {/* 文件图标和状态 */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    justifyContent: 'center',
                    marginTop: '12px',
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '2px' }}>
                    {getFileIcon(file.name)}
                  </div>

                  {/* 状态指示器 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    {file.uploadStatus === 'uploading' && (
                      <CloudUploadOutlined
                        style={{ color: '#1890ff', fontSize: '12px' }}
                      />
                    )}
                    {file.uploadStatus === 'success' && (
                      <span style={{ color: '#52c41a', fontSize: '12px' }}>
                        ✓
                      </span>
                    )}
                    {file.uploadStatus === 'error' && (
                      <span style={{ color: '#ff4d4f', fontSize: '12px' }}>
                        ✗
                      </span>
                    )}
                  </div>
                </div>

                {/* 文件名 */}
                <div
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    marginBottom: '2px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#fff',
                      lineHeight: '1.1',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                    }}
                  >
                    {file.name}
                  </div>
                  <div
                    style={{
                      fontSize: '9px',
                      color: '#888',
                      marginTop: '1px',
                    }}
                  >
                    {formatFileSize(file.size || 0)}
                  </div>
                </div>

                {/* 上传进度条 */}
                {file.uploadStatus === 'uploading' && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      padding: '0 6px 6px 6px',
                    }}
                  >
                    <Progress
                      percent={file.uploadProgress || 0}
                      size="small"
                      showInfo={false}
                      strokeColor="#1890ff"
                    />
                  </div>
                )}

                {/* 成功状态的file-id显示 */}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const clearConversation = () => {
    // 如果正在回复中，先停止回复
    if (status === 'pending') {
      stopReply();
    }

    setMessages([]);
    setFileList([]);
    setValue('');
    setLines([]);
    linesRef.current = [];
    setStatus(undefined);
    message.success('对话已清空');
  };

  const removeAnySuffix = (str, suffixes) => {
    return str.slice(0, -suffixes.length);
  };

  // 代码块增强功能 - 只在流式传输结束后渲染
  useEffect(() => {
    // 只有在非流式传输状态或流式传输完成时才添加按钮
    if (status === 'pending') {
      return; // 流式传输进行中，不添加按钮
    }

    const timeoutId = setTimeout(() => {
      const codeBlocks = document.querySelectorAll('.markdown-body pre');
      codeBlocks.forEach((block) => {
        if (
          block.querySelector('.copy-container') ||
          block.querySelector('.action-container')
        ) {
          return; // 如果已经添加过按钮，跳过
        }

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
          const rawCode = block.innerText;
          const code = removeAnySuffix(rawCode, '\n复制\n编辑\n提交编译'); // 只删除末尾的UI代码
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
          const originalCode = codeElement
            ? codeElement.innerText
            : block.innerText;
          setCurrentCodeBlock(codeElement || block);
          setEditingCode(originalCode);
          setEditModalOpen(true);
        };

        // 提交编译按钮 - 修改这里添加编译完成回调
        const compileButton = document.createElement('button');
        compileButton.className = 'compile-btn';
        compileButton.textContent = '提交编译';
        compileButton.onclick = async () => {
          const rawCode = block.innerText;
          const code = removeAnySuffix(rawCode, '复制\n编辑\n提交编译'); // 只删除末尾的UI代码
          console.log('提交编译:', code);
          compileButton.textContent = '编译中...';
          compileButton.disabled = true;

          try {
            // 第一步：上传代码文件
            const blob = new Blob([code], { type: 'text/plain' });
            const file = new File([blob], 'main.c', { type: 'text/plain' });

            const formData = new FormData();
            formData.append('filename', 'file');
            formData.append('file', file);

            const uploadResult = await request('/admin/upload/upcode', {
              method: 'POST',
              data: formData,
              requestType: 'form',
            });
            console.log('上传结果:', uploadResult);

            // 第二步：提交编译
            const compileResult = await request('/admin/Ai_Log/compiler', {
              method: 'POST',
              data: {
                id: uploadResult.id,
                url: uploadResult.url,
              },
            });

            if (!compileResult.compileId) {
              message.error('编译失败，已将错误信息填充到输入框');
              setValue(compileResult);
              return;
            }
            console.log('编译提交结果:', compileResult);
            message.success('编译已提交');

            // 第三步：轮询查询编译结果
            let pollCount = 0;
            const maxPolls = 30; // 最多轮询30次（30秒）
            const pollInterval = 1000; // 每秒轮询一次

            const pollCompileResult = async () => {
              try {
                const statusResult = await request(
                  '/admin/Ai_Log/get_compiler',
                  {
                    method: 'POST',
                    data: {
                      id: uploadResult.id,
                      url: uploadResult.url,
                    },
                  },
                );
                console.log(
                  `编译状态查询 (${pollCount + 1}/${maxPolls}):`,
                  statusResult,
                );

                // 假设编译完成的条件是返回状态中有完成标识
                // 根据实际API返回调整这个判断条件
                if (statusResult) {
                  if (statusResult === 'success') {
                    // 编译完成
                    compileButton.textContent = '编译完成';
                    compileButton.disabled = false;
                    message.success('代码编译成功！');

                    setTimeout(() => {
                      // 🎯 关键修改：编译成功后触发遮罩层显示
                      if (onCompileSuccess) {
                        onCompileSuccess({ url: compileResult });
                      }
                    }, 1000);

                    setTimeout(() => {
                      compileButton.textContent = '提交编译';
                    }, 3000);
                    return;
                  }
                }

                // 继续轮询
                pollCount++;
                if (pollCount < maxPolls) {
                  compileButton.textContent = `编译中... (${pollCount}/${maxPolls})`;
                  setTimeout(pollCompileResult, pollInterval);
                } else {
                  // 轮询超时
                  compileButton.textContent = '编译超时';
                  compileButton.disabled = false;
                  message.warning('编译查询超时，请稍后手动查看结果');

                  setTimeout(() => {
                    compileButton.textContent = '提交编译';
                  }, 3000);
                }
              } catch (pollError) {
                console.error('轮询编译状态失败:', pollError);
                compileButton.textContent = '查询失败';
                compileButton.disabled = false;
                message.error('编译状态查询失败');

                setTimeout(() => {
                  compileButton.textContent = '提交编译';
                }, 3000);
              }
            };

            // 开始轮询
            setTimeout(pollCompileResult, pollInterval);
          } catch (error) {
            console.error('编译错误:', error);
            compileButton.textContent = '编译失败';
            compileButton.disabled = false;
            message.error(error.message || '编译失败，请重试');

            setTimeout(() => {
              compileButton.textContent = '提交编译';
            }, 3000);
          }
        };

        // 一键升级按钮
        // const upgradeButton = document.createElement('button');
        // upgradeButton.className = 'upgrade-btn';
        // upgradeButton.textContent = '一键升级';
        // upgradeButton.onclick = () => {
        //   const code = block.innerText;
        //   console.log('一键升级:', code);
        //   upgradeButton.textContent = '升级中...';
        //   setTimeout(() => {
        //     upgradeButton.textContent = '升级完成';
        //     setTimeout(() => (upgradeButton.textContent = '一键升级'), 1500);
        //   }, 1500);
        // };

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

        // Object.assign(upgradeButton.style, buttonStyle, {
        //   background: '#F39800',
        //   color: '#fff',
        // });

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
        // addHoverEffect(upgradeButton, '#ffa940');

        // 将按钮添加到对应容器
        copyContainer.appendChild(copyButton);
        actionContainer.appendChild(editButton);
        actionContainer.appendChild(compileButton);
        // actionContainer.appendChild(upgradeButton);

        // 设置代码块样式并添加按钮容器
        block.style.position = 'relative';
        block.appendChild(copyContainer);
        block.appendChild(actionContainer);
      });
    }, 200); // 稍微增加延时，确保DOM完全渲染

    return () => clearTimeout(timeoutId);
  }, [messages, status, onCompileSuccess]); // 添加 onCompileSuccess 到依赖数组

  const renderMarkdown = (content) => (
    <div
      dangerouslySetInnerHTML={{
        __html: md.render(content).replace(/\n$/, ''),
      }}
      className="markdown-body"
      style={{ minHeight: '23px' }}
    />
  );

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
              messageRender: renderMarkdown,
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
            你好，我是即插智联，一款自然语言编程的智能体！
          </div>
        </div>
      )}

      {/* 文件列表显示 */}
      {renderFileList()}
      <div style={{ position: 'relative' }}>
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
                autoSize={{ minRows: 2, maxRows: 6 }}
                onKeyDown={onKeyDown}
                placeholder={
                  status === 'pending'
                    ? 'AI正在回复中，请等待...'
                    : '发送消息或上传长文档...'
                }
                actions={(node, info) => {
                  const { SendButton, SpeechButton } = info.components;
                  return (
                    <Space
                      size="small"
                      style={{
                        position: 'absolute',
                        right: '16px',
                        bottom: '8px',
                      }}
                    >
                      <Upload {...uploadProps}>
                        <Button
                          type="text"
                          icon={<PaperClipOutlined />}
                          disabled={
                            fileList.length >= 100 || status === 'pending'
                          }
                          style={{
                            width: 42,
                            height: 42,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#141414',
                            fontSize: '16px',
                            borderRadius: '50%',
                            opacity:
                              fileList.length >= 100 || status === 'pending'
                                ? 0.5
                                : 1,
                          }}
                          title={
                            status === 'pending'
                              ? 'AI正在回复中，无法上传文件'
                              : fileList.length >= 100
                              ? '最多只能上传100个文件'
                              : '上传长文档 (OpenAI SDK)'
                          }
                        />
                      </Upload>
                      <SpeechButton
                        type="text"
                        disabled={status === 'pending'}
                        icon={
                          <img
                            src="/admin/speech.png"
                            width={42}
                            height={42}
                            alt=""
                            style={{
                              opacity: status === 'pending' ? 0.5 : 1,
                            }}
                          />
                        }
                      />
                      <Divider type="vertical" />
                      {status === 'pending' ? (
                        // 显示停止按钮
                        <Button
                          type="text"
                          onClick={stopReply}
                          icon={<BorderOutlined />}
                          style={{
                            width: 42,
                            height: 42,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ff4d4f',
                            fontSize: '16px',
                            background: '#141414',
                            borderRadius: '50%',
                          }}
                          title="停止回复"
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
        <Popconfirm
          title="清空对话"
          description="确定要清空所有对话记录吗？此操作无法撤销。"
          okText="确定"
          cancelText="取消"
          onConfirm={clearConversation}
          placement="topLeft"
        >
          <Button
            type="text"
            icon={<DeleteOutlined />}
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              zIndex: 10,
              width: 42,
              height: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'inherit',
              fontSize: '16px',
              background: '#141414',
              borderRadius: '50%',
              backdropFilter: 'blur(4px)',
            }}
            title="清空对话"
          />
        </Popconfirm>
      </div>

      {/* 编辑代码模态框 */}
      <EditCodeModal
        open={editModalOpen}
        initialCode={editingCode}
        title="编辑代码"
        onOk={(newCode: string) => {
          if (currentCodeBlock) {
            currentCodeBlock.innerHTML = hljs.highlightAuto(newCode).value;
          }
          setEditModalOpen(false);
        }}
        onCancel={() => setEditModalOpen(false)}
      />
    </Flex>
  );
});

export default AIBox;
