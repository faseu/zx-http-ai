import {
  ActionType,
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib';
import { Button, message, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import SettingForm from './components/SettingForm';
import {
  addActivitiesType,
  delActivitiesType,
  editActivitiesType,
  getActivitiesTypeList,
} from './service';

/**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: ActivitiesType.EditorItem) => {
  const hide = message.loading('正在添加');
  try {
    await addActivitiesType({ ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败请重试！');
    return false;
  }
};

/**
 * 更新节点
 * @param fields
 */
const handleUpdate = async (fields: ActivitiesType.EditorItem) => {
  const hide = message.loading('正在更新');
  try {
    await editActivitiesType(fields.id!, fields);
    hide();
    message.success('更新成功');
    return true;
  } catch (error) {
    hide();
    message.error('更新失败请重试！');
    return false;
  }
};

/**
 *  删除节点
 * @param record
 * @param action
 */
const handleRemove = async (
  record: ActivitiesType.TableItem,
  action: ActionType | undefined,
) => {
  const hide = message.loading('正在删除');
  try {
    await delActivitiesType({
      id: record.id,
    });
    hide();
    message.success('删除成功，即将刷新');
    action?.reload();
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

/**
 *  获取列表
 */
const TableList: React.FC<unknown> = () => {
  const [createModalVisible, handleCreateModalVisible] =
    useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] =
    useState<boolean>(false);
  const [editFormValues, setEditFormValues] =
    useState<ActivitiesType.EditorItem | null>(null);
  const actionRef = useRef<ActionType>();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      hideInForm: true,
      hideInSearch: true,
    },
    {
      title: '名称',
      dataIndex: 'name',
      hideInForm: true,
      hideInSearch: true,
    },
    {
      title: 'Logo',
      dataIndex: 'logo',
      valueType: 'image',
      hideInForm: true,
      hideInSearch: true,
      render: (_, record) => (
        <img
          src={record.logo || ''}
          alt="logo"
          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      hideInForm: true,
      sorter: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      valueType: 'dateTime',
      hideInForm: true,
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record, index, action) => (
        <>
          <Button
            type="link"
            onClick={async () => {
              handleUpdateModalVisible(true);
              setEditFormValues(record);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            placement="topLeft"
            title="确定删除！"
            onConfirm={async () => {
              await handleRemove(record, action);
            }}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ] as ProColumns<ActivitiesType.TableItem, 'text'>[];

  return (
    <PageContainer
      header={{
        title: '活动类型',
      }}
    >
      <ProTable<ActivitiesType.TableItem>
        headerTitle="查询表格"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            key="1"
            type="primary"
            onClick={() => handleCreateModalVisible(true)}
          >
            新建
          </Button>,
        ]}
        request={async (params) => {
          const {
            data: { list, total },
          } = await getActivitiesTypeList({
            page_size: params.pageSize,
            page: params.current,
          });
          return {
            data: list || [],
            success: true,
            total: total,
          };
        }}
        columns={columns}
      />
      {createModalVisible && (
        <SettingForm
          modalVisible={createModalVisible}
          onCancel={() => handleCreateModalVisible(false)}
          onSubmit={async (values) => {
            const success = await handleAdd(values);
            if (success) {
              handleCreateModalVisible(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
        />
      )}
      {editFormValues && updateModalVisible && (
        <SettingForm
          current={editFormValues}
          modalVisible={updateModalVisible}
          onCancel={() => {
            handleUpdateModalVisible(false);
            setEditFormValues(null);
          }}
          onSubmit={async (values) => {
            const success = await handleUpdate(values);
            if (success) {
              handleUpdateModalVisible(false);
              setEditFormValues(null);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
        />
      )}
    </PageContainer>
  );
};

export default TableList;
