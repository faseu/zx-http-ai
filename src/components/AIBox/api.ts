import { API_KEY, APP_ID } from './constants';
import type { FileWithStatus, ChatMessage } from './types';

// 上传文件到阿里云百炼
export const uploadFileToAI = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', 'file');

    const response = await fetch('/admin/upload/aifile', {
      method: 'POST',
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
    return result.data.fileId;
  } catch (error) {
    console.error('上传文件失败:', error);
    throw error;
  }
};

// 使用OpenAI兼容接口进行聊天
export const chatWithAI = async (
  messages: ChatMessage[],
  sessionFileIds: string[],
  onProgress: (content: string) => void,
  onComplete: (content: string) => void,
  onError: (error: Error) => void,
  abortController: AbortController
) => {
  try {
    const requestBody = {
      input: {
        messages: messages,
      },
      parameters: {
        max_tokens: 8192,
        incremental_output: true,
        rag_options: {
          session_file_ids: sessionFileIds.length > 0 ? sessionFileIds : [],
        },
      },
      debug: {},
    };

    const response = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/apps/${APP_ID}/completion`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'X-DashScope-SSE': 'enable',
        },
        body: JSON.stringify(requestBody),
        signal: abortController.signal,
      },
    );

    if (!response.ok) {
      throw new Error(
        `Chat API调用失败: ${response.status} ${response.statusText}`,
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    let accumulatedContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const dataStr = line.slice(5).trim();

          try {
            const parsed = JSON.parse(dataStr);
            const output = parsed.output || {};
            const text = output.text || '';
            const finishReason = output.finish_reason;

            if (text) {
              accumulatedContent += text;
              onProgress(accumulatedContent);
            }

            if (finishReason === 'stop') {
              onComplete(accumulatedContent);
              return;
            }
          } catch (err) {
            console.warn('解析 data 行失败:', err, dataStr);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      onError(error);
    }
  }
};