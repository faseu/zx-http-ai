import React from 'react';
import { Button, Upload, message, UploadProps } from 'antd';
import { PaperClipOutlined } from '@ant-design/icons';
import { validateFile, formatFileSize, pollFileStatus } from './utils';
import { uploadFileToAI } from './api';
import { MAX_FILES } from './constants';
import type { FileWithStatus } from './types';
import { getFileStatus } from '@/pages/machine/service';

interface FileUploaderProps {
  fileList: FileWithStatus[];
  setFileList: React.Dispatch<React.SetStateAction<FileWithStatus[]>>;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
                                                     fileList,
                                                     setFileList,
                                                     disabled = false,
                                                   }) => {
  const handleCustomUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;

    setFileList((prev) =>
      prev.map((item) =>
        item.uid === file.uid
          ? { ...item, uploadStatus: 'uploading', uploadProgress: 0, canSendMessage: false }
          : item,
      ),
    );

    try {
      let progressValue = 0;
      const progressInterval = setInterval(() => {
        progressValue += 10;
        if (progressValue <= 90) {
          setFileList((prev) =>
            prev.map((item) =>
              item.uid === file.uid
                ? { ...item, uploadProgress: progressValue }
                : item,
            ),
          );
        }
      }, 200);

      const fileId = await uploadFileToAI(file);
      
      // 立即获取一次文件状态
      const initialResult = await getFileStatus({ fileId });
      const initialStatus = initialResult?.data?.status;
      
      clearInterval(progressInterval);

      const isReady = ['PARSE_SUCCESS', 'INDEX_BUILD_SUCCESS', 'FILE_IS_READY'].includes(initialStatus);

      setFileList((prev) =>
        prev.map((item) =>
          item.uid === file.uid
            ? {
              ...item,
              uploadStatus: 'success',
              uploadProgress: 100,
              fileId: fileId,
              status: 'done',
              fileStatus: initialStatus,
              canSendMessage: isReady,
            }
            : item,
        ),
      );

      onSuccess({ fileId }, file);
      
      if (isReady) {
        message.success(`${file.name} 上传成功，文件解析成功，现在可以发送消息了！`);
      } else {
        message.success(`${file.name} 上传成功，正在解析文件...`);
        // 开始轮询检查文件状态
        pollFileStatus(fileId, file.uid, setFileList);
      }
      
    } catch (error) {
      console.error('上传失败:', error);

      setFileList((prev) =>
        prev.map((item) =>
          item.uid === file.uid
            ? { ...item, uploadStatus: 'error', uploadProgress: 0, canSendMessage: false }
            : item,
        ),
      );

      onError(error);
      message.error(`${file.name} 上传失败: ${error.message}`);
    }
  };

  const uploadProps: UploadProps = {
    accept: '.txt,.docx,.pdf,.xlsx,.epub,.mobi,.md,.csv,.bmp,.png,.jpg,.jpeg,.gif',
    multiple: true,
    maxCount: MAX_FILES,
    fileList,
    customRequest: handleCustomUpload,
    beforeUpload: validateFile,
    onChange: (info) => {
      setFileList((prev) => {
        return info.fileList.map((newFile) => {
          const existingFile = prev.find(f => f.uid === newFile.uid) as FileWithStatus;
          if (existingFile) {
            return {
              ...newFile,
              uploadStatus: existingFile.uploadStatus,
              uploadProgress: existingFile.uploadProgress,
              fileId: existingFile.fileId,
            } as FileWithStatus;
          }
          return newFile as FileWithStatus;
        });
      });
    },
    onRemove: (file) => {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
    },
    showUploadList: false,
  };

  return (
    <Upload {...uploadProps}>
      <Button
        type="text"
        icon={<PaperClipOutlined />}
        disabled={disabled || fileList.length >= MAX_FILES}
        style={{
          width: 42,
          height: 42,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#141414',
          fontSize: '16px',
          borderRadius: '50%',
          opacity: disabled || fileList.length >= MAX_FILES ? 0.5 : 1,
        }}
        title={
          disabled
            ? 'AI正在回复中，无法上传文件'
            : fileList.length >= MAX_FILES
              ? '最多只能上传100个文件'
              : '上传长文档 (OpenAI SDK)'
        }
      />
    </Upload>
  );
};

export default FileUploader;