// src/components/ThemeSwitchButton/index.tsx
import { useModel } from '@umijs/max';
import { Card } from 'antd';
import styles from './index.less';

interface MachineItemProps {
  text: string;
}

const MachineItem: React.FC<MachineItemProps> = ({ text }) => {
  const { initialState } = useModel('@@initialState');
  const isDark = initialState?.settings?.navTheme === 'realDark';

  return (
    <Card
      className={styles.machineCard}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <div className={isDark ? styles.darkCard : styles.lightCard}>{text}</div>
    </Card>
  );
};

export default MachineItem;
