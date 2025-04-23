import type { ProFormInstance } from '@ant-design/pro-components';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { ProFormSwitch } from '@ant-design/pro-form';
import { Modal, Space } from 'antd';
import React, { useEffect, useRef } from 'react';

interface SettingFormProps {
  modalVisible: boolean;
  onCancel: () => void;
  onSubmit: (values: ActivitiesType.EditorItem) => void;
  current?: Partial<ActivitiesType.EditorItem>; // ✅ 支持传入编辑数据
}

const SettingActivitiesTypeForm: React.FC<SettingFormProps> = ({
  modalVisible,
  onCancel,
  onSubmit,
  current,
}) => {
  const formRef = useRef<ProFormInstance>();

  // ✅ 当 current 变化或打开弹窗时设置初始值
  useEffect(() => {
    if (modalVisible && current) {
      formRef.current?.setFieldsValue(current);
    }
  }, [modalVisible, current]);

  return (
    <Modal
      destroyOnClose
      width={420}
      title={current?.id ? '编辑账号' : '新增账号'} // ✅ 动态标题
      open={modalVisible}
      onCancel={onCancel}
      footer={null}
    >
      <ProForm
        formRef={formRef}
        onFinish={async (values) => {
          // ✅ 如果是编辑，带上 id
          if (current?.id) {
            values.id = current.id;
          }
          onSubmit(values as ActivitiesType.EditorItem);
        }}
        submitter={{
          render: (_, dom) => (
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {dom[1]}
            </Space>
          ),
        }}
        initialValues={{
          can_review: true,
          can_delete: true,
          can_view: true,
          can_edit: true,
        }}
      >
        <ProFormText name="username" label="账号" placeholder="请输入账号" />
        <ProFormText name="password" label="密码" placeholder="请输入密码" />
        <ProFormSwitch name="can_review" label="可以审核" />
        <ProFormSwitch name="can_delete" label="可以删除" />
        <ProFormSwitch name="can_view" label="可以查看" />
        <ProFormSwitch name="can_edit" label="可以编辑" />
      </ProForm>
    </Modal>
  );
};

export default SettingActivitiesTypeForm;
