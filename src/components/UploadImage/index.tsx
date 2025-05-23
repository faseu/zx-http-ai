import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, Upload, message } from 'antd';
import type { RcFile } from 'antd/es/upload';
import React from 'react';

interface UploadImageProps {
  category?: string;
  label?: string;
  name: string;
  onSuccess?: (res: any) => void;
  colProps?: Record<string, any>;
  initialValue?:
    | string[]
    | {
        url: string;
        description: string;
      }[];
  addDescription?: boolean;
  readonly?: boolean;
}

const UploadImage: React.FC<UploadImageProps> = ({ onSuccess, name }) => {
  const props: UploadProps = {
    listType: 'picture',
    maxCount: 1,
    name: name,
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
    <Upload {...props}>
      <Button icon={<UploadOutlined />}>Upload</Button>
    </Upload>
  );
};

export default UploadImage;
