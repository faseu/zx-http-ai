import { request } from '@umijs/max';
import { message } from 'antd';
import React, { useEffect } from 'react';
import { removeAnySuffix } from './utils';

interface CodeBlockEnhancerProps {
  messages: any[];
  status?: string;
  onCompileSuccess?: (result: any) => void;
  onEditCode?: (
    code: string,
    codeBlock: HTMLElement,
    messageIndex: number,
    codeBlockIndex: number,
  ) => void;
}

const CodeBlockEnhancer: React.FC<CodeBlockEnhancerProps> = ({
  messages,
  status,
  onCompileSuccess,
  onEditCode,
}) => {
  useEffect(() => {
    if (status === 'pending') {
      return;
    }

    const timeoutId = setTimeout(() => {
      const codeBlocks = document.querySelectorAll('.markdown-body pre');
      let globalCodeBlockIndex = 0; // 全局代码块索引

      codeBlocks.forEach((block) => {
        if (
          block.querySelector('.copy-container') ||
          block.querySelector('.action-container')
        ) {
          return;
        }

        // 找到当前代码块属于哪个消息
        const messageElement = block.closest('[data-message-index]');
        const messageIndex = messageElement
          ? parseInt(messageElement.getAttribute('data-message-index') || '-1')
          : -1;

        // 如果无法通过DOM属性获取messageIndex，则使用估算方法
        let estimatedMessageIndex = messageIndex;
        if (messageIndex === -1) {
          // 根据当前代码块的位置估算属于哪个消息
          const allBubbles = document.querySelectorAll('.ant-bubble');
          let currentCodeBlockCount = 0;

          for (let i = 0; i < allBubbles.length; i++) {
            const bubble = allBubbles[i];
            const bubbleCodeBlocks = bubble.querySelectorAll('pre');

            if (Array.from(bubbleCodeBlocks).includes(block as Element)) {
              estimatedMessageIndex = i;
              currentCodeBlockCount = Array.from(bubbleCodeBlocks).indexOf(
                block as Element,
              );
              break;
            }
          }
        }

        // 检查消息角色，如果是用户消息则不添加按钮
        if (
          estimatedMessageIndex >= 0 &&
          estimatedMessageIndex < messages.length
        ) {
          const message = messages[estimatedMessageIndex];
          if (message && message.role === 'user') {
            return; // 跳过用户消息的代码块，不添加按钮
          }
        }

        // 创建复制按钮容器
        const copyContainer = document.createElement('div');
        copyContainer.className = 'copy-container';
        copyContainer.style.position = 'absolute';
        copyContainer.style.top = '8px';
        copyContainer.style.right = '8px';

        // 创建功能按钮容器
        const actionContainer = document.createElement('div');
        actionContainer.className = 'action-container';
        actionContainer.style.position = 'absolute';
        actionContainer.style.bottom = '8px';
        actionContainer.style.right = '8px';
        actionContainer.style.display = 'flex';
        actionContainer.style.gap = '8px';
        actionContainer.style.alignItems = 'center';

        // 复制按钮
        const copyButton = createCopyButton(block);

        // 编辑按钮（传递位置信息）
        const editButton = createEditButton(
          block,
          estimatedMessageIndex,
          globalCodeBlockIndex,
          onEditCode,
        );

        // 编译按钮
        const compileButton = createCompileButton(block, onCompileSuccess);

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

        // 应用样式
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

        // 添加悬停效果
        addHoverEffect(copyButton);
        addHoverEffect(editButton);
        addHoverEffect(compileButton);

        // 添加按钮到容器
        copyContainer.appendChild(copyButton);
        actionContainer.appendChild(editButton);
        actionContainer.appendChild(compileButton);

        // 设置代码块样式并添加按钮容器
        block.style.position = 'relative';
        block.appendChild(copyContainer);
        block.appendChild(actionContainer);

        // 为代码块添加唯一标识
        block.setAttribute(
          'data-code-block-index',
          globalCodeBlockIndex.toString(),
        );
        block.setAttribute(
          'data-message-index',
          estimatedMessageIndex.toString(),
        );

        globalCodeBlockIndex++;
      });
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [messages, status, onCompileSuccess, onEditCode]);

  return null; // 这个组件不渲染任何内容，只是处理副作用
};

// 创建复制按钮
const createCopyButton = (block: Element) => {
  const button = document.createElement('button');
  button.className = 'copy-btn';
  button.textContent = '复制';
  button.onclick = async () => {
    const rawCode = block.textContent || '';
    const code = removeAnySuffix(rawCode, '\n复制\n编辑\n提交编译');
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = '已复制';
      setTimeout(() => (button.textContent = '复制'), 1500);
    } catch (err) {
      button.textContent = '失败';
      setTimeout(() => (button.textContent = '复制'), 1500);
    }
  };
  return button;
};

// 创建编辑按钮
const createEditButton = (
  block: Element,
  estimatedMessageIndex: number,
  globalCodeBlockIndex: number,
  onEditCode?: (
    code: string,
    codeBlock: HTMLElement,
    estimatedMessageIndex: number,
    globalCodeBlockIndex: number,
  ) => void,
) => {
  const button = document.createElement('button');
  button.className = 'edit-btn';
  button.textContent = '编辑';
  button.onclick = () => {
    const codeElement = block.querySelector('code');
    const originalCode = codeElement
      ? codeElement.textContent || ''
      : block.textContent || '';
    if (onEditCode) {
      onEditCode(
        originalCode,
        codeElement || (block as HTMLElement),
        estimatedMessageIndex,
        globalCodeBlockIndex,
      );
    }
  };
  return button;
};

// 创建编译按钮
const createCompileButton = (
  block: Element,
  onCompileSuccess?: (result: any) => void,
) => {
  const button = document.createElement('button');
  button.className = 'compile-btn';
  button.textContent = '提交编译';
  button.onclick = async () => {
    const rawCode = block.textContent || '';
    const code = removeAnySuffix(rawCode, '复制\n编辑\n提交编译');

    button.textContent = '编译中...';
    button.disabled = true;

    try {
      // 上传代码文件
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

      // 提交编译
      const compileResult = await request('/admin/Ai_Log/compiler', {
        method: 'POST',
        data: {
          id: uploadResult.id,
          url: uploadResult.url,
        },
      });

      if (!compileResult.compileId) {
        message.error('编译失败');
        button.textContent = '编译失败';
        button.disabled = false;
        setTimeout(() => {
          button.textContent = '提交编译';
        }, 3000);
        return;
      }

      message.success('编译已提交');

      // 轮询编译结果
      await pollCompileResult(
        uploadResult,
        button,
        compileResult,
        onCompileSuccess,
      );
    } catch (error) {
      console.error('编译错误:', error);
      button.textContent = '编译失败';
      button.disabled = false;
      message.error('编译失败，请重试');

      setTimeout(() => {
        button.textContent = '提交编译';
      }, 3000);
    }
  };
  return button;
};

// 轮询编译结果
const pollCompileResult = async (
  uploadResult: any,
  button: HTMLButtonElement,
  compileResult: any,
  onCompileSuccess?: (result: any) => void,
) => {
  let pollCount = 0;
  const maxPolls = 30;
  const pollInterval = 1000;

  const poll = async () => {
    try {
      const statusResult = await request('/admin/Ai_Log/get_compiler', {
        method: 'POST',
        data: {
          id: uploadResult.id,
          url: uploadResult.url,
        },
      });

      if (statusResult === 'success') {
        button.textContent = '编译完成';
        button.disabled = false;
        message.success('代码编译成功！');

        setTimeout(() => {
          if (onCompileSuccess) {
            onCompileSuccess({ url: compileResult });
          }
        }, 1000);

        setTimeout(() => {
          button.textContent = '提交编译';
        }, 3000);
        return;
      }

      pollCount++;
      if (pollCount < maxPolls) {
        button.textContent = `编译中... (${pollCount}/${maxPolls})`;
        setTimeout(poll, pollInterval);
      } else {
        button.textContent = '编译超时';
        button.disabled = false;
        message.warning('编译查询超时，请稍后手动查看结果');
        setTimeout(() => {
          button.textContent = '提交编译';
        }, 3000);
      }
    } catch (pollError) {
      console.error('轮询编译状态失败:', pollError);
      button.textContent = '查询失败';
      button.disabled = false;
      message.error('编译状态查询失败');
      setTimeout(() => {
        button.textContent = '提交编译';
      }, 3000);
    }
  };

  setTimeout(poll, pollInterval);
};

// 添加悬停效果
const addHoverEffect = (button: HTMLButtonElement) => {
  button.onmouseenter = () => {
    button.style.opacity = '0.8';
    button.style.transform = 'translateY(-1px)';
  };
  button.onmouseleave = () => {
    button.style.opacity = '1';
    button.style.transform = 'translateY(0)';
  };
};

export default CodeBlockEnhancer;
