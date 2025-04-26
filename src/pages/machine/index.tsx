import AddDirectiveModal from '@/components/AddDirectiveModal';
import AddMachineModal from '@/components/AddMachineModal';
import AIBox from '@/components/AIBox';
import CustomTitle from '@/components/CustomTitle';
import DirectiveItem from '@/components/DirectiveItem';
import MachineItem from '@/components/MachineItem';
import { useModel } from '@umijs/max';
import {
  Card,
  Divider,
  Flex,
  List,
  Space,
  Table,
  TableColumnsType,
} from 'antd';
import React, { useState } from 'react';
import styles from './index.less';

interface DataType {
  key: React.Key;
  name: string;
  age: string;
  address: string;
}

export default () => {
  const { initialState } = useModel('@@initialState');
  const isDark = initialState?.settings?.navTheme === 'realDark';
  const [modalMachineOpen, setModalMachineOpen] = useState(false);
  const [modalDirectiveOpen, setModalDirectiveOpen] = useState(false);

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

  const columns: TableColumnsType<DataType> = [
    {
      title: '协议名称',
      dataIndex: 'name',
    },
    {
      title: '硬件厂家',
      dataIndex: 'age',
    },
    {
      title: '设备型号',
      dataIndex: 'address',
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

  const tableData: DataType[] = [
    {
      key: '1',
      name: 'John Brown',
      age: '施耐德电气',
      address: 'TM241CE40T',
    },
    {
      key: '2',
      name: 'Jim Green',
      age: '施耐德电气',
      address: 'TM241CE40T',
    },
    {
      key: '3',
      name: 'Joe Black',
      age: '施耐德电气',
      address: 'TM241CE40T',
    },
    {
      key: '4',
      name: 'Joe Black',
      age: '施耐德电气',
      address: 'TM241CE40T',
    },
    {
      key: '5',
      name: 'Joe Black',
      age: '施耐德电气',
      address: 'TM241CE40T',
    },
    {
      key: '6',
      name: 'Joe Black',
      age: '施耐德电气',
      address: 'TM241CE40T',
    },
  ];

  const addMachine = () => {
    setModalMachineOpen(true);
  };
  const addDirective = () => {
    setModalDirectiveOpen(true);
  };
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
            dataSource={[...list]}
            renderItem={() => {
              return <MachineItem text="这是设备信息" />;
            }}
          />
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
            dataSource={tableData}
            size="small"
          />
        </Flex>
      </Flex>
      <AddMachineModal
        open={modalMachineOpen}
        onOk={() => setModalMachineOpen(false)}
        onCancel={() => setModalMachineOpen(false)}
      />
      <AddDirectiveModal
        open={modalDirectiveOpen}
        onOk={() => setModalDirectiveOpen(false)}
        onCancel={() => setModalDirectiveOpen(false)}
      />
    </Card>
  );
};
