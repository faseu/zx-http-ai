import { Form, Input, Modal } from 'antd';
const { TextArea } = Input;

interface AddAiDialogueModalProps {
  open: boolean;
  detail?: any;
  isEdit?: any;
  onOk: (fieldsValue: any) => void;
  onCancel: () => void;
  styles?: any;
}

const AddAiDialogueModal: React.FC<AddAiDialogueModalProps> = ({
  open,
  isEdit = false,
  detail = {},
  onOk,
  onCancel,
  styles,
}) => {
  const [form] = Form.useForm();
  return (
    <Modal
      title={isEdit ? '编辑指令' : '新增指令'}
      style={styles ? styles : { position: 'fixed', top: 162, right: 146 }}
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
        labelCol={{ span: 0 }}
        labelAlign="left"
        wrapperCol={{ span: 25 }}
        layout="horizontal"
        initialValues={isEdit ? { ...detail } : {}}
        style={{ maxWidth: 490, marginTop: 20 }}
      >
        <Form.Item name="content" rules={[{ required: true }]}>
          <TextArea rows={7} placeholder="请输入指令内容" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddAiDialogueModal;
