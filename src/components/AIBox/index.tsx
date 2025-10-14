import { BorderOutlined, DeleteOutlined } from '@ant-design/icons';
import { Sender, Suggestion } from '@ant-design/x';
import { Button, Divider, Flex, message, Popconfirm, Space } from 'antd';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

// 导入所有子组件和工具
import { chatWithAI, uploadFileToAI } from './api';
import CodeBlockEnhancer from './CodeBlockEnhancer';
import EditCodeModal from './EditCodeModal';
import FileList from './FileList';
import FileUploader from './FileUploader';
import styles from './index.less';
import MessageRenderer from './MessageRenderer';
import {
  clearLocalStorage,
  loadSessionFromLocalStorage,
  saveSessionToLocalStorage,
} from './storage';
import type {
  AIBoxProps,
  AIBoxRef,
  ChatMessage,
  FileWithStatus,
} from './types';
import { buildMessagesWithFiles, validateFile } from './utils';

const AIBox = forwardRef<AIBoxRef, AIBoxProps>(({ onCompileSuccess }, ref) => {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<string>();
  const [lines, setLines] = useState<string[]>([]);
  const streamingContent = useMemo(() => lines.join(''), [lines]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [fileList, setFileList] = useState<FileWithStatus[]>([]);
  const linesRef = useRef<string[]>([]);
  const abortController = useRef<AbortController | null>(null);

  // 编辑模态框相关状态
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState('');
  const [currentCodeBlock, setCurrentCodeBlock] = useState<HTMLElement | null>(
    null,
  );

  // 从本地存储加载完整的聊天会话
  useEffect(() => {
    const { messages: loadedMessages, files: loadedFiles } =
      loadSessionFromLocalStorage();
    if (loadedMessages.length > 0) {
      setMessages(loadedMessages);
      console.log('已加载对话历史:', loadedMessages.length, '条消息');
    }
    if (loadedFiles.length > 0) {
      setFileList(loadedFiles);
      console.log('已加载文件列表:', loadedFiles.length, '个文件');
    }
  }, []);

  // 监听messages和fileList变化，自动保存到本地存储
  useEffect(() => {
    if (messages.length > 0 || fileList.length > 0) {
      saveSessionToLocalStorage(messages, fileList);
    }
  }, [messages, fileList]);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    fillInput: (text: string) => {
      setValue(text);
    },
    addFile: async (file: File) => {
      try {
        if (!validateFile(file)) {
          throw new Error('文件验证失败');
        }

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

        const fileId = await uploadFileToAI(file);
        clearInterval(progressInterval);

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

        message.success(`文件 ${file.name} 已成功添加到AI对话中`);
      } catch (error) {
        console.error('程序化添加文件失败:', error);
        message.error(`添加文件失败: ${error.message}`);
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

  // 处理消息提交
  const handleSubmit = async (value: string) => {
    if (status === 'pending') {
      message.warning('AI正在回复中，请等待回复完成或点击停止按钮');
      return;
    }

    if (!value.trim() && fileList.length === 0) {
      message.warning('请输入消息或选择附件');
      return;
    }

    const uploadingFiles = fileList.filter(
      (file) => file.uploadStatus === 'uploading',
    );
    if (uploadingFiles.length > 0) {
      message.warning('请等待文件上传完成');
      return;
    }

    const failedFiles = fileList.filter(
      (file) => file.uploadStatus === 'error',
    );
    if (failedFiles.length > 0) {
      message.warning('请移除上传失败的文件');
      return;
    }

    const successFiles = fileList.filter(
      (file) => file.fileId && file.uploadStatus === 'success',
    );

    try {
      const controller = new AbortController();
      abortController.current = controller;

      const apiMessages = buildMessagesWithFiles(value, fileList, messages);
      const sessionFileIds = successFiles.map((file) => file.fileId!);

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
      setStatus('pending');
      setLines([]);
      linesRef.current = [];

      await chatWithAI(
        apiMessages,
        sessionFileIds,
        (content) => {
          linesRef.current = [content];
          setLines([content]);
        },
        (content) => {
          setStatus('success');
          setMessages((prev) => [...prev, { role: 'assistant', content }]);
          abortController.current = null;
        },
        (error) => {
          setStatus('error');
          message.error(`请求失败: ${error.message}`);
          abortController.current = null;
        },
        controller,
      );
    } catch (error) {
      message.error('发送消息失败，请重试');
      console.error('发送错误:', error);
    }
  };

  // 清空对话
  const clearConversation = () => {
    if (status === 'pending') {
      stopReply();
    }

    setMessages([]);
    setFileList([]);
    setValue('');
    setLines([]);
    linesRef.current = [];
    setStatus(undefined);
    clearLocalStorage();
    message.success('对话已清空');
  };

  // 处理代码编辑
  const handleEditCode = (code: string, codeBlock: HTMLElement) => {
    setCurrentCodeBlock(codeBlock);
    setEditingCode(code);
    setEditModalOpen(true);
  };

  return (
    <Flex vertical className={styles.aiBox} gap={6}>
      {messages.length > 0 ? (
        <MessageRenderer
          messages={messages}
          streamingContent={streamingContent}
          status={status}
        />
      ) : (
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
            你好，我是即插智联，一款AIOT解决方案智能体！
          </div>
        </div>
      )}

      <FileList fileList={fileList} setFileList={setFileList} />

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
                      <FileUploader
                        fileList={fileList}
                        setFileList={setFileList}
                        disabled={status === 'pending'}
                      />
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

      {/* 代码块增强功能 */}
      <CodeBlockEnhancer
        messages={messages}
        status={status}
        onCompileSuccess={onCompileSuccess}
        onEditCode={handleEditCode}
      />

      {/* 编辑代码模态框 */}
      <EditCodeModal
        open={editModalOpen}
        initialCode={editingCode}
        title="编辑代码"
        onOk={(newCode: string) => {
          if (currentCodeBlock) {
            currentCodeBlock.innerHTML = newCode;
          }
          setEditModalOpen(false);
        }}
        onCancel={() => setEditModalOpen(false)}
      />
    </Flex>
  );
});

export default AIBox;
