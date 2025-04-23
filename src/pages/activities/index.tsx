import {
  ActionType,
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib';
import { Button, Divider, message, Popconfirm } from 'antd';
import React, { useRef } from 'react';

import { history } from '@@/core/history';
import { LikeFilled } from '@ant-design/icons';
import { delActivities, getActivitiesList } from './service';

/**
 *  删除节点
 * @param record
 * @param action
 */
const handleRemove = async (
  record: Activities.TableItem,
  action: ActionType | undefined,
) => {
  const hide = message.loading('正在删除');
  try {
    await delActivities(record.id);
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
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<Activities.TableItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      hideInForm: true,
      hideInSearch: true,
    },
    {
      title: '名称',
      dataIndex: 'name',
      hideInForm: false,
      hideInSearch: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: '难度',
      dataIndex: 'star',
      valueType: 'rate',
      hideInSearch: true,
    },
    {
      title: '推荐指数',
      dataIndex: 'recommend_index',
      valueType: 'rate',
      hideInSearch: true,
      fieldProps: { character: <LikeFilled /> },
    },
    {
      title: '地点',
      dataIndex: 'location',
    },

    {
      title: '标签',
      dataIndex: 'activities_json',
      render: (_, record) => {
        let tags: string[] = [];

        if (Array.isArray(record.activities_json)) {
          tags = record.activities_json;
        } else if (
          typeof record.activities_json === 'object' &&
          record.activities_json !== null
        ) {
          tags = Object.values(record.activities_json);
        }

        return (
          <>
            {tags.map((tag: string, index: number) => (
              <span key={index} style={{ marginRight: 8 }}>
                {tag}
              </span>
            ))}
          </>
        );
      },
    },

    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record, index, action) => (
        <>
          <a
            onClick={async () => {
              history.push(`/activities/editor/${record.id}`);
            }}
          >
            编辑
          </a>
          <Divider type="vertical" />
          <Popconfirm
            placement="topLeft"
            title="确定删除？"
            onConfirm={async () => {
              await handleRemove(record, action);
            }}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link">删除</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: '活动管理',
      }}
    >
      <ProTable<Activities.TableItem>
        headerTitle="查询表格"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            key="1"
            type="primary"
            onClick={() => {
              history.push(`/activities/editor/0`);
            }}
          >
            新建
          </Button>,
        ]}
        request={async (params) => {
          const {
            data: { list, total },
          } = await getActivitiesList({
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
    </PageContainer>
  );
};

export default TableList;
