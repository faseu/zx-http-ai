
import type { UploadFile } from 'antd';

// 定义组件ref接口
export interface AIBoxRef {
  fillInput: (text: string) => void;
  addFile: (file: File) => Promise<void>;
}

// 定义 props 接口
export interface AIBoxProps {
  onCompileSuccess?: () => void;
}

// 定义文件状态接口
export interface FileWithStatus extends UploadFile {
  fileId?: string;
  uploadStatus?: 'uploading' | 'success' | 'error';
  uploadProgress?: number;
  isRestored?: boolean;
}

// 定义完整的聊天会话数据结构
export interface ChatSession {
  messages: any[];
  files: FileWithStatus[];
  timestamp: number;
}

// 消息接口
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}