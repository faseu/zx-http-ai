import { Popover, Space, Table, TableColumnsType } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import { getOtaList } from './service';
interface DataType {
  key: React.Key;
  id: number;
  otaName: string;
  reason: string;
  cateName: string;
  cateId: number;
  fileUrl?: string;
}

export default () => {
  const [directiveList, setDirectiveList] = useState<DataType[]>([]);
  const [editOtaDetail, setEditOtaDetail] = useState({});

  // 分页状态
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // 获取协议列表（带分页）
  const fetchOtaList = async (
    nextPage: number = page,
    nextPageSize: number = pageSize,
  ) => {
    try {
      setLoading(true);
      const res = await getOtaList({
        page: nextPage,
        psize: nextPageSize,
      });
      // 接口返回：{ data: [...], total: 12 }
      setDirectiveList(res?.data || []);
      setTotal(res?.total ?? 0);
      setPage(nextPage);
      setPageSize(nextPageSize);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOtaList(1, pageSize);
  }, []);

  const columns: TableColumnsType<DataType> = [
    {
      title: '固件名称',
      dataIndex: 'otaName',
      width: 150,
      render: (text) => {
        return (
          <Popover content={text}>
            <div
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
              }}
            >
              {text}
            </div>
          </Popover>
        );
      },
    },
    {
      title: '固件类型',
      dataIndex: 'type',
    },
    {
      title: '发布时间',
      dataIndex: 'regTime',
    },
    {
      title: '固件描述',
      dataIndex: 'remark',
    },
    {
      title: '协议文件',
      dataIndex: 'fileUrl',
      render: (fileUrl: string) => {
        if (fileUrl) {
          return (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              下载文件
            </a>
          );
        }
        return '-';
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <a>查看</a>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.titleCard}>
        <div className={styles.titleText}>升级管理</div>
      </div>
      <div className={styles.contentCard}>
        <Table<DataType>
          rowKey="id"
          rowSelection={{
            type: 'checkbox',
            onChange: (selectedRowKeys) => {
              console.log('Selected Row Keys:', selectedRowKeys);
            },
          }}
          loading={loading}
          columns={columns}
          dataSource={directiveList}
          size="large"
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
          }}
          onChange={(pagination) => {
            const { current = 1, pageSize: ps = 10 } = pagination;
            fetchOtaList(current, ps);
          }}
        />
      </div>
    </div>
  );
};
