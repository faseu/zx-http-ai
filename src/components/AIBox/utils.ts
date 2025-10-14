import { message } from 'antd';
import { getFileStatus } from '@/pages/machine/service';
import {
  SUPPORTED_TEXT_FORMATS,
  SUPPORTED_IMAGE_FORMATS,
  SUPPORTED_CODE_FORMATS,
  MAX_IMAGE_SIZE,
  MAX_FILE_SIZE,
} from './constants';
import type { FileWithStatus, ChatMessage } from './types';

// 获取文件图标
export const getFileIcon = (fileName: string): string => {
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
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// 检查文件类型和大小
export const validateFile = (file: File): boolean => {
  const allSupportedFormats = [
    ...SUPPORTED_TEXT_FORMATS,
    ...SUPPORTED_IMAGE_FORMATS,
    ...SUPPORTED_CODE_FORMATS,
  ];

  const fileName = file.name.toLowerCase();
  const isValidType = allSupportedFormats.some((ext) =>
    fileName.endsWith(ext),
  );

  if (!isValidType) {
    message.error(`不支持的文件类型: ${file.name}`);
    return false;
  }

  const isImage = SUPPORTED_IMAGE_FORMATS.some((ext) => fileName.endsWith(ext));
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

  if (file.size > maxSize) {
    message.error(
      `文件大小超出限制: ${file.name} (最大${isImage ? '20MB' : '150MB'})`,
    );
    return false;
  }

  return true;
};

// 构建包含file-id的消息
export const buildMessagesWithFiles = (
  userInput: string,
  files: FileWithStatus[],
  previousMessages: ChatMessage[],
): ChatMessage[] => {
  const messages: ChatMessage[] = [];

  // 添加成功上传的文件ID
  const successFiles = files.filter(
    (file) => file.fileId && file.uploadStatus === 'success',
  );

  successFiles.forEach((file) => {
    messages.push({
      role: 'system',
      content: `fileid://${file.fileId}`,
    });
  });

  // 添加历史消息（过滤系统消息和文件ID消息）
  previousMessages.forEach((msg) => {
    if (msg.role !== 'system' && !msg.content.startsWith('fileid://')) {
      let cleanContent = msg.content;
      if (msg.role === 'user') {
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

  return messages;
};

// 移除字符串末尾的指定后缀
export const removeAnySuffix = (str: string, suffixes: string): string => {
  return str.slice(0, -suffixes.length);
};

// 文件状态轮询函数
export const pollFileStatus = async (
  fileId: string, 
  fileUid: string,
  setFileList: React.Dispatch<React.SetStateAction<FileWithStatus[]>>
) => {
  const poll = async () => {
    try {
      const result = await getFileStatus({ fileId });
      const status = result?.status; // 修复：使用正确的数据结构
      
      console.log(`文件 ${fileId} 当前状态:`, status);
      
      switch (status) {
        case 'INIT':
        case 'PARSING':
        case 'SAFE_CHECKING':
        case 'INDEX_BUILDING':
          // 继续轮询
          setTimeout(poll, 3000);
          break;
          
        case 'PARSE_SUCCESS':
        case 'INDEX_BUILD_SUCCESS':
        case 'FILE_IS_READY':
          // 文件准备完毕，可以发送消息
          setFileList((prev) =>
            prev.map((item) =>
              item.uid === fileUid
                ? { ...item, fileStatus: status, canSendMessage: true }
                : item,
            ),
          );
          message.success(`文件解析成功，现在可以发送消息了！`);
          break;
          
        case 'PARSE_FAILED':
        case 'SAFE_CHECK_FAILED':
        case 'INDEX_BUILDING_FAILED':
        case 'FILE_EXPIRED':
          // 文件处理失败
          setFileList((prev) =>
            prev.map((item) =>
              item.uid === fileUid
                ? { 
                    ...item, 
                    uploadStatus: 'error', 
                    fileStatus: status,
                    canSendMessage: false 
                  }
                : item,
            ),
          );
          message.error(`文件处理失败: ${getStatusMessage(status)}`);
          break;
          
        default:
          // 未知状态，停止轮询
          console.warn('未知文件状态:', status);
          break;
      }
    } catch (error) {
      console.error('检查文件状态失败:', error);
      // 轮询出错，继续尝试
      setTimeout(poll, 3000);
    }
  };
  
  // 开始轮询
  setTimeout(poll, 3000);
};

// 获取状态描述信息
export const getStatusMessage = (status: string): string => {
  const statusMessages = {
    'INIT': '文件已上传，等待解析',
    'PARSING': '正在解析文件内容',
    'PARSE_SUCCESS': '文件解析成功',
    'PARSE_FAILED': '文件解析失败，需重新上传',
    'SAFE_CHECKING': '正在进行文件安全检测',
    'SAFE_CHECK_FAILED': '文件未通过安全检测，需重新上传或更换文件',
    'INDEX_BUILDING': '正在为文件构建索引',
    'INDEX_BUILD_SUCCESS': '文件索引构建完成',
    'INDEX_BUILDING_FAILED': '索引构建失败，需重新上传文件',
    'INDEX_DELETED': '文件索引已删除',
    'FILE_IS_READY': '文件准备完毕',
    'FILE_EXPIRED': '文件过期',
  };
  return statusMessages[status] || '未知状态';
};