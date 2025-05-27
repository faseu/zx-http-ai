// src/components/ThemeSwitchButton/index.tsx
import { useModel } from '@umijs/max';
import { Checkbox, Flex, Popconfirm } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

interface MachineItemProps {
  text: string;
  detail: any;
  onEditMachine: any;
  onDelMachine: any;
  onGetDetail: any;
  // 更新：改为简化的checkbox处理
  isChecked?: boolean;
  onCheckChange?: (checked: boolean) => void;
}

const MachineItem: React.FC<MachineItemProps> = ({
  text,
  detail,
  onEditMachine,
  onDelMachine,
  onGetDetail,
  // 更新：新的checkbox props
  isChecked = false,
  onCheckChange,
}) => {
  console.log(detail);
  const { initialState } = useModel('@@initialState');
  const isDark = initialState?.settings?.navTheme === 'realDark';

  // 更新：checkbox变化处理函数
  const handleCheckboxChange = (e: any) => {
    if (onCheckChange) {
      onCheckChange(e.target.checked);
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
      <div
        className={classNames({
          [styles.commonImgBox]: true,
          [styles.darkImgBox]: isDark,
          [styles.lightImgBox]: !isDark,
        })}
      >
        <img
          style={{ maxWidth: '100%', height: '64px' }}
          src={detail.img}
          alt=""
        />
        <Checkbox
          style={{ position: 'absolute', top: '6px', left: '8px' }}
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
        <div
          style={{
            background: detail.isOnline ? '#87d068' : '#A40000',
          }}
          className={styles.tag}
        >
          {detail.isOnline ? '在线' : '离线'}
        </div>
      </div>
      <Flex
        justify="space-between"
        align="flex-end"
        style={{ marginTop: '8px' }}
      >
        <div>{detail.machineName}</div>
        <div style={{ fontSize: '12px' }}>V1.2.3</div>
      </Flex>
      <Flex justify="space-between" style={{ marginTop: '8px' }}>
        <Flex>
          <div
            className={styles.buttom}
            style={{ background: '#2E60B5', marginRight: '8px' }}
            onClick={() => onEditMachine(detail)}
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
        <div
          onClick={() => onGetDetail(detail)}
          className={styles.buttom}
          style={{ background: '#516EFA' }}
        >
          详情
        </div>
      </Flex>
    </div>
  );
};

export default MachineItem;
