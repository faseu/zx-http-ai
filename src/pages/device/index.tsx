import MachineItem from '@/components/MachineItem';
import CustomTitle from '@/components/CustomTitle';
import { useModel } from '@umijs/max';
import { List, message } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';
import {
  addDevice,
  delDevice,
  detailDevice,
  detailDeviceData,
  detailDeviceLastData,
  detailDeviceChartData,
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
      deviceId: fields.deviceId,
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
      deviceId: fields.deviceId,
    });
    const { data: alarmList } = await detailDeviceData({
      deviceId: fields.deviceId,
      type: 'error',
    });
    const infoData = await detailDeviceData({
      deviceId: fields.deviceId,
      type: 'info',
    });
    const lastData = await detailDeviceLastData({
      deviceId: fields.deviceId,
    });

    const chartData = await detailDeviceChartData({
      deviceId: fields.deviceId,
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
    await delDevice({ deviceId: fields.deviceId });
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
      const allDeviceIds = deviceList.map(
        (device: any) => device.deviceId,
      );
      setSelectedDeviceIds(allDeviceIds);
    } else {
      setSelectedDeviceIds([]);
    }
  };

  // 单个设备选中/取消选中处理函数
  const handleDeviceCheck = (deviceId: number, checked: boolean) => {
    let newSelectedIds: number[];

    if (checked) {
      newSelectedIds = [...selectedDeviceIds, deviceId];
    } else {
      newSelectedIds = selectedDeviceIds.filter((id) => id !== deviceId);
    }

    setSelectedDeviceIds(newSelectedIds);

    const allDeviceIds = deviceList.map((device: any) => device.deviceId);
    setIsAllSelected(
      newSelectedIds.length === allDeviceIds.length &&
        allDeviceIds.length > 0,
    );
  };

  // 当设备列表变化时，重新计算全选状态
  useEffect(() => {
    if (deviceList.length > 0) {
      const allDeviceIds = deviceList.map(
        (device: any) => device.deviceId,
      );
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
        <CustomTitle
          title="设备列表"
          showCheckbox
          searchPlaceholder="搜索设备..."
          addButtonText="新增设备"
          onSubmit={addDeviceHandler}
          isAllSelected={isAllSelected}
          onSelectAll={handleSelectAll}
          selectedCount={selectedDeviceIds.length}
          totalCount={deviceList.length}
        />
        <div className={styles.hideScrollbar}>
          <List
            rowKey="deviceId"
            grid={{
              gutter: 10,
              xs: 1,
              sm: 1,
              md: 1,
              lg: 2,
              xl: 2,
              xxl: 3,
            }}
            dataSource={deviceList}
            renderItem={(item) => {
              return (
                <MachineItem
                  detail={item}
                  text="这是设备信息"
                  isChecked={selectedDeviceIds.includes(item.deviceId)}
                  onCheckChange={(checked: boolean) =>
                    handleDeviceCheck(item.deviceId, checked)
                  }
                  onEditMachine={async (item: any) => {
                    const data = await handleDetailDevice(item);
                    setEditDeviceDetail(data);
                    setEditDeviceId(item.deviceId);
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
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};
