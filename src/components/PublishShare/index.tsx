import UploadDraggerFile from '@/components/UploadDraggerFile';
import UploadDraggerImage from '@/components/UploadDraggerImage';
import { tabsForm } from '@/utils/config';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Modal, Select, Space } from 'antd';
import React, { useState } from 'react';
import styles from './index.less';
const { TextArea } = Input;

interface PublishShareModalProps {
  open: boolean;
  onOk: (fieldsValue: any) => void;
  onCancel: () => void;
}

const PublishShareModal: React.FC<PublishShareModalProps> = ({
  open,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [selectedCover, setSelectedCover] = useState<string>('');

  // 预设的封面图片
  const defaultCovers = [
    'https://yuzhijielian.com/uploads/images/20251126/b24c02b9cfadd1f013877267127c0d5e.jpg',
    'https://yuzhijielian.com/uploads/images/20251126/6321fd7eea8bc5a6a592b45f5e11ad36.jpg',
    'https://yuzhijielian.com/uploads/images/20251126/d33879b5d14c13b6b8fcc1c287e3778c.jpg',
    'https://yuzhijielian.com/uploads/images/20251126/4bf3fb21e3831f1b3e16cfbabe15e365.jpg',
  ];

  // 选中预设封面
  const handleCoverSelect = (coverUrl: string) => {
    setSelectedCover(coverUrl);
    form.setFieldValue('img', coverUrl);
  };

  return (
    <Modal
      title="发布内容"
      open={open}
      width={700}
      onOk={() => {
        form.validateFields().then((values: any) => {
          onOk({
            ...values,
            materialList: JSON.stringify(values.materialList),
            tag: values.tag.join(','),
          });
        });
      }}
      onCancel={() => {
        onCancel();
      }}
      destroyOnClose // 关闭时销毁表单，确保下次打开时数据正确
    >
      <div className={styles.content}>
        <Form form={form} layout="vertical">
          <Form.Item
            label="封面图片："
            rules={[{ required: true, message: '请选择或上传封面图片' }]}
            name="img"
          >
            <div className={styles.coverContainer}>
              <div className={styles.imageGrid}>
                {defaultCovers.map((coverUrl, index) => (
                  <img
                    key={index}
                    src={coverUrl}
                    alt={`封面${index + 1}`}
                    className={`${styles.coverImage} ${
                      selectedCover === coverUrl ? styles.selected : ''
                    }`}
                    onClick={() => handleCoverSelect(coverUrl)}
                  />
                ))}
              </div>
              <div className={styles.divider}>或者</div>
              <div className={styles.componentBox}>
                <UploadDraggerImage
                  name="img"
                  onSuccess={(value: any) => {
                    console.log(value);
                    setSelectedCover(''); // 清除预设封面选择
                    form.setFieldValue('img', value);
                  }}
                />
              </div>
            </div>
          </Form.Item>

          <Form.Item
            label="内容名称："
            rules={[{ required: true, message: '请输入内容名称' }]}
            name="name"
          >
            <Input
              size="large"
              style={{ width: '100%' }}
              placeholder="请输入内容名称"
            />
          </Form.Item>
          <Form.Item
            label="指令描述："
            rules={[{ required: true, message: '请输入指令描述' }]}
            name="content"
          >
            <TextArea rows={5} style={{ width: '100%' }} onChange={(e) => {}} />
          </Form.Item>
          <Form.Item
            label="功能说明："
            rules={[{ required: true, message: '请输入指令描述' }]}
            name="remark"
          >
            <TextArea rows={5} style={{ width: '100%' }} onChange={(e) => {}} />
          </Form.Item>
          <Form.Item
            label="标签："
            rules={[{ required: true, message: '请输入指令描述' }]}
            name="tag"
          >
            <Select
              size="large"
              mode="tags"
              style={{ width: '100%' }}
              options={tabsForm}
            />
          </Form.Item>
          <Form.Item label="材料清单">
            <Form.List name="materialList">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: 'flex', marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: '请输入材料名称' }]}
                      >
                        <Input size="large" placeholder="请输入材料名称" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, '数量']}
                        rules={[{ required: true, message: '请输入数量' }]}
                      >
                        <InputNumber size="large" min={1} placeholder="数量" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, '购买连接']}
                        rules={[{ required: true, message: '请输入购买连接' }]}
                      >
                        <Input
                          size="large"
                          style={{ width: '100%' }}
                          placeholder="请输入购买连接"
                        />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      size="large"
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      添加材料
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item label="3D打印文件：" name="3dfile">
            <UploadDraggerFile
              name="3dfile"
              onSuccess={(value: any) => {
                console.log(value);
                form.setFieldValue('3dfile', value);
              }}
            />
          </Form.Item>
          <Form.Item
            label="协议文档："
            name="otafile"
            rules={[{ required: true, message: '请上传协议文档' }]}
          >
            <UploadDraggerFile
              name="otafile"
              onSuccess={(value: any) => {
                console.log(value);
                form.setFieldValue('otafile', value);
              }}
            />
          </Form.Item>
          <Form.Item
            label="实现代码："
            name="code"
            rules={[{ required: true, message: '请上传实现代码' }]}
          >
            <UploadDraggerFile
              name="code"
              onSuccess={(value: any) => {
                console.log(value);
                form.setFieldValue('code', value);
              }}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default PublishShareModal;
