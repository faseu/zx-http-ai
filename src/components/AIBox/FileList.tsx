import React, { useState } from 'react';
import { Button, Progress } from 'antd';
import {
  PaperClipOutlined,
  DownOutlined,
  UpOutlined,
  DeleteOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import { getFileIcon, formatFileSize } from './utils';
import type { FileWithStatus } from './types';

interface FileListProps {
  fileList: FileWithStatus[];
  setFileList: React.Dispatch<React.SetStateAction<FileWithStatus[]>>;
}

const FileList: React.FC<FileListProps> = ({ fileList, setFileList }) => {
  const [fileListCollapsed, setFileListCollapsed] = useState(false);

  if (fileList.length === 0) return null;

  return (
    <div
      style={{
        background: '#1f1f1f',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '8px',
        border: '1px solid #333',
      }}
    >
      {/* 文件列表头部 */}
      <div
        style={{
          fontSize: '12px',
          color: '#888',
          marginBottom: fileListCollapsed ? '0' : '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          padding: '4px 0',
          transition: 'all 0.3s ease',
        }}
        onClick={() => setFileListCollapsed(!fileListCollapsed)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <PaperClipOutlined />
          <span>已选择 {fileList.length} 个附件</span>
          {fileList.some((f) => f.isRestored) && (
            <span style={{ color: '#1890ff', fontSize: '10px' }}>
              (含 {fileList.filter((f) => f.isRestored).length} 个历史文件)
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#666',
            fontSize: '10px',
          }}
        >
          <span>{fileListCollapsed ? '展开' : '收起'}</span>
          {fileListCollapsed ? <DownOutlined /> : <UpOutlined />}
        </div>
      </div>

      {/* 文件列表内容 */}
      <div
        style={{
          maxHeight: fileListCollapsed ? '0' : '120px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease, opacity 0.3s ease',
          opacity: fileListCollapsed ? 0 : 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollbarWidth: 'thin',
          }}
        >
          {fileList.map((file) => (
            <div
              key={file.uid}
              style={{
                width: '100px',
                height: '100px',
                background: '#2a2a2a',
                borderRadius: '8px',
                border: file.isRestored ? '1px solid #1890ff' : '1px solid #404040',
                padding: '6px',
                boxSizing: 'border-box',
                position: 'relative',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* 历史文件标识 */}
              {file.isRestored && (
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: '2px',
                    background: '#1890ff',
                    color: '#fff',
                    fontSize: '8px',
                    padding: '1px 3px',
                    borderRadius: '2px',
                    lineHeight: '1',
                    zIndex: 1,
                  }}
                >
                  历史
                </div>
              )}

              {/* 删除按钮 */}
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => {
                  const newFileList = fileList.filter(
                    (item) => item.uid !== file.uid,
                  );
                  setFileList(newFileList);
                }}
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  color: '#ff4d4f',
                  padding: '1px',
                  height: 'auto',
                  minWidth: 'auto',
                  fontSize: '10px',
                  zIndex: 2,
                }}
              />

              {/* 文件图标和状态 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  justifyContent: 'center',
                  marginTop: '12px',
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '2px' }}>
                  {getFileIcon(file.name)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {file.uploadStatus === 'uploading' && (
                    <CloudUploadOutlined
                      style={{ color: '#1890ff', fontSize: '12px' }}
                    />
                  )}
                  {file.uploadStatus === 'success' && (
                    <span style={{ color: '#52c41a', fontSize: '12px' }}>✓</span>
                  )}
                  {file.uploadStatus === 'error' && (
                    <span style={{ color: '#ff4d4f', fontSize: '12px' }}>✗</span>
                  )}
                </div>
              </div>

              {/* 文件名 */}
              <div style={{ width: '100%', textAlign: 'center', marginBottom: '2px' }}>
                <div
                  style={{
                    fontSize: '10px',
                    color: '#fff',
                    lineHeight: '1.1',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                  }}
                >
                  {file.name}
                </div>
                <div style={{ fontSize: '9px', color: '#888', marginTop: '1px' }}>
                  {formatFileSize(file.size || 0)}
                </div>
              </div>

              {/* 上传进度条 */}
              {file.uploadStatus === 'uploading' && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    padding: '0 6px 6px 6px',
                  }}
                >
                  <Progress
                    percent={file.uploadProgress || 0}
                    size="small"
                    showInfo={false}
                    strokeColor="#1890ff"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileList;