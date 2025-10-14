import { message } from 'antd';
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