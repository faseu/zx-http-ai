// src/components/ThemeSwitchButton/index.tsx
import { BulbFilled, BulbOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Button } from 'antd';
import styles from './index.less';

const ThemeSwitchButton = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const navTheme = initialState?.settings?.navTheme || 'light';

  const toggleTheme = async () => {
    const nextTheme = navTheme === 'realDark' ? 'light' : 'realDark';
    await setInitialState((preInitialState) => ({
      ...preInitialState,
      settings: {
        ...preInitialState?.settings,
        navTheme: nextTheme,
      },
    }));
  };

  return (
    <Button
      className={styles.themeBtn}
      type="default"
      icon={navTheme === 'realDark' ? <BulbOutlined /> : <BulbFilled />}
      onClick={toggleTheme}
    >
      {navTheme === 'realDark' ? '切换为明亮' : '切换为暗黑'}
    </Button>
  );
};

export default ThemeSwitchButton;
