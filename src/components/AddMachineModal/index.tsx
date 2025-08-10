import UploadImage from '@/components/UploadImage'; // 根据你的实际路径来引
import { Form, Input, Modal } from 'antd';

interface AddMachineModalProps {
  open: boolean;
  detail: any;
  isEdit: any;
  onOk: (fieldsValue: any) => void;
  onCancel: () => void;
  styles: any;
}

const AddMachineModal: React.FC<AddMachineModalProps> = ({
  open,
  isEdit,
  detail,
  onOk,
  onCancel,
  styles,
}) => {
  const [form] = Form.useForm();
  return (
    <Modal
      title={isEdit ? '编辑设备' : '新增设备'}
      style={styles ? styles : { position: 'fixed', top: 132, right: 146 }}
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
        labelAlign="left"
        wrapperCol={{ span: 20 }}
        layout="horizontal"
        initialValues={isEdit ? { ...detail, img: detail.img } : {}}
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
        <Form.Item label="序列号：" name="sn" rules={[{ required: true }]}>
          <Input placeholder="请输入设备序列号" />
        </Form.Item>
        <Form.Item
          label="设备类型："
          name="cateName"
          rules={[{ required: true }]}
        >
          <Input placeholder="请输入设备类型" />
        </Form.Item>
        <Form.Item
          label="设备用途："
          name="application"
          rules={[{ required: true }]}
        >
          <Input placeholder="请输入设备用途" />
        </Form.Item>
        <Form.Item
          label="设备位置："
          name="address"
          rules={[{ required: true }]}
        >
          <Input placeholder="请输入设备位置" />
        </Form.Item>
        <Form.Item label="设备图片：" name="img" rules={[{ required: true }]}>
          <UploadImage
            name="img"
            initialValue={detail.img}
            onSuccess={(value: any) => {
              console.log(value);
              form.setFieldValue('img', value);
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddMachineModal;
