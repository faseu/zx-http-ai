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
import { getFileStatus } from '@/pages/machine/service';

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
      
      // 检查已加载文件的状态
      checkRestoredFilesStatus(loadedFiles);
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
          canSendMessage: false,
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
        
        // 获取初始状态
        const initialResult = await getFileStatus({ fileId });
        const initialStatus = initialResult?.data?.status;
        
        clearInterval(progressInterval);

        const isReady = ['PARSE_SUCCESS', 'INDEX_BUILD_SUCCESS', 'FILE_IS_READY'].includes(initialStatus);

        setFileList((prev) =>
          prev.map((item) =>
            item.uid === fileWithStatus.uid
              ? {
                  ...item,
                  uploadStatus: 'success',
                  uploadProgress: 100,
                  fileId: fileId,
                  status: 'done',
                  fileStatus: initialStatus,
                  canSendMessage: isReady,
                }
              : item,
          ),
        );

        if (isReady) {
          message.success(`文件 ${file.name} 已成功添加到AI对话中`);
        } else {
          message.success(`文件 ${file.name} 上传成功，正在解析中...`);
          // 这里需要调用轮询逻辑，但由于pollFileStatus在FileUploader中，
          // 我们需要将其提取到共用的工具函数中
        }
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

    // 检查是否有文件正在解析中
    const parsingFiles = fileList.filter(
      (file) => file.fileId && !file.canSendMessage && file.uploadStatus === 'success',
    );
    if (parsingFiles.length > 0) {
      message.warning('文件正在解析中，请等待解析完成后再发送消息');
      return;
    }

    const successFiles = fileList.filter(
      (file) => file.fileId && file.uploadStatus === 'success' && file.canSendMessage,
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

  // 检查已恢复文件的状态
  const checkRestoredFilesStatus = async (files: FileWithStatus[]) => {
    const filesToCheck = files.filter(
      (file) => file.fileId && file.uploadStatus === 'success'
    );

    if (filesToCheck.length === 0) return;

    console.log('检查已恢复文件状态:', filesToCheck.length, '个文件');

    for (const file of filesToCheck) {
      try {
        const result = await getFileStatus({ fileId: file.fileId });
        const status = result?.status;
        
        console.log(`文件 ${file.fileId} 状态:`, status);
        
        const isReady = ['PARSE_SUCCESS', 'INDEX_BUILD_SUCCESS', 'FILE_IS_READY'].includes(status);
        const isFailed = ['PARSE_FAILED', 'SAFE_CHECK_FAILED', 'INDEX_BUILDING_FAILED', 'FILE_EXPIRED'].includes(status);
        
        // 更新文件状态
        setFileList((prev) =>
          prev.map((item) =>
            item.uid === file.uid
              ? {
                  ...item,
                  fileStatus: status,
                  canSendMessage: isReady,
                  uploadStatus: isFailed ? 'error' : item.uploadStatus,
                  isRestored: true, // 标记为已恢复的文件
                }
              : item,
          ),
        );

        // 如果文件还在处理中，启动轮询
        const isProcessing = ['INIT', 'PARSING', 'SAFE_CHECKING', 'INDEX_BUILDING'].includes(status);
        if (isProcessing) {
          console.log(`文件 ${file.fileId} 正在处理中，启动轮询`);
          pollFileStatus(file.fileId!, file.uid, setFileList);
        } else if (isFailed) {
          message.warning(`文件 ${file.name} 处理失败: ${getStatusMessage(status)}`);
        }
      } catch (error) {
        console.error(`检查文件 ${file.fileId} 状态失败:`, error);
        // 如果检查失败，将文件标记为错误状态
        setFileList((prev) =>
          prev.map((item) =>
            item.uid === file.uid
              ? {
                  ...item,
                  uploadStatus: 'error',
                  canSendMessage: false,
                  fileStatus: 'ERROR',
                  isRestored: true,
                }
              : item,
          ),
        );
      }
    }
  };

  // 计算是否有文件正在解析
  const hasParsingFiles = useMemo(() => {
    return fileList.some(
      (file) => file.fileId && !file.canSendMessage && file.uploadStatus === 'success',
    );
  }, [fileList]);

  // 计算发送按钮是否应该禁用
  const isSendDisabled = useMemo(() => {
    return status === 'pending' || hasParsingFiles;
  }, [status, hasParsingFiles]);

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
                    : hasParsingFiles
                    ? '文件解析中，请等待解析完成...'
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
                        disabled={isSendDisabled}
                        icon={
                          <img
                            src="/admin/speech.png"
                            width={42}
                            height={42}
                            alt=""
                            style={{
                              opacity: isSendDisabled ? 0.5 : 1,
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
                          disabled={hasParsingFiles}
                          icon={
                            <img
                              src="/admin/send1.png"
                              width={42}
                              height={42}
                              alt=""
                              style={{
                                opacity: hasParsingFiles ? 0.5 : 1,
                              }}
                            />
                          }
                          title={
                            hasParsingFiles 
                              ? '文件解析中，请等待解析完成' 
                              : '发送消息'
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
