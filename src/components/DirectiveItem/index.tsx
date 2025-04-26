// src/components/ThemeSwitchButton/index.tsx
import { CloseOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Flex } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

interface DirectiveItemProps {
  text: string;
}

const DirectiveItem: React.FC<DirectiveItemProps> = ({ text }) => {
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
        <div className={styles.time}>2025/4/16 21:46:35</div>
        <CloseOutlined />
      </Flex>
      <div
        className={classNames({
          [styles.commonLog]: true,
          [styles.darkLog]: isDark,
          [styles.lightLog]: !isDark,
        })}
      >
        yam镜像源设置方法yam镜像源设置方法yam镜像源设置方法yam镜像源设置方法yam镜像源设置方法...
      </div>
    </div>
  );
};

export default DirectiveItem;
