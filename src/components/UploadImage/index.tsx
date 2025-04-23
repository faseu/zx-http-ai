import { uploadImage } from '@/components/UploadImage/service';
import { ProFormUploadButton } from '@ant-design/pro-components';
import { Input, Upload } from 'antd';
import React, { useEffect, useState } from 'react';

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

const UploadImage: React.FC<UploadImageProps> = ({
  category = 'default',
  max = 1,
  label = '上传图片',
  onSuccess,
  colProps = { md: 12, xl: 8 },
  name = '',
  initialValue = [],
  addDescription = false,
  readonly = false,
}) => {
  const [fileList, setFileList] = useState<any[]>([]);
  useEffect(() => {
    if (initialValue && initialValue.length > 0) {
      setFileList(
        initialValue?.map((item, index) => {
          const isObj = typeof item === 'object' && item !== null;
          return {
            uid: `${index}`,
            name: `image-${index}`,
            status: 'done',
            url: isObj ? item.url : item,
            description: isObj ? item.description : '', // 或者 undefined
          };
        }),
      );
    }
  }, [initialValue]);

  const beforeUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('images', file);
    formData.append('category', category);

    try {
      const response = await uploadImage(formData);
      const result = (await response.json?.()) || response;
      console.log('上传成功:', result);
      const imageUrl = result?.data?.successful[0]?.image_all;
      const newFile = {
        uid: `${Date.now()}`,
        name: file.name,
        status: 'done',
        url: imageUrl,
        description: '',
      };

      const newList = max === 1 ? [newFile] : [...fileList, newFile];
      setFileList(newList);
      onSuccess?.(newList);
    } catch (error) {
      console.error('上传失败:', error);
    }

    return Upload.LIST_IGNORE;
  };

  const handleDescriptionChange = (uid: string, value: string) => {
    const newList = fileList.map((file) =>
      file.uid === uid ? { ...file, description: value } : file,
    );
    setFileList(newList);
    onSuccess?.(newList);
  };

  const customItemRender = (originNode: any, file: any) => {
    return (
      <div style={{ marginBottom: 8 }}>
        {originNode}
        {addDescription && (
          <Input.TextArea
            placeholder="请输入图片描述"
            value={file.description}
            onChange={(e) => handleDescriptionChange(file.uid, e.target.value)}
            autoSize={{ minRows: 1, maxRows: 3 }}
            style={{ marginTop: 4 }}
          />
        )}
      </div>
    );
  };
  return (
    <ProFormUploadButton
      name={name}
      label={label}
      colProps={colProps}
      style={{ width: '100%' }}
      max={max}
      fieldProps={{
        name: 'file',
        listType: 'picture-card',
        beforeUpload,
        fileList,
        onChange: ({ fileList }) => {
          if (readonly) return;
          setFileList(fileList);
        },
        customRequest: () => {},
        itemRender: customItemRender,
      }}
    />
  );
};

export default UploadImage;
