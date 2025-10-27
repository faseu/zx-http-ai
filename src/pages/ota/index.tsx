import { history } from '@umijs/max';
import { Button, Space, Table, TableColumnsType } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import { getOtaList } from './service';
interface DataType {
  key: React.Key;
  id: number;
  otaName: string;
  ver: string;
  type: string;
  regTime: string;
  url: string;
  codeUrl: string;
  userId: number;
  fileUrl: string;
  remark?: string;
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
      title: 'ID',
      dataIndex: 'id',
      width: 100,
    },
    {
      title: 'OTA名称',
      dataIndex: 'otaName',
      width: 150,
    },
    {
      title: '版本',
      dataIndex: 'ver',
    },
    {
      title: '评分',
      dataIndex: 'score',
    },
    {
      title: '发布时间',
      dataIndex: 'regTime',
    },
    {
      title: '源码下载',
      dataIndex: 'url',
      render: (url: string) => {
        if (url) {
          return (
            <a href={url} target="_blank" rel="noopener noreferrer">
              下载源码
            </a>
          );
        }
        return '-';
      },
    },
    {
      title: '固件下载',
      dataIndex: 'codeUrl',
      render: (codeUrl: string, record: DataType) => {
        if (codeUrl && record.fileUrl) {
          const downloadUrl = `${record.fileUrl}${codeUrl}`;
          return (
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
              下载固件
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
          <Button
            type="link"
            onClick={() => {
              // history.push({
              //   pathname: `/machine?url=${record.fileUrl}${record.codeUrl}`,
              // });
              history.push('/machine', {
                url: `${record.codeUrl}`,
                compileId: `${record.id}`,
              });
            }}
          >
            升级
          </Button>
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
