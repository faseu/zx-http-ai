import UploadDraggerImage from '@/components/UploadDraggerImage';
import { Form, Input, Modal } from 'antd';
import React from 'react';
import styles from './index.less';
const { TextArea } = Input;

interface UpgradeLogModalProps {
  open: boolean;
  onOk: (fieldsValue: any) => void;
  onCancel: () => void;
}

const UpgradeLogModal: React.FC<UpgradeLogModalProps> = ({
  open,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title="发布内容"
      open={open}
      width={700}
      onOk={() => {
        onOk(1);
      }}
      onCancel={() => {
        onCancel();
      }}
      destroyOnClose // 关闭时销毁表单，确保下次打开时数据正确
    >
      <div className={styles.content}>
        <Form form={form} layout="vertical">
          <div className={styles.coverContainer}>
            <div className={styles.coverTitle}>封面图片</div>
            <div className={styles.imageGrid}>
              <img
                src="http://temp.im/120x72"
                alt=""
                className={styles.coverImage}
              />
              <img
                src="http://temp.im/120x72"
                alt=""
                className={styles.coverImage}
              />
              <img
                src="http://temp.im/120x72"
                alt=""
                className={styles.coverImage}
              />
              <img
                src="http://temp.im/120x72"
                alt=""
                className={styles.coverImage}
              />
            </div>
            <div className={styles.divider}>或者</div>
            <UploadDraggerImage
              name="img"
              onSuccess={(value: any) => {
                console.log(value);
              }}
            />
          </div>
          <Form.Item
            label="内容名称："
            rules={[{ required: true, message: '请输入内容名称' }]}
            name="otaName"
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
            name="otaName"
          >
            <TextArea rows={5} style={{ width: '100%' }} onChange={(e) => {}} />
          </Form.Item>
          <Form.Item
            label="功能说明："
            rules={[{ required: true, message: '请输入指令描述' }]}
            name="otaName"
          >
            <TextArea rows={5} style={{ width: '100%' }} onChange={(e) => {}} />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default UpgradeLogModal;
