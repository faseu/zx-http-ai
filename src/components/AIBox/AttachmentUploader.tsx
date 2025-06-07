// src/components/AIBox/AttachmentUploader.tsx
import { DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Button, Upload, message } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import React from 'react';

interface AttachmentUploaderProps {
  fileList: UploadFile[];
  onChange: (fileList: UploadFile[]) => void;
  maxCount?: number;
  maxSize?: number; // MB
  accept?: string;
}

const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
                                                                 fileList,
                                                                 onChange,
                                                                 maxCount = 5,
                                                                 maxSize = 10,
                                                                 accept = '.txt,.md,.json,.csv,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.h,.xml,.html,.css,.less,.scss,.yaml,.yml,.ini,.conf,.log'
                                                               }) => {

  const uploadProps: UploadProps = {
    multiple: true,
    maxCount,
    fileList,
    beforeUpload: (file) => {
      // 检查文件类型
      const fileName = file.name.toLowerCase();
      const allowedExtensions = accept.split(',').map(ext => ext.trim());
      const isValidType = allowedExtensions.some(ext =>
        fileName.endsWith(ext.replace('.', '')) ||
        file.type?.includes('text') ||
        file.type?.includes('application/json') ||
        file.type?.includes('image')
      );

      if (!isValidType) {
        message.error(`不支持的文件类型: ${file.name}`);
        return false;
      }

      // 检查文件大小
      const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
      if (!isLtMaxSize) {
        message.error(`文件大小不能超过${maxSize}MB`);
        return false;
      }

      return false; // 阻止自动上传
    },
    onChange: (info) => {
      onChange(info.fileList);
    },
    onRemove: (file) => {
      const newFileList = fileList.filter(item => item.uid !== file.uid);
      onChange(newFileList);
    },
    showUploadList: false, // 使用自定义的文件列表显示
  };

  // 获取文件图标
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return '📄';
      case 'json':
        return '📋';
      case 'md':
        return '📝';
      case 'css':
      case 'less':
      case 'scss':
        return '🎨';
      case 'html':
        return '🌐';
      case 'py':
        return '🐍';
      case 'java':
        return '☕';
      case 'cpp':
      case 'c':
        return '⚙️';
      case 'txt':
      case 'log':
        return '📃';
      case 'csv':
        return '📊';
      case 'xml':
        return '📑';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return '🖼️';
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
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`;
  };

  return (
    <div style={{ width: '100%' }}>
      {/* 文件列表显示 */}
      {fileList.length > 0 && (
        <div style={{
          background: '#1f1f1f',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '8px',
          border: '1px solid #333'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#888',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <PaperClipOutlined />
            <span>已选择 {fileList.length} 个附件 (最多{maxCount}个)</span>
          </div>

          {fileList.map(file => (
            <div key={file.uid} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px',
              background: '#2a2a2a',
              borderRadius: '4px',
              marginBottom: '4px',
              border: '1px solid #404040'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1,
                overflow: 'hidden'
              }}>
                <span style={{ fontSize: '16px' }}>
                  {getFileIcon(file.name)}
                </span>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '13px',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {file.name}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#888'
                  }}>
                    {formatFileSize(file.size || 0)}
                  </div>
                </div>
              </div>

              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => {
                  const newFileList = fileList.filter(item => item.uid !== file.uid);
                  onChange(newFileList);
                }}
                style={{
                  color: '#ff4d4f',
                  padding: '2px 4px',
                  height: 'auto',
                  minWidth: 'auto'
                }}
              />
            </div>
          ))}

          <div style={{
            fontSize: '11px',
            color: '#666',
            marginTop: '4px',
            textAlign: 'center'
          }}>
            支持: {accept.split(',').slice(0, 8).join(', ')}
            {accept.split(',').length > 8 && ' 等'}
          </div>
        </div>
      )}

      {/* 上传按钮 */}
      <Upload {...uploadProps}>
        <Button
          type="text"
          icon={<PaperClipOutlined />}
          disabled={fileList.length >= maxCount}
          style={{
            width: 42,
            height: 42,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: fileList.length >= maxCount ? 0.5 : 1
          }}
          title={fileList.length >= maxCount ? `最多只能上传${maxCount}个文件` : '添加附件'}
        />
      </Upload>
    </div>
  );
};

export default AttachmentUploader;