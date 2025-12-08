// src/pages/machine/components/DetailMachineModal/ConfigParamsModal.tsx
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Modal, Space } from 'antd';
import React from 'react';

interface ConfigParamsModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialValues?: any;
}

const ConfigParamsModal: React.FC<ConfigParamsModalProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
      message.success('配置保存成功');
    } catch (error) {
      message.error('请检查表单填写');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="配置参数"
      open={open}
      onCancel={handleCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          保存配置
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={
          initialValues || {
            params: [{ fieldName: '', parsePath: '', unit: '' }],
          }
        }
      >
        <Card title="数据解析配置" size="small">
          <Form.List name="params">
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
                      name={[name, 'fieldName']}
                      label="字段名称"
                      rules={[{ required: true, message: '请输入字段名称' }]}
                    >
                      <Input placeholder="例如: 温度" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'parsePath']}
                      label="解析路径"
                      rules={[{ required: true, message: '请输入解析路径' }]}
                    >
                      <Input placeholder="例如: msg.data.temperature" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'unit']}
                      label="单位"
                      rules={[{ required: true, message: '请输入单位' }]}
                    >
                      <Input placeholder="例如: °C" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加参数配置
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>
      </Form>
    </Modal>
  );
};

export default ConfigParamsModal;
