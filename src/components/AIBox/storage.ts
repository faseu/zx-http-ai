import { message } from 'antd';
import { CHAT_HISTORY_KEY, CHAT_FILES_KEY } from './constants';
import type { FileWithStatus, ChatMessage } from './types';

// 保存完整的聊天会话到本地存储
export const saveSessionToLocalStorage = (
  messagesToSave: ChatMessage[],
  filesToSave: FileWithStatus[],
) => {
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messagesToSave));

    const filesToStore = filesToSave.map((file) => ({
      uid: file.uid,
      name: file.name,
      size: file.size,
      type: file.type,
      fileId: file.fileId,
      uploadStatus: file.uploadStatus,
      uploadProgress: file.uploadProgress,
      status: file.status,
    }));
    localStorage.setItem(CHAT_FILES_KEY, JSON.stringify(filesToStore));

    console.log('聊天会话已保存到本地存储：', {
      messages: messagesToSave.length,
      files: filesToStore.length,
    });
  } catch (error) {
    console.error('保存聊天会话失败:', error);

    if (error.name === 'QuotaExceededError') {
      try {
        const recentMessages = messagesToSave.slice(-30);
        const recentFiles = filesToSave.slice(-10).map((file) => ({
          uid: file.uid,
          name: file.name,
          size: file.size,
          type: file.type,
          fileId: file.fileId,
          uploadStatus: file.uploadStatus,
          uploadProgress: file.uploadProgress,
          status: file.status,
        }));

        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(recentMessages));
        localStorage.setItem(CHAT_FILES_KEY, JSON.stringify(recentFiles));
        message.warning('存储空间不足，已自动清理部分历史数据');
      } catch (retryError) {
        message.error('本地存储失败，对话记录可能无法保存');
      }
    }
  }
};

// 从本地存储加载聊天会话
export const loadSessionFromLocalStorage = (): {
  messages: ChatMessage[];
  files: FileWithStatus[];
} => {
  try {
    const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
    const savedFiles = localStorage.getItem(CHAT_FILES_KEY);

    let messages: ChatMessage[] = [];
    let files: FileWithStatus[] = [];

    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      if (Array.isArray(parsedHistory)) {
        messages = parsedHistory;
      }
    }

    if (savedFiles) {
      const parsedFiles = JSON.parse(savedFiles);
      if (Array.isArray(parsedFiles)) {
        files = parsedFiles.map((file) => ({
          ...file,
          status: file.uploadStatus === 'success' ? 'done' :
            file.uploadStatus === 'error' ? 'error' : 'uploading',
        }));
      }
    }

    return { messages, files };
  } catch (error) {
    console.error('加载聊天会话失败:', error);
    localStorage.removeItem(CHAT_HISTORY_KEY);
    localStorage.removeItem(CHAT_FILES_KEY);
    return { messages: [], files: [] };
  }
};

// 清空本地存储
export const clearLocalStorage = () => {
  try {
    localStorage.removeItem(CHAT_HISTORY_KEY);
    localStorage.removeItem(CHAT_FILES_KEY);
    console.log('已清空本地存储的聊天会话数据');
  } catch (error) {
    console.error('清空本地存储失败:', error);
  }
};