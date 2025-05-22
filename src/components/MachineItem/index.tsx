// src/components/ThemeSwitchButton/index.tsx
import { useModel } from '@umijs/max';
import { Flex, Popconfirm } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

interface MachineItemProps {
  text: string;
  detail: any;
  onDelMachine: any;
}

const MachineItem: React.FC<MachineItemProps> = ({
  text,
  detail,
  onDelMachine,
}) => {
  console.log(detail);
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
      <div
        className={classNames({
          [styles.commonImgBox]: true,
          [styles.darkImgBox]: isDark,
          [styles.lightImgBox]: !isDark,
        })}
      >
        <img src="/admin/machine.png" alt="" />
      </div>
      <Flex
        justify="space-between"
        align="flex-end"
        style={{ marginTop: '8px' }}
      >
        <div>智能网关A1</div>
        <div style={{ fontSize: '12px' }}>V1.2.3</div>
      </Flex>
      <Flex justify="space-between" style={{ marginTop: '8px' }}>
        <Flex>
          <div
            className={styles.buttom}
            style={{ background: '#2E60B5', marginRight: '8px' }}
          >
            编辑
          </div>
          <Popconfirm
            title="删除设备"
            description="删除后无法回复，确定删除设备?"
            okText="确定"
            cancelText="取消"
            onConfirm={() => onDelMachine(detail)}
          >
            <div className={styles.buttom} style={{ background: '#3E3F43' }}>
              删除
            </div>
          </Popconfirm>
        </Flex>
        <div className={styles.buttom} style={{ background: '#516EFA' }}>
          详情
        </div>
      </Flex>
    </div>
  );
};

export default MachineItem;
