import PublishShare from '@/components/PublishShare';
import { addDialogue, getDialogueList } from '@/pages/share/service';
import { tabs } from '@/utils/config';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, List, message, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';

/**
 * add设备
 * @param fields
 */
const handleAddDialogue = async (fields: any) => {
  const hide = message.loading('正在新增');
  try {
    await addDialogue({
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

export default () => {
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [directiveList, setAddList] = useState([]);

  const fetchDialogueList = async () => {
    const { data } = await getDialogueList({
      page: 1,
      psize: 1000,
    });
    setAddList(data);
  };

  useEffect(() => {
    fetchDialogueList();
  }, []);
  const handleAddClick = () => {
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
        onOk={async (values: any) => {
          console.log(values);
          const success = await handleAddDialogue(values);
          if (success) {
            setModalAddOpen(false);
          }
        }}
        onCancel={() => {
          setModalAddOpen(false);
        }}
      />
    </div>
  );
};
