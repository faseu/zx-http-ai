import MachineItem from '@/components/MachineItem';
import { useModel } from '@umijs/max';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';
import {
  addDevice,
  delDevice,
  detailDevice,
  detailDeviceChartData,
  detailDeviceData,
  detailDeviceLastData,
  editDevice,
  getDeviceList,
} from './service';

/**
 * 新增设备
 * @param fields
 */
const handleAddDevice = async (fields: any) => {
  const hide = message.loading('正在新增');
  try {
    await addDevice({
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

/**
 * 编辑设备
 * @param fields
 */
const handleEditDevice = async (fields: any) => {
  const hide = message.loading('正在更新');
  try {
    await editDevice({
      ...fields,
    });
    hide();
    message.success('更新成功');
    return true;
  } catch (error) {
    hide();
    message.error('更新失败请重试！');
    return false;
  }
};

/**
 * 设备详情
 * @param fields
 */
const handleDetailDevice = async (fields: any) => {
  const hide = message.loading('正在获取详情');
  try {
    const data = await detailDevice({
      machineId: fields.machineId,
    });
    hide();
    message.success('获取详情成功');
    return data;
  } catch (error) {
    hide();
    message.error('获取详情失败请重试！');
    return false;
  }
};

/**
 * 设备详情2
 * @param fields
 */
const handleDetailDevice2 = async (fields: any) => {
  const hide = message.loading('正在获取详情');
  try {
    const baseData = await detailDevice({
      machineId: fields.machineId,
    });
    const { data: alarmList } = await detailDeviceData({
      machineId: fields.machineId,
      type: 'error',
    });
    const infoData = await detailDeviceData({
      machineId: fields.machineId,
      type: 'info',
    });
    const lastData = await detailDeviceLastData({
      machineId: fields.machineId,
    });

    const chartData = await detailDeviceChartData({
      machineId: fields.machineId,
    });
    hide();
    message.success('获取详情成功');
    return { baseData, alarmList, infoData, lastData, chartData };
  } catch (error) {
    hide();
    message.error('获取详情失败请重试！');
    return false;
  }
};

/**
 *  删除设备
 * @param fields
 */
const handleDelDevice = async (fields: any) => {
  const hide = message.loading('正在删除');
  try {
    await delDevice({ machineId: fields.machineId });
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

export default () => {
  const { initialState } = useModel('@@initialState');
  const isDark = initialState?.settings?.navTheme === 'realDark';
  const [modalDeviceOpen, setModalDeviceOpen] = useState(false);
  const [detailDeviceOpen, setDetailDeviceOpen] = useState(false);
  const [deviceList, setDeviceList] = useState<any[]>([]);
  const [editDeviceId, setEditDeviceId] = useState(0);
  const [editDeviceDetail, setEditDeviceDetail] = useState({});
  const [deviceDetail, setDeviceDetail] = useState({});

  // 管理选中状态的state
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  const fetchDeviceList = async () => {
    const { data } = await getDeviceList({
      page: 1,
      psize: 1000,
    });
    setDeviceList(data);
  };

  const addDeviceHandler = () => {
    setModalDeviceOpen(true);
  };

  // 全选/取消全选处理函数
  const handleSelectAll = (checked: boolean) => {
    setIsAllSelected(checked);
    if (checked) {
      const allDeviceIds = deviceList.map((device: any) => device.machineId);
      setSelectedDeviceIds(allDeviceIds);
    } else {
      setSelectedDeviceIds([]);
    }
  };

  // 单个设备选中/取消选中处理函数
  const handleDeviceCheck = (machineId: number, checked: boolean) => {
    let newSelectedIds: number[];

    if (checked) {
      newSelectedIds = [...selectedDeviceIds, machineId];
    } else {
      newSelectedIds = selectedDeviceIds.filter((id) => id !== machineId);
    }

    setSelectedDeviceIds(newSelectedIds);

    const allDeviceIds = deviceList.map((device: any) => device.machineId);
    setIsAllSelected(
      newSelectedIds.length === allDeviceIds.length && allDeviceIds.length > 0,
    );
  };

  // 当设备列表变化时，重新计算全选状态
  useEffect(() => {
    if (deviceList.length > 0) {
      const allDeviceIds = deviceList.map((device: any) => device.machineId);
      const currentValidSelected = selectedDeviceIds.filter((id) =>
        allDeviceIds.includes(id),
      );

      if (currentValidSelected.length !== selectedDeviceIds.length) {
        setSelectedDeviceIds(currentValidSelected);
      }

      setIsAllSelected(
        currentValidSelected.length === allDeviceIds.length &&
          allDeviceIds.length > 0,
      );
    } else {
      setSelectedDeviceIds([]);
      setIsAllSelected(false);
    }
  }, [deviceList]);

  useEffect(() => {
    fetchDeviceList();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.titleCard}>
        <div className={styles.titleText}>设备管理</div>
      </div>
      <div className={styles.contentCard}>
        <div className={styles.machineList}>
          {[
            ...deviceList,
            ...deviceList,
            ...deviceList,
            ...deviceList,
            ...deviceList,
            ...deviceList,
            ...deviceList,
            ...deviceList,
            ...deviceList,
            ...deviceList,
            ...deviceList,
            ...deviceList,
            ...deviceList,
            ...deviceList,
          ].map((item) => (
            <MachineItem
              key={item.machineId}
              detail={item}
              text="这是设备信息"
              isChecked={selectedDeviceIds.includes(item.machineId)}
              onCheckChange={(checked: boolean) =>
                handleDeviceCheck(item.machineId, checked)
              }
              onEditMachine={async (item: any) => {
                const data = await handleDetailDevice(item);
                setEditDeviceDetail(data);
                setEditDeviceId(item.machineId);
                setModalDeviceOpen(true);
              }}
              onDelMachine={async (item: any) => {
                await handleDelDevice(item);
                await fetchDeviceList();
              }}
              onGetDetail={async (item: any) => {
                const data = await handleDetailDevice2(item);
                setDeviceDetail(data);
                setDetailDeviceOpen(true);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
