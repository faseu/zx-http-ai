import { useModel } from '@umijs/max';
import classNames from 'classnames';
import { ReactNode } from 'react';
import styles from './index.less';

interface CustomSubtitleProps {
  title: string;
  children?: ReactNode;
}

const CustomSubtitle: React.FC<CustomSubtitleProps> = ({ title, children }) => {
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
      <div className={styles.title}>{title}</div>
      {children}
    </div>
  );
};

export default CustomSubtitle;
