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
  addSecondUser,
  delSecondUser,
  editSecondUser,
  getSecondUserList,
} from './service';

/**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: SecondUser.EditorItem) => {
  const hide = message.loading('正在添加');
  try {
    await addSecondUser({ ...fields });
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
const handleUpdate = async (fields: SecondUser.EditorItem) => {
  const hide = message.loading('正在更新');
  try {
    await editSecondUser(fields.id!, fields);
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
  record: SecondUser.TableItem,
  action: ActionType | undefined,
) => {
  const hide = message.loading('正在删除');
  try {
    await delSecondUser({
      user_id: record.id,
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
    useState<SecondUser.EditorItem | null>(null);
  const actionRef = useRef<ActionType>();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '账号',
      dataIndex: 'username',
    },
    {
      title: '可以审核',
      dataIndex: 'can_review',
      valueType: 'switch',
    },
    {
      title: '可以删除',
      dataIndex: 'can_delete',
      valueType: 'switch',
    },
    {
      title: '可以查看',
      dataIndex: 'can_view',
      valueType: 'switch',
    },
    {
      title: '可以编辑',
      dataIndex: 'can_edit',
      valueType: 'switch',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record, index, action) => (
        <>
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
  ] as ProColumns<SecondUser.TableItem, 'text'>[];

  return (
    <PageContainer
      header={{
        title: '用户管理',
      }}
    >
      <ProTable<SecondUser.TableItem>
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
          } = await getSecondUserList({
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
