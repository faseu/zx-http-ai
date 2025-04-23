import {
  ActionType,
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import { ProColumns } from '@ant-design/pro-table/lib';
import { Button, message, Popconfirm, Space } from 'antd';
import React, { useEffect, useRef } from 'react';

import { history } from '@@/core/history';
import { delActivitiesRoad, getActivitiesRoadList } from './service';

/**
 *  删除节点
 * @param record
 * @param action
 */
const handleRemove = async (
  record: ActivitiesRoad.TableItem,
  action: ActionType | undefined,
) => {
  const hide = message.loading('正在删除');
  try {
    await delActivitiesRoad(record.id);
    hide();
    message.success('删除成功');
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

  useEffect(() => {
    // const loadRoles = async () => {
    //   const [roles = [], property = []] = await fetchPullOptions();
    //   setRoleListPull(roles);
    //   setPropertyListPull(property);
    // };
    // loadRoles();
  }, []);

  const columns: ProColumns<ActivitiesRoad.TableItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '路线名称',
      dataIndex: 'name',
    },
    {
      title: '地区',
      dataIndex: 'region',
    },
    {
      title: '难度等级',
      valueType: 'rate',
      dataIndex: 'difficulty_level',
      fieldProps: {
        count: 8,
      },
    },
    {
      title: '起点海拔',
      dataIndex: 'start_altitude',
    },
    {
      title: '顶峰海拔',
      dataIndex: 'summit_altitude',
    },
    {
      title: '总距离 (米)',
      dataIndex: 'distance',
    },
    {
      title: '爬升海拔 (米)',
      dataIndex: 'elevation_gain',
    },
    {
      title: '推荐用时',
      dataIndex: 'recommended_time',
    },
    {
      title: '出发时间',
      dataIndex: 'departure_time',
      valueType: 'dateTime',
    },
    {
      title: '创建人',
      dataIndex: 'created_by',
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status_display',
    },
    {
      title: '审核状态',
      dataIndex: 'audit_status_display',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record, index, action) => (
        <Space>
          {record?.audit_status === 0 && record?.status === 1 ? (
            <a
              onClick={async () => {
                history.push({
                  pathname: `/activitiesRoad/editor/${record.id}`,
                  search: '?audit=true&readonly=true',
                });
              }}
            >
              审核
            </a>
          ) : (
            <a
              onClick={async () => {
                history.push({
                  pathname: `/activitiesRoad/editor/${record.id}`,
                  search: '?readonly=true',
                });
              }}
            >
              详情
            </a>
          )}
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
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: '路线管理',
      }}
    >
      <ProTable<ActivitiesRoad.TableItem>
        headerTitle="查询表格"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => []}
        request={async (params) => {
          const {
            data: { list, total },
          } = await getActivitiesRoadList({
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
