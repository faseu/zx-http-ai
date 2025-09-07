import UploadFile from '@/components/UploadFile'; // 使用文件上传组件
import { Form, Input, Modal } from 'antd';

interface AddDirectiveModalProps {
  open: boolean;
  detail?: any; // 新增：编辑时的详情数据
  isEdit?: boolean; // 新增：是否为编辑模式
  onOk: (fieldsValue: any) => void;
  onCancel: () => void;
  styles?: any;
}

const AddDirectiveModal: React.FC<AddDirectiveModalProps> = ({
  open,
  detail = {}, // 默认空对象
  isEdit = false, // 默认为新增模式
  onOk,
  onCancel,
  styles,
}) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={isEdit ? '编辑源码' : '新增源码'}
      style={styles ? styles : { position: 'fixed', top: 332, right: 146 }}
      open={open}
      onOk={() => {
        form.validateFields().then((values: any) => {
          onOk(values);
        });
      }}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      destroyOnClose // 关闭时销毁表单，确保下次打开时数据正确
    >
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        layout="horizontal"
        initialValues={isEdit ? { ...detail } : {}}
        style={{ maxWidth: 490, marginTop: 20 }}
      >
        <Form.Item
          label="源码名称："
          rules={[{ required: true, message: '请输入协议名称' }]}
          name="otaName"
        >
          <Input placeholder="请输入协议名称" />
        </Form.Item>
        <Form.Item
          label="硬件厂家："
          rules={[{ required: true, message: '请输入硬件厂家' }]}
          name="reason"
        >
          <Input placeholder="请输入硬件厂家" />
        </Form.Item>
        <Form.Item
          label="设备型号："
          rules={[{ required: true, message: '请选择设备类型' }]}
          name="cateName"
        >
          <Input placeholder="请输入设备类型" />
        </Form.Item>
        <Form.Item
          label="源码文件："
          name="fileUrl"
          rules={[{ required: true, message: '请上传源码文件' }]}
        >
          <UploadFile
            name="fileUrl"
            label=""
            initialValue={detail.fileUrl}
            onSuccess={(value: any) => {
              console.log(value);
              form.setFieldValue('fileUrl', value);
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddDirectiveModal;
