import React from 'react';
import { Badge, Button, List, Progress, Space, Tag, Tooltip } from 'antd';
import { CloseOutlined, FileOutlined } from '@ant-design/icons';
import type { FileWithStatus } from './types';
import { formatFileSize } from './utils';

interface FileListProps {
  fileList: FileWithStatus[];
  setFileList: React.Dispatch<React.SetStateAction<FileWithStatus[]>>;
}

const FileList: React.FC<FileListProps> = ({ fileList, setFileList }) => {
  if (fileList.length === 0) return null;

  // 获取文件状态的显示信息
  const getFileStatusDisplay = (file: FileWithStatus) => {
    if (file.uploadStatus === 'uploading') {
      return { color: 'processing', text: '上传中' };
    }

    if (file.uploadStatus === 'error') {
      return { color: 'error', text: file.fileStatus === 'ERROR' ? '状态检查失败' : '上传失败' };
    }

    if (file.uploadStatus === 'success') {
      if (!file.fileStatus) {
        return { color: 'processing', text: file.isRestored ? '检查状态中...' : '等待解析' };
      }

      switch (file.fileStatus) {
        case 'INIT':
          return { color: 'processing', text: '等待解析' };
        case 'PARSING':
          return { color: 'processing', text: '解析中' };
        case 'PARSE_SUCCESS':
          return { color: 'success', text: '解析成功' };
        case 'SAFE_CHECKING':
          return { color: 'processing', text: '安全检测中' };
        case 'INDEX_BUILDING':
          return { color: 'processing', text: '构建索引中' };
        case 'INDEX_BUILD_SUCCESS':
          return { color: 'success', text: '索引构建完成' };
        case 'FILE_IS_READY':
          return { color: 'success', text: '准备就绪' };
        case 'PARSE_FAILED':
          return { color: 'error', text: '解析失败' };
        case 'SAFE_CHECK_FAILED':
          return { color: 'error', text: '安全检测失败' };
        case 'INDEX_BUILDING_FAILED':
          return { color: 'error', text: '索引构建失败' };
        case 'FILE_EXPIRED':
          return { color: 'error', text: '文件过期' };
        case 'ERROR':
          return { color: 'error', text: '状态检查失败' };
        default:
          return { color: 'default', text: '未知状态' };
      }
    }

    return { color: 'default', text: '等待中' };
  };

  const removeFile = (uid: string) => {
    setFileList((prev) => prev.filter((file) => file.uid !== uid));
  };

  return (
    <div style={{ marginBottom: 8 }}>
      <List
        size="small"
        dataSource={fileList}
        renderItem={(file) => {
          const statusDisplay = getFileStatusDisplay(file);
          const isProcessing = file.uploadStatus === 'success' && !file.canSendMessage;

          return (
            <List.Item
              key={file.uid}
              style={{
                padding: '8px 12px',
                background: '#2a2a2a',
                borderRadius: 6,
                marginBottom: 4,
                border: isProcessing ? '1px solid #1890ff' : 'none',
              }}
            >
              <Space style={{ width: '100%' }}>
                <FileOutlined style={{ color: '#1890ff' }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#fff',
                      marginBottom: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.name}
                    {file.isRestored && (
                      <Tag size="small" color="blue" style={{ marginLeft: 4 }}>
                        已恢复
                      </Tag>
                    )}
                  </div>

                  <Space size="small">
                    <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
                      {formatFileSize(file.size)}
                    </span>

                    <Tag color={statusDisplay.color} size="small">
                      {statusDisplay.text}
                    </Tag>

                    {isProcessing && (
                      <Badge status="processing" text="解析中..." />
                    )}
                  </Space>

                  {file.uploadStatus === 'uploading' && (
                    <Progress
                      percent={file.uploadProgress || 0}
                      size="small"
                      style={{ marginTop: 4 }}
                      strokeColor="#1890ff"
                    />
                  )}
                </div>

                <Tooltip title="移除文件">
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={() => removeFile(file.uid)}
                    style={{
                      color: '#8c8c8c',
                      fontSize: '12px',
                      width: 20,
                      height: 20,
                    }}
                  />
                </Tooltip>
              </Space>
            </List.Item>
          );
        }}
      />
    </div>
  );
};

export default FileList;