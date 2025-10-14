// 本地存储key
export const CHAT_HISTORY_KEY = 'ai_chat_history';
export const CHAT_FILES_KEY = 'ai_chat_files';

// API配置
export const API_KEY = 'sk-27b6793c7f634c038eb344a0d2bd39c9';
export const APP_ID = '8be55fe0f7c64c17b37ca66d9f629411';
export const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

// 文件配置
export const SUPPORTED_TEXT_FORMATS = [
  '.txt', '.docx', '.pdf', '.xlsx', '.epub', '.mobi', '.md', '.csv'
];

export const SUPPORTED_IMAGE_FORMATS = [
  '.bmp', '.png', '.jpg', '.jpeg', '.gif'
];

export const SUPPORTED_CODE_FORMATS = [
  '.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.cpp', '.c', '.h',
  '.xml', '.html', '.css', '.less', '.scss', '.yaml', '.yml',
  '.ini', '.conf', '.log', '.json'
];

export const MAX_FILES = 100;
export const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
export const MAX_FILE_SIZE = 150 * 1024 * 1024; // 150MB