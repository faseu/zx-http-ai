import { Avatar, Button, Divider, List, Modal, Skeleton } from 'antd';
import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

interface UpgradeLogModalProps {
  open: boolean;
  onOk: (fieldsValue: any) => void;
  onCancel: () => void;
}

interface DataType {
  gender?: string;
  name?: string;
  email?: string;
  avatar?: string;
  id?: string;
}

const UpgradeLogModal: React.FC<UpgradeLogModalProps> = ({
  open,
  onOk,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataType[]>([]);
  const [page, setPage] = useState(1);

  const loadMoreData = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    fetch(
      `https://660d2bd96ddfa2943b33731c.mockapi.io/api/users/?page=${page}&limit=10`,
    )
      .then((res) => res.json())
      .then((res) => {
        const results = Array.isArray(res) ? res : [];
        setData([...data, ...results]);
        setLoading(false);
        setPage(page + 1);
      })
      .catch(() => {
        setLoading(false);
      });
  };
  return (
    <Modal
      title="升级日志"
      open={open}
      width={700}
      footer={<Button onClick={() => onCancel()}>关闭</Button>}
      destroyOnClose // 关闭时销毁表单，确保下次打开时数据正确
    >
      <InfiniteScroll
        dataLength={data.length}
        next={loadMoreData}
        hasMore={data.length < 50}
        loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
        endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
        scrollableTarget="scrollableDiv"
      >
        <List
          dataSource={data}
          renderItem={(item) => (
            <List.Item key={item.email}>
              <List.Item.Meta
                avatar={<Avatar src={item.avatar} />}
                title={<a href="https://ant.design">{item.name}</a>}
                description={item.email}
              />
              <div>Content</div>
            </List.Item>
          )}
        />
      </InfiniteScroll>
    </Modal>
  );
};

export default UpgradeLogModal;
