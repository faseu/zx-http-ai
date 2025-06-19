// src/components/UpgradeOverlay/index.tsx
import { request } from '@umijs/max';
import { Button, Checkbox, message } from 'antd';
import React from 'react';
import styles from './index.less';

interface UpgradeOverlayProps {
  visible: boolean;
  machineList: any[];
  selectedMachineIds: number[];
  onCancel: () => void;
  onMachineCheck: (machineId: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  isAllSelected: boolean;
}

const UpgradeOverlay: React.FC<UpgradeOverlayProps> = ({
  visible,
  machineList,
  selectedMachineIds,
  onCancel,
  onMachineCheck,
  onSelectAll,
  isAllSelected,
}) => {
  const [upgrading, setUpgrading] = React.useState(false);

  // 一键升级处理函数
  const handleUpgrade = async () => {
    if (selectedMachineIds.length === 0) {
      message.warning('请先选择需要升级的设备');
      return;
    }

    setUpgrading(true);
    const loadingMessage = message.loading('正在升级设备...', 0);

    try {
      // 遍历选中的设备，调用升级接口
      const upgradePromises = selectedMachineIds.map(async (machineId) => {
        try {
          // 调用升级接口，这里使用你提供的接口地址
          const result = await request('/admin/machine/upgrade', {
            method: 'POST',
            data: {
              machineId,
              // 可以根据实际需要添加更多参数，比如固件版本等
              // version: 'latest'
            },
          });

          console.log(`设备 ${machineId} 升级成功:`, result);
          return { machineId, success: true, result };
        } catch (error) {
          console.error(`设备 ${machineId} 升级失败:`, error);
          return { machineId, success: false, error: error.message };
        }
      });

      // 等待所有升级请求完成
      const results = await Promise.all(upgradePromises);

      // 统计升级结果
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      loadingMessage();

      if (failCount === 0) {
        message.success(`所有设备升级成功！共升级 ${successCount} 台设备`);
      } else if (successCount > 0) {
        message.warning(
          `部分设备升级成功：成功 ${successCount} 台，失败 ${failCount} 台`,
        );

        // 显示失败的设备详情
        const failedDevices = results.filter((r) => !r.success);
        console.log('升级失败的设备:', failedDevices);
      } else {
        message.error('所有设备升级失败，请检查网络连接或设备状态');
      }

      // 升级完成后关闭遮罩
      onCancel();
    } catch (error) {
      loadingMessage();
      console.error('升级过程中发生错误:', error);
      message.error('升级失败，请重试');
    } finally {
      setUpgrading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.upgradeOverlay}>
      {/* 遮罩背景 */}
      <div className={styles.overlayBackground} />

      {/* 设备区域高亮 */}
      <div className={styles.deviceHighlight}>
        {/* 提示文本 */}
        <div className={styles.promptText}>
          <div className={styles.promptTitle}>🎉 代码编译成功！</div>
          <div className={styles.promptSubtitle}>请选择需要升级的设备</div>
        </div>

        {/* 全选控制 */}
        <div className={styles.selectAllContainer}>
          <Checkbox
            checked={isAllSelected}
            indeterminate={selectedMachineIds.length > 0 && !isAllSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            disabled={upgrading}
          >
            全选设备 ({selectedMachineIds.length}/{machineList.length})
          </Checkbox>
        </div>

        {/* 操作按钮 */}
        <div className={styles.actionButtons}>
          <Button
            size="large"
            onClick={onCancel}
            disabled={upgrading}
            style={{ marginRight: '12px' }}
          >
            取消
          </Button>
          <Button
            type="primary"
            size="large"
            loading={upgrading}
            disabled={selectedMachineIds.length === 0}
            onClick={handleUpgrade}
          >
            {upgrading
              ? '升级中...'
              : `一键升级 (${selectedMachineIds.length}台)`}
          </Button>
        </div>
      </div>

      {/* 操作提示箭头 */}
      <div className={styles.arrowPointer}>
        <div className={styles.arrow} />
        <div className={styles.arrowText}>请在此区域选择设备</div>
      </div>
    </div>
  );
};

export default UpgradeOverlay;
