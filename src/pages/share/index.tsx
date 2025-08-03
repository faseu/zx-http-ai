import {
  addOta,
  delOta,
  detailOta,
  editOta,
  getCateList,
  getOtaList,
} from '@/pages/machine/service';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Card, Input, List, message, Tabs } from 'antd';
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

// 定义标签数据
const tabs = [
  { key: 'all', label: '#全部' },
  { key: 'sensor', label: '#传感器' },
  { key: 'structure', label: '#结构件' },
  { key: 'protocol', label: '#协议' },
  { key: 'automation', label: '#自动化' },
  { key: 'iot', label: '#物联网' },
];
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

  return (
    <div className={styles.container}>
      <div className={styles.titleCard}>
        <div className={styles.titleText}>共创星球</div>
        <div className={styles.rightContent}>
          <Input
            style={{ width: '320px', height: '40px', marginRight: '8px' }}
            placeholder="搜索..."
            suffix={<SearchOutlined />}
          />
          <Button
            color="primary"
            variant="solid"
            size="large"
            onClick={handleAddClick}
          >
            发布内容
          </Button>
        </div>
      </div>
      <Tabs
        items={tabs}
        defaultActiveKey="all"
        onChange={(key) => console.log(key)}
      />
      <div className={styles.contentCard}>
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 4,
            lg: 4,
            xl: 6,
            xxl: 3,
          }}
          dataSource={directiveList}
          renderItem={(item) => (
            <List.Item>
              <Card title={item.title}>Card content</Card>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};
