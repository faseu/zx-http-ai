import UploadImage from '@/components/UploadImage'; // 根据你的实际路径来引
import { Form, Input, Modal, Select } from 'antd';
import { DefaultOptionType } from 'rc-select/es/Select';

interface AddDirectiveModalProps {
  open: boolean;
  cateList: DefaultOptionType[];
  onOk: (fieldsValue: any) => void;
  onCancel: () => void;
}

const AddDirectiveModal: React.FC<AddDirectiveModalProps> = ({
  open,
  cateList,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();
  return (
    <Modal
      title="新增协议"
      style={{ position: 'fixed', top: 332, right: 146 }}
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
          label="协议名称："
          rules={[{ required: true }]}
          name="otaName"
        >
          <Input placeholder="请输入设备名称" />
        </Form.Item>
        <Form.Item
          label="硬件厂家："
          rules={[{ required: true }]}
          name="reason"
        >
          <Input placeholder="请输入硬件厂家" />
        </Form.Item>
        <Form.Item label="设备型号：" rules={[{ required: true }]} name="cate">
          <Select placeholder="请选择设备类型" options={cateList} />
        </Form.Item>
        <Form.Item label="协议文件：" name="fileUrl">
          <UploadImage name="" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddDirectiveModal;
