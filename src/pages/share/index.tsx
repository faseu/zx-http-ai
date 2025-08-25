import PublishShare from '@/components/PublishShare';
import { addDialogue, getDialogueList } from '@/pages/share/service';
import { tabs } from '@/utils/config';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, List, message, Tabs, Spin } from 'antd';
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

const PAGE_SIZE = 10; // 每页加载数量

export default () => {
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [directiveList, setDirectiveList] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchDialogueList = async (currentPage = 1, isLoadMore = false, showMessage = false) => {
    if (loading) return; // 防止重复请求
    
    setLoading(true);
    try {
      const { data, total } = await getDialogueList({
        page: currentPage,
        psize: PAGE_SIZE,
      });
      
      if (isLoadMore) {
        // 下拉加载，追加数据
        setDirectiveList(prev => [...prev, ...data]);
        showMessage && message.success(`加载了 ${data.length} 条内容!`);
      } else {
        // 初始加载，替换数据
        setDirectiveList(data);
      }
      
      // 检查是否还有更多数据
      const totalLoaded = isLoadMore ? directiveList.length + data.length : data.length;
      setHasMore(totalLoaded < total);
      
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载更多数据
  const loadMoreData = () => {
    if (!hasMore || loading) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDialogueList(nextPage, true, true);
  };

  // 监听滚动事件
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // 当滚动到底部附近时加载更多
    if (scrollHeight - scrollTop - clientHeight <= 10 && hasMore && !loading) {
      loadMoreData();
    }
  };

  useEffect(() => {
    fetchDialogueList(1, false);
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
      <div 
        className={styles.contentCard}
        onScroll={handleScroll}
        style={{ 
          maxHeight: '70vh', 
          overflowY: 'auto',
          padding: '0 12px'
        }}
      >
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
          renderItem={(item: any, index) => (
            <List.Item>
              <div className={styles.shareItem}>
                <img className={styles.shareImage} src={`${item.img}`} alt="" />
                <div className={styles.shareHeader}>
                  <div className={styles.shareTitle}>{item.name}</div>
                  <div className={styles.shareStatus}>审核中</div>
                </div>
                <div className={styles.shareDescription}>{item.content}</div>
                <div className={styles.shareTags}>
                  {(() => {
                    const raw = item?.tag.split(',');
                    let arr: any[] = [];
                    if (Array.isArray(raw)) {
                      arr = raw;
                    }
                    return arr.map((tag) => (
                      <div
                        key={String(tag)}
                        className={styles.shareTag}
                      >{`#${tag}`}</div>
                    ));
                  })()}
                </div>
                <Button className={styles.btn} type="link">
                  查看详情
                </Button>
              </div>
            </List.Item>
          )}
        />
        
        {/* 加载状态 */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
        )}
        
        {/* 没有更多数据提示 */}
        {!hasMore && directiveList.length > 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            没有更多内容了
          </div>
        )}
      </div>
      
      <PublishShare
        open={modalAddOpen}
        onOk={async (values: any) => {
          console.log(values);
          const success = await handleAddDialogue(values);
          if (success) {
            setModalAddOpen(false);
            // 新增成功后刷新数据
            setPage(1);
            setHasMore(true);
            fetchDialogueList(1, false);
          }
        }}
        onCancel={() => {
          setModalAddOpen(false);
        }}
      />
    </div>
  );
};
