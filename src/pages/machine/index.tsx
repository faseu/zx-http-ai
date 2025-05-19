import AddDirectiveModal from '@/components/AddDirectiveModal';
import AddMachineModal from '@/components/AddMachineModal';
import AIBox from '@/components/AIBox';
import CustomTitle from '@/components/CustomTitle';
import DirectiveItem from '@/components/DirectiveItem';
import MachineItem from '@/components/MachineItem';
import {
  addMachine,
  addOta,
  delMachine,
  getCateList,
  getMachineList,
  getOtaList,
} from '@/pages/machine/service';
import { useModel } from '@umijs/max';
import {
  Card,
  Divider,
  Flex,
  List,
  Space,
  Table,
  TableColumnsType,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

/**
 * add节点
 * @param fields
 */
const handleAddMachine = async (fields: any) => {
  const hide = message.loading('正在新增');
  try {
    await addMachine({
      ...fields,
      img: 'aaaaaaaaaa',
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
 * add节点
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
 *  del节点
 * @param record
 * @param action
 */
const handleDelMachine = async (record: any) => {
  const hide = message.loading('正在删除');
  try {
    await delMachine({ machineId: record.machineId });
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
  const [machineList, setMachineList] = useState([]);
  const [directiveList, setDirectiveList] = useState([]);
  const [cateList, setCateList] = useState([]);

  const list: any[] = [];
  for (let i = 1; i < 7; i += 1) {
    list.push({
      id: i,
      title: '卡片列表',
      description:
        'Umi@4 实战教程，专门针对中后台项目零基础的朋友，不管你是前端还是后端，看完这个系列你也有能力合理“抗雷”，“顶坑”',
    });
  }
  const data = [
    'Racing car sprays burning fuel into crowd.',
    'Japanese princess to wed commoner.',
    'Australian walks 100km after outback crash.',
  ];

  const fetchMachineList = async () => {
    const { data } = await getMachineList();
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
          padding: '0 0 50px 0',
        },
      }}
      style={{ borderRadius: 0 }}
    >
      <Flex gap={12}>
        <Flex vertical style={{ flex: 7 }} gap={6}>
          <Card
            className={styles.aiBoxCard}
            styles={{
              body: {
                height: '100%',
              },
            }}
            style={{ marginTop: 8, marginLeft: 8, background: '#222020' }}
          >
            <AIBox />
          </Card>
        </Flex>
        <Divider type="vertical" style={{ height: '100%' }} />
        <Flex vertical style={{ flex: 5, paddingRight: '24px' }}>
          <CustomTitle
            title="设备管理"
            searchPlaceholder="搜索设备..."
            addButtonText="新增设备"
            onSubmit={addMachine}
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
                    onDelMachine={async (item: any) => {
                      await handleDelMachine(item);
                      await fetchMachineList();
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
        </Flex>
      </Flex>
      <AddMachineModal
        cateList={cateList}
        open={modalMachineOpen}
        onOk={async (values: any) => {
          const success = await handleAddMachine(values);
          if (success) {
            setModalMachineOpen(false);
            await fetchMachineList();
          }
        }}
        onCancel={() => setModalMachineOpen(false)}
      />
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
    </Card>
  );
};
