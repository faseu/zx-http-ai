import { normalizeUploadFileList } from '@/utils/common';
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload, UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload';
import React from 'react';

const { Dragger } = Upload;
interface UploadImageProps {
  category?: string;
  label?: string;
  name: string;
  onSuccess?: (res: any) => void;
  colProps?: Record<string, any>;
  initialValue?: string | string[];
  addDescription?: boolean;
  readonly?: boolean;
}

const UploadImage: React.FC<UploadImageProps> = ({
  onSuccess,
  name,
  initialValue,
}) => {
  console.log(initialValue);
  const props: UploadProps = {
    listType: 'picture',
    maxCount: 1,
    name: name,
    defaultFileList: normalizeUploadFileList(initialValue),
    customRequest: async (options) => {
      const { file, onSuccess: successCallback, onError } = options;
      const formData = new FormData();
      formData.append('img', file as RcFile); // 上传文件
      formData.append('filename', 'img'); // 原始文件名作为额外参数传给后端
      try {
        const response = await fetch('/admin/upload/upimage', {
          method: 'POST',
          body: formData,
        });
        const res = await response.json();
        const {
          code,
          data: { url },
          msg,
        } = res;

        if (code === 10000) {
          message.success('上传成功');
          successCallback?.(res);
          onSuccess?.(url);
        } else {
          throw new Error(msg || '上传失败');
        }
      } catch (err: any) {
        message.error(err.message || '上传出错');
        onError?.(err);
      }
    },
    onChange(info) {
      if (info.fileList.length === 0) {
        onSuccess?.(null); // 👈 文件被清空时通知父组件
      }
    },
  };

  return (
    <Dragger {...props}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">上传自己的图片</p>
      <p className="ant-upload-hint">
        支持 JPG,PNG 格式（最大5MB,建议尺寸554*372）
      </p>
    </Dragger>
  );
};

export default UploadImage;
