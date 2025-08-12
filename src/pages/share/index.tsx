import PublishShare from '@/components/PublishShare';
import { getCateList, getOtaList } from '@/pages/machine/service';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, List, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';

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
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [directiveList, setAddList] = useState([]);
  const [cateList, setCateList] = useState([]);

  const [editOtaDetail, setEditOtaDetail] = useState({});
  const fetchOtaList = async () => {
    const { data } = await getOtaList({
      page: 1,
      psize: 1000,
    });
    setAddList(data);
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
    setModalAddOpen(true);
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
            sm: 1,
            md: 2,
            lg: 2,
            xl: 2,
            xxl: 3,
          }}
          dataSource={directiveList}
          renderItem={(item, index) => (
            <List.Item>
              <div className={styles.shareItem}>
                <img
                  className={styles.shareImage}
                  src={`https://picsum.photos/500/200?${index}`}
                  alt=""
                />
                <div className={styles.shareHeader}>
                  <div className={styles.shareTitle}>智能灯光控制</div>
                  <div className={styles.shareStatus}>审核中</div>
                </div>
                <div className={styles.shareDescription}>
                  通过语音或手机APP控制智能灯泡的开关和亮度
                </div>
                <div className={styles.shareTags}>
                  <div className={styles.shareTag}>#自动化</div>
                  <div className={styles.shareTag}>#物联网</div>
                  <div className={styles.shareTag}>#语音控制</div>
                </div>
                <Button className={styles.btn} type="link">
                  查看详情
                </Button>
              </div>
            </List.Item>
          )}
        />
      </div>
      <PublishShare
        open={modalAddOpen}
        onOk={() => {
          setModalAddOpen(false);
        }}
        onCancel={() => {
          setModalAddOpen(false);
        }}
      />
    </div>
  );
};
