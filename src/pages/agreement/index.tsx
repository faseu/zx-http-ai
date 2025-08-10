import AddDirectiveModal from '@/components/AddDirectiveModal';
import {
  addOta,
  delOta,
  detailOta,
  editOta,
  getOtaList,
} from '@/pages/machine/service';
import {
  Button,
  message,
  Popconfirm,
  Popover,
  Space,
  Table,
  TableColumnsType,
} from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
interface DataType {
  key: React.Key;
  id: number;
  otaName: string;
  reason: string;
  cateName: string;
  cateId: number;
  fileUrl?: string;
}

/**
 * 新增协议
 * @param fields
 */
const handleAddOta = async (fields: any) => {
  const hide = message.loading('正在新增');
  try {
    await addOta({
      ...fields,
    });
    hide();
    message.success('新增成功');
    return true;
  } catch (error) {
    hide();
    message.error('新增失败请重试！');
    return false;
  }
};

/**
 * 编辑协议
 * @param fields
 */
const handleEditOta = async (fields: any) => {
  const hide = message.loading('正在更新');
  try {
    await editOta({
      ...fields,
    });
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
 * 协议详情
 * @param fields
 */
const handleDetailOta = async (fields: any) => {
  const hide = message.loading('正在获取详情');
  try {
    const data = await detailOta({
      id: fields.id,
    });
    hide();
    return data;
  } catch (error) {
    hide();
    message.error('获取详情失败请重试！');
    return false;
  }
};

/**
 *  删除协议
 * @param fields
 */
const handleDelOta = async (fields: any) => {
  const hide = message.loading('正在删除');
  try {
    await delOta({ id: fields.id });
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

export default () => {
  const [editOtaId, setEditOtaId] = useState(0);
  const [modalDirectiveOpen, setModalDirectiveOpen] = useState(false);
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

  const handleAddClick = () => {
    setEditOtaDetail({});
    setEditOtaId(0);
    setModalDirectiveOpen(true);
  };

  const columns: TableColumnsType<DataType> = [
    {
      title: '协议名称',
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
      title: '硬件厂家',
      dataIndex: 'reason',
    },
    {
      title: '设备型号',
      dataIndex: 'cateName',
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
          <a
            onClick={async () => {
              const detail = await handleDetailOta(record);
              if (detail) {
                setEditOtaDetail(detail);
                setEditOtaId(record.id);
                setModalDirectiveOpen(true);
              }
            }}
          >
            编辑
          </a>
          <Popconfirm
            title="删除协议"
            description="删除后无法恢复，确定删除协议?"
            okText="确定"
            cancelText="取消"
            onConfirm={async () => {
              const success = await handleDelOta(record);
              if (success) {
                // 若当前页删到空且不是第1页，则回退一页
                const isLastItemOnPage = directiveList.length === 1;
                const nextPage = isLastItemOnPage && page > 1 ? page - 1 : page;
                await fetchOtaList(nextPage, pageSize);
              }
            }}
          >
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.titleCard}>
        <div className={styles.titleText}>协议管理</div>
        <Button
          color="primary"
          variant="solid"
          size="large"
          onClick={handleAddClick}
        >
          新增协议
        </Button>
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
      {modalDirectiveOpen && (
        <AddDirectiveModal
          isEdit={!!editOtaId}
          detail={editOtaDetail}
          open={modalDirectiveOpen}
          styles={{}}
          onOk={async (values: any) => {
            const success = editOtaId
              ? await handleEditOta({ id: editOtaId, ...values })
              : await handleAddOta(values);
            if (success) {
              setModalDirectiveOpen(false);
              setEditOtaDetail({});
              setEditOtaId(0);
              // 新增/编辑后刷新当前页
              await fetchOtaList(page, pageSize);
            }
          }}
          onCancel={() => {
            setModalDirectiveOpen(false);
            setEditOtaDetail({});
            setEditOtaId(0);
          }}
        />
      )}
    </div>
  );
};
