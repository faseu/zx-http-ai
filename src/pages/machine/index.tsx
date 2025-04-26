import MachineItem from '@/components/MachineItem';
import { useModel } from '@umijs/max';
import type { ConfigProviderProps, GetProp, TableColumnsType } from 'antd';
import { Card, Divider, Flex, List, Table } from 'antd';
import React from 'react';

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
}

export default () => {
  const { initialState } = useModel('@@initialState');
  const isDark = initialState?.settings?.navTheme === 'realDark';
  const [value, setValue] = React.useState('');
  const [direction, setDirection] =
    React.useState<GetProp<ConfigProviderProps, 'direction'>>('ltr');

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
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'age',
      dataIndex: 'age',
    },
    {
      title: 'address',
      dataIndex: 'address',
    },
  ];

  const tableData: DataType[] = [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sydney No. 1 Lake Park',
    },
  ];

  return (
    <Card>
      <Flex style={{ height: 650 }} gap={12}>
        <Flex vertical style={{ flex: 7 }} gap={6}>
          1
        </Flex>
        <Divider type="vertical" style={{ height: '100%' }} />
        <Flex vertical style={{ flex: 5 }} gap={6}>
          <List
            rowKey="id"
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 3,
              lg: 3,
              xl: 3,
              xxl: 3,
            }}
            dataSource={[...list]}
            renderItem={(item) => {
              return <MachineItem text="这是设备信息" />;
            }}
          />
          <List
            header={<div>指令历史</div>}
            bordered
            dataSource={data}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
          <Table<DataType> columns={columns} dataSource={tableData} />
        </Flex>
      </Flex>
    </Card>
  );
};
