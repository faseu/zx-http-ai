import UploadImage from '@/components/UploadImage'; // 根据你的实际路径来引
import { Form, Input, Modal, Select } from 'antd';

interface AddDirectiveModalProps {
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
}

const AddDirectiveModal: React.FC<AddDirectiveModalProps> = ({
  open,
  onOk,
  onCancel,
}) => {
  return (
    <Modal
      title="新增协议"
      style={{ position: 'fixed', top: 332, right: 146 }}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        layout="horizontal"
        style={{ maxWidth: 490, marginTop: 20 }}
      >
        <Form.Item label="协议名称：">
          <Input placeholder="请输入设备名称" />
        </Form.Item>
        <Form.Item label="硬件厂家：">
          <Input placeholder="请输入设备位置" />
        </Form.Item>
        <Form.Item label="设备型号：">
          <Select placeholder="请选择设备类型">
            <Select.Option value="demo">Demo</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="协议文件：">
          <UploadImage name="" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddDirectiveModal;
