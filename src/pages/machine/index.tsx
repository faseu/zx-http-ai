import AddDirectiveModal from '@/components/AddDirectiveModal';
import AddMachineModal from '@/components/AddMachineModal';
import AIBox from '@/components/AIBox';
import CustomTitle from '@/components/CustomTitle';
import DetailMachineModal from '@/components/DetailMachineModal';
import DirectiveItem from '@/components/DirectiveItem';
import MachineItem from '@/components/MachineItem';
import {
  addMachine,
  addOta,
  delMachine,
  detailMachine,
  editMachine,
  getCateList,
  getMachineList,
  getOtaList,
} from '@/pages/machine/service';
import { useModel } from '@umijs/max';
import { Card, List, Space, Table, TableColumnsType, message } from 'antd';
import React, { useEffect, useState } from 'react';
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
 * 新增协议
 * @param fields
 */
const handleAddOta = async (fields: any) => {
  const hide = message.loading('正在新增');
  try {
    await addOta({
      ...fields,
      fileUrl: 'aaaaaaaaaa',
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

interface DataType {
  key: React.Key;
  name: string;
  age: string;
  address: string;
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
  const [machineList, setMachineList] = useState([]);
  const [directiveList, setDirectiveList] = useState([]);
  const [cateList, setCateList] = useState([]);
  const [editMachineId, setEditMachineId] = useState(0);
  const [editMachineDetail, setEditMachineDetail] = useState({});

  // 新增：管理选中状态的state
  const [selectedMachineIds, setSelectedMachineIds] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  const list: any[] = [];
  for (let i = 1; i < 7; i += 1) {
    list.push({
      id: i,
      title: '卡片列表',
      description:
        'Umi@4 实战教程，专门针对中后台项目零基础的朋友，不管你是前端还是后端，看完这个系列你也有能力合理"抗雷"，"顶坑"',
    });
  }
  const data = [
    'Racing car sprays burning fuel into crowd.',
    'Japanese princess to wed commoner.',
    'Australian walks 100km after outback crash.',
  ];

  const fetchMachineList = async () => {
    const { data } = await getMachineList({
      page: 1,
      psize: 1000,
    });
    setMachineList(data);
  };

  const fetchOtaList = async () => {
    const { data } = await getOtaList();
    setDirectiveList(data);
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
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a>编辑</a>
          <a>删除</a>
        </Space>
      ),
    },
  ];

  const addMachine = () => {
    setModalMachineOpen(true);
  };
  const addDirective = () => {
    setModalDirectiveOpen(true);
  };

  // 新增：全选/取消全选处理函数
  const handleSelectAll = (checked: boolean) => {
    setIsAllSelected(checked);
    if (checked) {
      // 全选：选中所有设备ID
      const allMachineIds = machineList.map(
        (machine: any) => machine.machineId,
      );
      setSelectedMachineIds(allMachineIds);
    } else {
      // 取消全选：清空选中列表
      setSelectedMachineIds([]);
    }
  };

  // 新增：单个设备选中/取消选中处理函数
  const handleMachineCheck = (machineId: number, checked: boolean) => {
    let newSelectedIds: number[];

    if (checked) {
      // 添加到选中列表
      newSelectedIds = [...selectedMachineIds, machineId];
    } else {
      // 从选中列表移除
      newSelectedIds = selectedMachineIds.filter((id) => id !== machineId);
    }

    setSelectedMachineIds(newSelectedIds);

    // 更新全选状态
    const allMachineIds = machineList.map((machine: any) => machine.machineId);
    setIsAllSelected(
      newSelectedIds.length === allMachineIds.length &&
        allMachineIds.length > 0,
    );
  };

  // 新增：当设备列表变化时，重新计算全选状态
  useEffect(() => {
    if (machineList.length > 0) {
      const allMachineIds = machineList.map(
        (machine: any) => machine.machineId,
      );
      const currentValidSelected = selectedMachineIds.filter((id) =>
        allMachineIds.includes(id),
      );

      // 更新有效的选中列表
      if (currentValidSelected.length !== selectedMachineIds.length) {
        setSelectedMachineIds(currentValidSelected);
      }

      // 更新全选状态
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
            <AIBox />
          </Card>
        </div>
        <div
          style={{
            width: '50%',
            padding: '0 50px',
          }}
        >
          <CustomTitle
            title="设备管理"
            showCheckbox
            searchPlaceholder="搜索设备..."
            addButtonText="新增设备"
            onSubmit={addMachine}
            // 新增：传递全选相关props
            isAllSelected={isAllSelected}
            onSelectAll={handleSelectAll}
            selectedCount={selectedMachineIds.length}
            totalCount={machineList.length}
          />
          <div className={styles.hideScrollbar}>
            <List
              rowKey="id"
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
                    // 新增：传递选中状态和处理函数
                    isChecked={selectedMachineIds.includes(item.machineId)}
                    onCheckChange={(checked: boolean) =>
                      handleMachineCheck(item.machineId, checked)
                    }
                    onEditMachine={async (item: any) => {
                      const data = await handleDetailMachine(item);
                      setEditMachineDetail(data);
                      setEditMachineId(data.machineId);
                      setModalMachineOpen(true);
                    }}
                    onDelMachine={async (item: any) => {
                      await handleDelMachine(item);
                      await fetchMachineList();
                    }}
                    onGetDetail={async (item: any) => {
                      await handleDetailMachine(item);
                      setDetailMachineOpen(true);
                    }}
                  />
                );
              }}
            />
          </div>

          <CustomTitle title="指令历史" showEmpty />
          <List
            dataSource={data}
            renderItem={() => {
              return <DirectiveItem text="指令历史" />;
            }}
          />
          <CustomTitle
            title="协议管理"
            searchPlaceholder="搜索协议..."
            addButtonText="新增协议"
            onSubmit={addDirective}
          />
          <Table<DataType>
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
        open={modalDirectiveOpen}
        onOk={async (values: any) => {
          const success = await handleAddOta(values);
          if (success) {
            setModalDirectiveOpen(false);
            await fetchOtaList();
          }
        }}
        onCancel={() => setModalDirectiveOpen(false)}
      />
      <DetailMachineModal
        open={detailMachineOpen}
        onCancel={() => setDetailMachineOpen(false)}
      />
    </Card>
  );
};
