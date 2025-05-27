// src/components/DirectiveItem/index.tsx 的修改

import { CloseOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Flex, Popconfirm } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import styles from './index.less';

interface DirectiveItemProps {
  text: string;
  detail?: any; // 新增：完整的指令数据
  onDelete?: () => void; // 新增：删除回调函数
}

const DirectiveItem: React.FC<DirectiveItemProps> = ({
  text,
  detail,
  onDelete,
}) => {
  const { initialState } = useModel('@@initialState');
  const isDark = initialState?.settings?.navTheme === 'realDark';

  return (
    <div
      className={classNames({
        [styles.commonCard]: true,
        [styles.darkCard]: isDark,
        [styles.lightCard]: !isDark,
      })}
    >
      <Flex justify="space-between">
        <div className={styles.time}>
          {dayjs.unix(detail?.regTime).format('YYYY/MM/DD HH:mm:ss')}
        </div>
        {onDelete && (
          <Popconfirm
            title="删除指令"
            description="确定要删除这条指令吗？"
            okText="确定"
            cancelText="取消"
            onConfirm={onDelete}
          >
            <CloseOutlined style={{ cursor: 'pointer' }} />
          </Popconfirm>
        )}
      </Flex>
      <div
        className={classNames({
          [styles.commonLog]: true,
          [styles.darkLog]: isDark,
          [styles.lightLog]: !isDark,
        })}
      >
        {text || detail?.content || '暂无内容'}
      </div>
    </div>
  );
};

export default DirectiveItem;
