// src/pages/machine/index.tsx 的完整修改

import AddDirectiveModal from '@/components/AddDirectiveModal';
import AddMachineModal from '@/components/AddMachineModal';
import AIBox, { AIBoxRef } from '@/components/AIBox'; // 导入 AIBoxRef 类型
import CustomTitle from '@/components/CustomTitle';
import DetailMachineModal from '@/components/DetailMachineModal';
import DirectiveItem from '@/components/DirectiveItem';
import MachineItem from '@/components/MachineItem';
import {
  addMachine,
  addOta,
  clearAllDialogue,
  delDialogue,
  delMachine,
  delOta,
  detailMachine,
  detailMachineData,
  detailOta,
  editMachine,
  editOta,
  getCateList,
  getDialogueList,
  getMachineList,
  getOtaList,
} from '@/pages/machine/service';
import { useModel } from '@umijs/max';
import {
  Card,
  List,
  message,
  Popconfirm,
  Space,
  Table,
  TableColumnsType,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.less';

/**
 * add设备
 * @param fields
 */
const handleAddMachine = async (fields: any) => {
  const hide = message.loading('正在新增');
  try {
    await addMachine({
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
 * edit设备
 * @param fields
 */
const handleEditMachine = async (fields: any) => {
  const hide = message.loading('正在更新');
  try {
    await editMachine({
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
const handleDetailMachine = async (fields: any) => {
  const hide = message.loading('正在获取详情');
  try {
    const data = await detailMachine({
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
const handleDetailMachine2 = async (fields: any) => {
  const hide = message.loading('正在获取详情');
  try {
    const baseData = await detailMachine({
      machineId: fields.machineId,
    });
    const { data: alarmList } = await detailMachineData({
      machineId: fields.machineId,
      type: 'error',
    });
    const infoData = await detailMachineData({
      machineId: fields.machineId,
      type: 'info',
    });
    hide();
    message.success('获取详情成功');
    return { baseData, alarmList, infoData };
  } catch (error) {
    hide();
    message.error('获取详情失败请重试！');
    return false;
  }
};

/**
 * 新增协议
 * @param fields
 */
const handleAddOta = async (fields: any) => {
  const hide = message.loading('正在新增');
  try {
    await addOta({
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
 * 编辑协议
 * @param fields
 */
const handleEditOta = async (fields: any) => {
  const hide = message.loading('正在更新');
  try {
    await editOta({
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
 * 协议详情
 * @param fields
 */
const handleDetailOta = async (fields: any) => {
  const hide = message.loading('正在获取详情');
  try {
    const data = await detailOta({
      id: fields.id,
    });
    hide();
    return data;
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
const handleDelMachine = async (fields: any) => {
  const hide = message.loading('正在删除');
  try {
    await delMachine({ machineId: fields.machineId });
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
 *  删除协议
 * @param fields
 */
const handleDelOta = async (fields: any) => {
  const hide = message.loading('正在删除');
  try {
    await delOta({ id: fields.id });
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
 * 删除单条指令
 * @param fields
 */
const handleDelDialogue = async (fields: any) => {
  const hide = message.loading('正在删除');
  try {
    await delDialogue({ id: fields.id });
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
 * 清空所有指令
 */
const handleClearAllDialogue = async () => {
  const hide = message.loading('正在清空');
  try {
    await clearAllDialogue();
    hide();
    message.success('清空成功');
    return true;
  } catch (error) {
    hide();
    message.error('清空失败，请重试');
    return false;
  }
};

interface DataType {
  key: React.Key;
  id: number;
  otaName: string;
  reason: string;
  cateName: string;
  cateId: number;
  fileUrl?: string;
}

const fetchDict = async () => {
  const [cateList] = await Promise.all([getCateList()]);
  return [
    cateList.map((item: any) => ({ label: item.cateName, value: item.id })),
  ];
};

export default () => {
  const { initialState } = useModel('@@initialState');
  const isDark = initialState?.settings?.navTheme === 'realDark';
  const [modalMachineOpen, setModalMachineOpen] = useState(false);
  const [modalDirectiveOpen, setModalDirectiveOpen] = useState(false);
  const [detailMachineOpen, setDetailMachineOpen] = useState(false);
  const [machineList, setMachineList] = useState<any[]>([]);
  const [directiveList, setDirectiveList] = useState([]);
  const [dialogueList, setDialogueList] = useState([]); // 指令历史列表
  const [cateList, setCateList] = useState([]);
  const [editMachineId, setEditMachineId] = useState(0);
  const [editMachineDetail, setEditMachineDetail] = useState({});
  const [machineDetail, setMachineDetail] = useState({});

  // 协议编辑相关状态
  const [editOtaId, setEditOtaId] = useState(0);
  const [editOtaDetail, setEditOtaDetail] = useState({});

  // 管理选中状态的state
  const [selectedMachineIds, setSelectedMachineIds] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  // 新增：AIBox 的 ref
  const aiBoxRef = useRef<AIBoxRef>(null);

  console.log(isDark);

  const fetchMachineList = async () => {
    const { data } = await getMachineList({
      page: 1,
      psize: 1000,
    });
    setMachineList(data);
  };

  const fetchOtaList = async () => {
    const { data } = await getOtaList({
      page: 1,
      psize: 1000,
    });
    setDirectiveList(data);
  };

  // 获取指令历史列表
  const fetchDialogueList = async () => {
    try {
      const { data } = await getDialogueList({
        page: 1,
        psize: 1000,
      });
      setDialogueList(data);
    } catch (error) {
      console.error('获取指令历史失败:', error);
      message.error('获取指令历史失败');
    }
  };

  const columns: TableColumnsType<DataType> = [
    {
      title: '协议名称',
      dataIndex: 'otaName',
    },
    {
      title: '硬件厂家',
      dataIndex: 'reason',
    },
    {
      title: '设备型号',
      dataIndex: 'cateName',
    },
    {
      title: '协议文件',
      dataIndex: 'fileUrl',
      render: (fileUrl: string) => {
        if (fileUrl) {
          return (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              下载文件
            </a>
          );
        }
        return '-';
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a
            onClick={async () => {
              const detail = await handleDetailOta(record);
              if (detail) {
                setEditOtaDetail(detail);
                setEditOtaId(record.id);
                setModalDirectiveOpen(true);
              }
            }}
          >
            编辑
          </a>
          <Popconfirm
            title="删除协议"
            description="删除后无法恢复，确定删除协议?"
            okText="确定"
            cancelText="取消"
            onConfirm={async () => {
              const success = await handleDelOta(record);
              if (success) {
                await fetchOtaList();
              }
            }}
          >
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const addMachineHandler = () => {
    setModalMachineOpen(true);
  };

  const addDirective = () => {
    setEditOtaDetail({});
    setEditOtaId(0);
    setModalDirectiveOpen(true);
  };

  // 全选/取消全选处理函数
  const handleSelectAll = (checked: boolean) => {
    setIsAllSelected(checked);
    if (checked) {
      const allMachineIds = machineList.map(
        (machine: any) => machine.machineId,
      );
      setSelectedMachineIds(allMachineIds);
    } else {
      setSelectedMachineIds([]);
    }
  };

  // 单个设备选中/取消选中处理函数
  const handleMachineCheck = (machineId: number, checked: boolean) => {
    let newSelectedIds: number[];

    if (checked) {
      newSelectedIds = [...selectedMachineIds, machineId];
    } else {
      newSelectedIds = selectedMachineIds.filter((id) => id !== machineId);
    }

    setSelectedMachineIds(newSelectedIds);

    const allMachineIds = machineList.map((machine: any) => machine.machineId);
    setIsAllSelected(
      newSelectedIds.length === allMachineIds.length &&
        allMachineIds.length > 0,
    );
  };

  // 删除单条指令的处理函数
  const onDelDialogue = async (id: number) => {
    const success = await handleDelDialogue({ id });
    if (success) {
      await fetchDialogueList(); // 重新获取列表
    }
  };

  // 清空所有指令的处理函数
  const onClearAllDialogue = async () => {
    const success = await handleClearAllDialogue();
    if (success) {
      await fetchDialogueList(); // 重新获取列表
    }
  };

  // 新增：处理指令点击的函数
  const handleDirectiveClick = (text: string) => {
    if (aiBoxRef.current) {
      aiBoxRef.current.fillInput(text);
      message.success('指令已填充到输入框');
    }
  };

  // 当设备列表变化时，重新计算全选状态
  useEffect(() => {
    if (machineList.length > 0) {
      const allMachineIds = machineList.map(
        (machine: any) => machine.machineId,
      );
      const currentValidSelected = selectedMachineIds.filter((id) =>
        allMachineIds.includes(id),
      );

      if (currentValidSelected.length !== selectedMachineIds.length) {
        setSelectedMachineIds(currentValidSelected);
      }

      setIsAllSelected(
        currentValidSelected.length === allMachineIds.length &&
          allMachineIds.length > 0,
      );
    } else {
      setSelectedMachineIds([]);
      setIsAllSelected(false);
    }
  }, [machineList]);

  useEffect(() => {
    fetchMachineList();
    fetchOtaList();
    fetchDialogueList(); // 获取指令历史
    fetchDict().then((res) => {
      const [cateList] = res;
      setCateList(cateList);
    });
  }, []);

  return (
    <Card
      styles={{
        body: {
          padding: '0',
        },
      }}
      style={{ borderRadius: 0 }}
    >
      <div style={{ display: 'flex' }}>
        <div
          style={{
            display: 'flex',
            width: '50%',
            justifyContent: 'space-between',
          }}
        >
          <Card
            className={styles.aiBoxCard}
            styles={{
              body: {
                height: '100%',
              },
            }}
            style={{ margin: 8, background: '#222020' }}
          >
            <AIBox ref={aiBoxRef} />
          </Card>
        </div>
        <div
          style={{
            width: '50%',
            padding: '0 50px',
          }}
          className={styles.rightCard}
        >
          <CustomTitle
            title="常用设备"
            showCheckbox
            searchPlaceholder="搜索设备..."
            addButtonText="新增设备"
            onSubmit={addMachineHandler}
            isAllSelected={isAllSelected}
            onSelectAll={handleSelectAll}
            selectedCount={selectedMachineIds.length}
            totalCount={machineList.length}
          />
          <div className={styles.hideScrollbar}>
            <List
              rowKey="machineId"
              grid={{
                gutter: 10,
                xs: 1,
                sm: 1,
                md: 1,
                lg: 2,
                xl: 2,
                xxl: 3,
              }}
              dataSource={machineList}
              renderItem={(item) => {
                return (
                  <MachineItem
                    detail={item}
                    text="这是设备信息"
                    isChecked={selectedMachineIds.includes(item.machineId)}
                    onCheckChange={(checked: boolean) =>
                      handleMachineCheck(item.machineId, checked)
                    }
                    onEditMachine={async (item: any) => {
                      const data = await handleDetailMachine(item);
                      setEditMachineDetail(data);
                      setEditMachineId(item.machineId);
                      setModalMachineOpen(true);
                    }}
                    onDelMachine={async (item: any) => {
                      await handleDelMachine(item);
                      await fetchMachineList();
                    }}
                    onGetDetail={async (item: any) => {
                      const data = await handleDetailMachine2(item);
                      setMachineDetail(data);
                      setDetailMachineOpen(true);
                    }}
                  />
                );
              }}
            />
          </div>

          {/* 常用指令部分 */}
          <CustomTitle
            title="常用指令"
            showEmpty
            onClear={onClearAllDialogue} // 传递清空回调函数
          />
          <div className={styles.hideScrollbar}>
            <List
              rowKey="id"
              dataSource={dialogueList}
              renderItem={(item: any) => {
                return (
                  <DirectiveItem
                    text={item.content}
                    detail={item}
                    onDelete={() => onDelDialogue(item.id)} // 传递删除函数
                    onDirectiveClick={handleDirectiveClick} // 新增：传递点击回调函数
                  />
                );
              }}
              locale={{
                emptyText: '暂无指令历史',
              }}
            />
          </div>

          <CustomTitle
            title="协议管理"
            searchPlaceholder="搜索协议..."
            addButtonText="新增协议"
            onSubmit={addDirective}
          />
          <Table<DataType>
            key="id"
            scroll={{ y: 200 }}
            pagination={false}
            columns={columns}
            dataSource={directiveList}
            size="small"
          />
        </div>
      </div>

      {modalMachineOpen && (
        <AddMachineModal
          cateList={cateList}
          isEdit={!!editMachineId}
          detail={editMachineDetail}
          open={modalMachineOpen}
          onOk={async (values: any) => {
            console.log(values);
            const success = editMachineId
              ? await handleEditMachine({ machineId: editMachineId, ...values })
              : await handleAddMachine(values);
            if (success) {
              setEditMachineId(0);
              setModalMachineOpen(false);
              setEditMachineDetail({});
              await fetchMachineList();
            }
          }}
          onCancel={() => {
            setModalMachineOpen(false);
            setEditMachineDetail({});
            setEditMachineId(0);
          }}
        />
      )}
      <AddDirectiveModal
        cateList={cateList}
        isEdit={!!editOtaId}
        detail={editOtaDetail}
        open={modalDirectiveOpen}
        onOk={async (values: any) => {
          const success = editOtaId
            ? await handleEditOta({ id: editOtaId, ...values })
            : await handleAddOta(values);
          if (success) {
            setModalDirectiveOpen(false);
            setEditOtaDetail({});
            setEditOtaId(0);
            await fetchOtaList();
          }
        }}
        onCancel={() => {
          setModalDirectiveOpen(false);
          setEditOtaDetail({});
          setEditOtaId(0);
        }}
      />
      <DetailMachineModal
        data={machineDetail}
        open={detailMachineOpen}
        onCancel={() => setDetailMachineOpen(false)}
        onEdit={async (machineData: any) => {
          const detail = await handleDetailMachine(machineData);
          if (detail) {
            setEditMachineDetail(detail);
            setEditMachineId(machineData.machineId);
            setModalMachineOpen(true);
          }
        }}
        onDelete={async (machineData: any) => {
          const success = await handleDelMachine(machineData);
          if (success) {
            await fetchMachineList();
          }
        }}
      />
    </Card>
  );
};
