import UploadImage from '@/components/UploadImage'; // 根据你的实际路径来引
import { Form, Input, Modal, Select } from 'antd';

interface AddMachineModalProps {
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
}

const AddMachineModal: React.FC<AddMachineModalProps> = ({
  open,
  onOk,
  onCancel,
}) => {
  return (
    <Modal
      title="新增设备"
      style={{ position: 'fixed', top: 132, right: 146 }}
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
        <Form.Item label="设备名称：">
          <Input placeholder="请输入设备名称" />
        </Form.Item>

        <Form.Item label="设备类型：">
          <Select placeholder="请选择设备类型">
            <Select.Option value="demo">Demo</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="设备用途：">
          <Select placeholder="请选择设备用途">
            <Select.Option value="demo">Demo</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="设备位置：">
          <Input placeholder="请输入设备位置" />
        </Form.Item>
        <Form.Item label="设备图片：">
          <UploadImage name="" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddMachineModal;
