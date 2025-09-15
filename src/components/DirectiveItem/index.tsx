import { CloseOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Flex, Popconfirm } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import styles from './index.less';

interface DirectiveItemProps {
  text: string;
  detail?: any; // 完整的指令数据
  onDelete?: any; // 删除回调函数
  onDirectiveClick?: (text: string) => void; // 新增：点击指令的回调函数
}

const DirectiveItem: React.FC<DirectiveItemProps> = ({
  text,
  detail,
  onDelete,
  onDirectiveClick, // 新增参数
}) => {
  const { initialState } = useModel('@@initialState');
  const isDark = initialState?.settings?.navTheme === 'realDark';

  // 处理指令内容点击
  const handleDirectiveClick = () => {
    const directiveText = text || detail?.content || '';
    if (directiveText && onDirectiveClick) {
      onDirectiveClick(directiveText);
    }
  };

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
        onClick={handleDirectiveClick} // 添加点击事件
        style={{
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDark
            ? '#2a2a2a'
            : '#f5f5f5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? '#0D0D0D' : '';
        }}
      >
        {text || detail?.content || '暂无内容'}
      </div>
    </div>
  );
};

export default DirectiveItem;
