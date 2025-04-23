import UploadImage from '@/components/UploadImage';
import type { ProFormInstance } from '@ant-design/pro-components';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { message, Modal, Space } from 'antd';
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
      title={current?.id ? '编辑活动类型' : '新增活动类型'} // ✅ 动态标题
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
      >
        <ProFormText
          name="name"
          label="名称"
          placeholder="请输入活动类型名称"
        />
        <UploadImage
          label="活动类型icon"
          name="logo"
          category="activity"
          max={1}
          onSuccess={(filesList) => {
            console.log(filesList);
            formRef.current?.setFieldValue('logo', filesList[0]?.url);
            message.success('活动类型icon上传成功');
          }}
          // ✅ 初始回显 fileList
          initialValue={current?.logo ? [current.logo] : []}
        />
      </ProForm>
    </Modal>
  );
};

export default SettingActivitiesTypeForm;
