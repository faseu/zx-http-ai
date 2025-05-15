import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, Upload } from 'antd';
import React from 'react';
interface UploadImageProps {
  category?: string;
  max?: number;
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

const UploadImage: React.FC<UploadImageProps> = () => {
  const props: UploadProps = {
    action: '/admin/upload/upimage',
    listType: 'picture',
  };
  return (
    <Upload {...props}>
      <Button icon={<UploadOutlined />}>Upload</Button>
    </Upload>
  );
};

export default UploadImage;
