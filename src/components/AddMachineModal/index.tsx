import UploadImage from '@/components/UploadImage'; // 根据你的实际路径来引
import { Form, Input, Modal, Select } from 'antd';
import { DefaultOptionType } from 'rc-select/es/Select';

interface AddMachineModalProps {
  open: boolean;
  cateList: DefaultOptionType[];
  onOk: (fieldsValue: any) => void;
  onCancel: () => void;
}

const AddMachineModal: React.FC<AddMachineModalProps> = ({
  open,
  cateList,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();
  return (
    <Modal
      title="新增设备"
      style={{ position: 'fixed', top: 132, right: 146 }}
      open={open}
      onOk={() => {
        form.validateFields().then((values: any) => {
          onOk(values);
        });
      }}
      onCancel={onCancel}
    >
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        layout="horizontal"
        style={{ maxWidth: 490, marginTop: 20 }}
      >
        <Form.Item
          label="设备名称："
          name="machineName"
          rules={[{ required: true }]}
        >
          <Input placeholder="请输入设备名称" />
        </Form.Item>
        <Form.Item
          label="设备编号："
          name="deviceId"
          rules={[{ required: true }]}
        >
          <Input placeholder="请输入设备编号" />
        </Form.Item>
        <Form.Item label="设备序列号：" name="sn" rules={[{ required: true }]}>
          <Input placeholder="请输入设备序列号" />
        </Form.Item>
        <Form.Item label="设备类型：" name="cate" rules={[{ required: true }]}>
          <Select placeholder="请选择设备类型" options={cateList} />
        </Form.Item>
        <Form.Item
          label="设备用途："
          name="application"
          rules={[{ required: true }]}
        >
          <Select placeholder="请选择设备用途">
            <Select.Option value="用途1">用途1</Select.Option>
            <Select.Option value="用途2">用途2</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="设备位置："
          name="address"
          rules={[{ required: true }]}
        >
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
