import AddMachineModal from '@/components/AddMachineModal';
import DetailMachineModal2 from '@/components/DetailMachineModal2';
import MachineItem from '@/components/MachineItem';
import { SearchOutlined } from '@ant-design/icons';
import { debounce } from '@antv/util';
import { useModel } from '@umijs/max';
import { Button, Input, message, Pagination, Select } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './index.less';
import {
  addDevice,
  delDevice,
  detailDevice,
  detailDeviceData,
  detailDeviceLastData,
  editDevice,
  getDeviceList,
  setDeviceBatGroup,
  setDeviceParams,
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
    const chartData = await detailDeviceLastData({
      machineId: fields.machineId,
    });
    hide();
    message.success('获取详情成功');
    return { baseData, alarmList, infoData, chartData };
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

/**
 *  添加设备到智能空间
 * @param fields
 */
const handleSetDeviceGroup = async (fields: any) => {
  const hide = message.loading('正在添加');
  try {
    await setDeviceBatGroup({
      machineIds: fields.machineIds.join(','),
      isGroup: 1,
    });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败，请重试');
    return false;
  }
};

// 规范化筛选值：只接受 '0'/'1'，其他一律视为未筛选
const normalizeIsGroup = (v: any): '0' | '1' | undefined => {
  if (v === '0' || v === 0) return '0';
  if (v === '1' || v === 1) return '1';
  return undefined;
};

/**
 *  删除设备
 * @param fields
 */
const handleSetDeviceParams = async (fields: any) => {
  const hide = message.loading('正在设置');
  try {
    await setDeviceParams({ ...fields });
    hide();
    message.success('设置成功');
    return true;
  } catch (error) {
    hide();
    message.error('设置失败，请重试');
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

  // 分页相关
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // 管理选中状态的state
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  const [inputValue, setInputValue] = useState('');

  // 新增：筛选状态
  const [isGroupFilter, setIsGroupFilter] = useState<'0' | '1' | undefined>(
    undefined,
  );

  // 获取设备列表（带分页 + isGroup 筛选 + 搜索关键词）
  const fetchDeviceList = async (
    nextPage: number = page,
    nextPageSize: number = pageSize,
    rawIsGroup?: string | number | null,
    searchKeywords?: string,
  ) => {
    try {
      setLoading(true);
      const res = await getDeviceList({
        page: nextPage,
        psize: nextPageSize,
        isGroup: rawIsGroup,
        keywords: searchKeywords,
      });
      // 接口返回：{ data: [...], total: 12 }
      setDeviceList(res?.data || []);
      setTotal(res?.total || 0);
      setPage(nextPage);
      setPageSize(nextPageSize);
    } finally {
      setLoading(false);
    }
  };

  // 新增：批量添加选中设备到智能空间
  const addSelectedToGroup = async () => {
    if (!selectedDeviceIds.length) return;
    console.log(selectedDeviceIds);
    const success = await handleSetDeviceGroup({
      machineIds: selectedDeviceIds,
    });
    if (success) {
      // 成功后清空选择并刷新当前页
      setSelectedDeviceIds([]);
      setIsAllSelected(false);
      await fetchDeviceList(page, pageSize);
    }
  };

  const addDeviceHandler = () => {
    setModalDeviceOpen(true);
  };

  // 创建防抖搜索函数
  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue: string) => {
        fetchDeviceList(1, pageSize, isGroupFilter, searchValue);
      }, 500), // 500ms 防抖延迟
    [pageSize, isGroupFilter],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      // 如果搜索框为空，立即重置到第一页
      if (value.trim() === '') {
        fetchDeviceList(1, pageSize, isGroupFilter);
      } else {
        debouncedSearch(value);
      }
    },
    [debouncedSearch, fetchDeviceList, pageSize, isGroupFilter],
  );

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

  // 初始加载时也显式带上当前筛选（默认 undefined，不会传 isGroup）
  useEffect(() => {
    fetchDeviceList(1, pageSize, isGroupFilter);
    // 仅在首次加载调用
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.titleCard}>
        <div className={styles.titleText}>设备管理</div>
        <div className={styles.rightContent}>
          <Input
            style={{ width: '320px', height: '40px', marginRight: '8px' }}
            placeholder="搜索设备ID、名称或用途..."
            suffix={<SearchOutlined />}
            value={inputValue}
            onChange={handleInputChange}
          />
          <Select
            size="large"
            style={{ width: '150px', height: '40px', marginRight: '8px' }}
            placeholder="是否添加智能空间"
            allowClear
            value={isGroupFilter}
            onChange={(val) => {
              // val 可能是 '0' | '1' | '' | null | undefined
              const norm = normalizeIsGroup(val);
              setIsGroupFilter(norm);
              fetchDeviceList(1, pageSize, norm);
            }}
          >
            {/*<Select.Option value="0">未添加智能空间</Select.Option>*/}
            <Select.Option value="1">已添加智能空间</Select.Option>
            <Select.Option value="0">未加入智能空间</Select.Option>
          </Select>
          {selectedDeviceIds.length > 0 && (
            <Button variant="solid" size="large" onClick={addSelectedToGroup}>
              添加至智能空间
            </Button>
          )}
          <Button
            color="primary"
            variant="solid"
            size="large"
            onClick={addDeviceHandler}
          >
            新增设备
          </Button>
        </div>
      </div>
      <div className={styles.contentCard}>
        <div className={styles.machineList}>
          {[...deviceList].map((item) => (
            <MachineItem
              key={item.machineId}
              detail={item}
              text="这是设备信息"
              isChecked={selectedDeviceIds.includes(item.machineId)}
              onCheckChange={(checked: boolean) => {
                handleDeviceCheck(item.machineId, checked);
              }}
              onEditMachine={async (item: any) => {
                const data = await handleDetailDevice(item);
                setEditDeviceDetail(data);
                setEditDeviceId(item.machineId);
                setModalDeviceOpen(true);
              }}
              onDelMachine={async (item: any) => {
                const success = await handleDelDevice(item);
                if (success) {
                  // 删除后，如果当前页数据被清空且不是第1页，回退一页
                  const isLastItemOnPage = deviceList.length === 1;
                  const nextPage =
                    isLastItemOnPage && page > 1 ? page - 1 : page;
                  await fetchDeviceList(nextPage, pageSize);
                }
              }}
              onGetDetail={async (item: any) => {
                const data = await handleDetailDevice2(item);
                setDeviceDetail(data);
                setDetailDeviceOpen(true);
              }}
            />
          ))}
        </div>
        {/* 分页时显式传入当前筛选值，避免使用到旧的默认参数 */}
        <Pagination
          align="end"
          current={page}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          showTotal={(t) => `共 ${t} 条`}
          onChange={(p, ps) => {
            fetchDeviceList(p, ps, isGroupFilter);
          }}
          onShowSizeChange={(_, ps) => {
            fetchDeviceList(1, ps, isGroupFilter);
          }}
        />
      </div>
      {modalDeviceOpen && (
        <AddMachineModal
          styles={{}}
          isEdit={!!editDeviceId}
          detail={editDeviceDetail}
          open={modalDeviceOpen}
          onOk={async (values: any) => {
            console.log(values);
            const success = editDeviceId
              ? await handleEditDevice({
                  machineId: editDeviceId,
                  ...values,
                })
              : await handleAddDevice(values);
            if (success) {
              setEditDeviceId(0);
              setModalDeviceOpen(false);
              setEditDeviceDetail({});
              await fetchDeviceList(page, pageSize);
            }
          }}
          onCancel={() => {
            setModalDeviceOpen(false);
            setEditDeviceDetail({});
            setEditDeviceId(0);
          }}
        />
      )}
      <DetailMachineModal2
        data={deviceDetail}
        open={detailDeviceOpen}
        onCancel={() => setDetailDeviceOpen(false)}
        onEdit={async (deviceData: any) => {
          const detail = await handleDetailDevice(deviceData);
          if (detail) {
            setEditDeviceDetail(detail);
            setEditDeviceId(deviceData.deviceId);
            setModalDeviceOpen(true);
          }
        }}
        onDelete={async (deviceData: any) => {
          const success = await handleDelDevice(deviceData);
          if (success) {
            await fetchDeviceList();
          }
        }}
        onSetParams={async (deviceData: any) => {
          const success = await handleSetDeviceParams(deviceData);
        }}
      />
    </div>
  );
};
