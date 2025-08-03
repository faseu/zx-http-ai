import AddDirectiveModal from '@/components/AddDirectiveModal';
import UpgradeLogModal from '@/components/UpgradeLogModal';
import {
  addOta,
  delOta,
  detailOta,
  editOta,
  getCateList,
  getOtaList,
} from '@/pages/machine/service';
import { SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Input,
  message,
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

const fetchDict = async () => {
  const [cateList] = await Promise.all([getCateList()]);
  return [
    cateList.map((item: any) => ({ label: item.cateName, value: item.id })),
  ];
};
export default () => {
  const [editOtaId, setEditOtaId] = useState(0);
  const [modalDirectiveOpen, setModalDirectiveOpen] = useState(false);
  const [modalUpgradeLogOpen, setModalUpgradeLogOpen] = useState(false);
  const [directiveList, setDirectiveList] = useState([]);
  const [cateList, setCateList] = useState([]);

  const [editOtaDetail, setEditOtaDetail] = useState({});
  const fetchOtaList = async () => {
    const { data } = await getOtaList({
      page: 1,
      psize: 1000,
    });
    setDirectiveList(data);
  };

  useEffect(() => {
    fetchOtaList();

    fetchDict().then((res) => {
      const [cateList] = res;
      setCateList(cateList);
    });
  }, []);
  const handleAddClick = () => {
    setEditOtaDetail({});
    setEditOtaId(0);
    setModalDirectiveOpen(true);
  };

  const columns: TableColumnsType<DataType> = [
    {
      title: '固件版本',
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
      dataIndex: 'reason',
    },
    {
      title: '发布时间',
      dataIndex: 'cateName',
    },
    {
      title: '固件描述',
      dataIndex: 'cateName',
    },
    {
      title: '固件升级',
      dataIndex: 'cateName',
    },
    {
      title: '升级日志',
      dataIndex: 'fileUrl',
      render: (fileUrl: string) => {
        if (fileUrl) {
          return (
            <a
              onClick={() => {
                setModalUpgradeLogOpen(true);
              }}
            >
              查看
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
            下载
          </a>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.titleCard}>
        <div className={styles.titleText}>升级管理</div>
        <div className={styles.rightContent}>
          <Input
            style={{ width: '320px', height: '40px', marginRight: '8px' }}
            placeholder="搜索固件..."
            suffix={<SearchOutlined />}
          />
          <Button
            color="primary"
            variant="solid"
            size="large"
            onClick={handleAddClick}
          >
            新增协议
          </Button>
        </div>
      </div>
      <div className={styles.contentCard}>
        <Table<DataType>
          rowSelection={{ type: 'checkbox' }}
          key="id"
          columns={columns}
          dataSource={directiveList}
          size="large"
        />
      </div>
      <AddDirectiveModal
        cateList={cateList}
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
            await fetchOtaList();
          }
        }}
        onCancel={() => {
          setModalDirectiveOpen(false);
          setEditOtaDetail({});
          setEditOtaId(0);
        }}
      />
      <UpgradeLogModal
        open={modalUpgradeLogOpen}
        onOk={() => {
          setModalUpgradeLogOpen(false);
        }}
        onCancel={() => {
          setModalUpgradeLogOpen(false);
        }}
      />
    </div>
  );
};
