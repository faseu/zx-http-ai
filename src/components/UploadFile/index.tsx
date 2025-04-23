import { uploadFile } from '@/components/UploadFile/service';
import { ProFormUploadButton } from '@ant-design/pro-components';
import type { ProFormFieldProps } from '@ant-design/pro-form';
import { Upload } from 'antd';
import React, { useEffect, useState } from 'react';

type WidthType = ProFormFieldProps['width'];

interface UploadFileProps {
  label?: string;
  name: string;
  onSuccess?: (res: any) => void;
  colProps?: Record<string, any>;
  width?: WidthType;
  initialValue?: string[];
  readonly?: boolean;
}

const UploadFile: React.FC<UploadFileProps> = ({
  label = '上传',
  onSuccess,
  colProps = { md: 12, xl: 8 },
  name = '',
  width = 'lg',
  initialValue = [],
  readonly = false,
}) => {
  const [fileList, setFileList] = useState<any[]>([]);
  useEffect(() => {
    if (initialValue && initialValue.length > 0) {
      setFileList(
        initialValue.map((url, index) => ({
          uid: `${index}`,
          name: `轨迹文件-${index}`,
          status: 'done',
          url,
          description: '', // 初始描述为空
        })),
      );
    }
  }, [initialValue]);

  const beforeUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadFile(formData);
      const result = (await response.json?.()) || response;
      console.log('上传成功:', result);
      const url = result?.data?.file_url;
      const newFile = {
        uid: `${Date.now()}`,
        name: file.name,
        status: 'done',
        url: url,
        description: '',
      };

      const newList = [newFile];
      setFileList(newList);
      onSuccess?.(newList);
    } catch (error) {
      console.error('上传失败:', error);
    }

    return Upload.LIST_IGNORE;
  };

  return (
    <ProFormUploadButton
      name={name}
      label={label}
      colProps={colProps}
      width={width}
      max={1}
      fieldProps={{
        name: 'file',
        listType: 'text',
        beforeUpload,
        fileList,
        onChange: ({ fileList }) => {
          if (readonly) return;
          setFileList(fileList); // 确保 UI 同步更新
        },
      }}
    />
  );
};

export default UploadFile;
