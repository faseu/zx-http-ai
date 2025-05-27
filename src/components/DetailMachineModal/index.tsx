import { Line } from '@ant-design/plots';
import { Button, Flex, Input, Modal, Table, TableColumnsType, Tag } from 'antd';
import React from 'react';
import styles from './index.less';
const { TextArea } = Input;
interface DetailMachineModalProps {
  open: boolean;
  data: any;

  onCancel?: () => void;
}

interface DataType {
  key: React.Key;
  time: string;
  param: string;
  data: string;
}

const DetailMachineModal: React.FC<DetailMachineModalProps> = ({
  open,
  data: { baseData },
  onCancel,
}) => {
  const columns: TableColumnsType<DataType> = [
    {
      title: '报警时间',
      dataIndex: 'time',
    },
    {
      title: '报警参数',
      dataIndex: 'param',
    },
    {
      title: '原始数据',
      dataIndex: 'data',
      width: '300px',
    },
  ];
  const alarmList: DataType[] = [
    {
      key: '1',
      time: '2025-05-22 14:32:10',
      param: '温度 > 80°C',
      data: '{"temp": 85.6, "unit": "°C"}',
    },
    {
      key: '2',
      time: '2025-05-22 14:33:45',
      param: '压力 > 1.5MPa',
      data: '压力: 1.68MPa',
    },
    {
      key: '3',
      time: '2025-05-22 14:35:12',
      param: '电流 > 20A',
      data: '电流: 21.4A',
    },
    {
      key: '4',
      time: '2025-05-22 14:36:59',
      param: '湿度 > 90%',
      data: '湿度: 92.1%',
    },
    {
      key: '5',
      time: '2025-05-22 14:38:23',
      param: '振动 > 5mm/s',
      data: '振动: 5.7mm/s',
    },
  ];
  const chartData = [
    { year: '1991', value: 3 },
    { year: '1992', value: 4 },
    { year: '1993', value: 3.5 },
    { year: '1994', value: 5 },
    { year: '1995', value: 4.9 },
    { year: '1996', value: 6 },
    { year: '1997', value: 7 },
    { year: '1998', value: 9 },
    { year: '1999', value: 13 },
  ];

  const config = {
    data: chartData,
    xField: 'year',
    yField: 'value',
    point: {
      shapeField: 'square',
      sizeField: 4,
    },
    interaction: {
      tooltip: {
        marker: false,
      },
    },
    style: {
      lineWidth: 2,
    },
    theme: { type: 'classicDark' },
  };

  return (
    <Modal
      title="设备详情页"
      open={open}
      style={{ top: 20 }}
      width={1008}
      footer={false}
      onCancel={onCancel}
    >
      <div className={styles.detailBox}>
        <div className={styles.row1}>
          <div className={styles.machineBox}>
            <Flex justify="space-between">
              <Flex
                justify="center"
                align="center"
                style={{ width: '100px', height: '100px' }}
              >
                <img src={baseData?.img?.[0] || '/admin/machine.png'} alt="" />
              </Flex>
              <div>
                <Tag color={baseData?.isOnline ? '#87d068' : '#f50'}>
                  {baseData?.isOnline ? '在线' : '离线'}
                </Tag>
              </div>
            </Flex>
            <Flex justify="space-between">
              <div>
                <div>
                  <div>{`设备名称：${baseData?.machineName}`}</div>
                  <div>{`设备类型：${baseData?.cateName}`}</div>
                  <div>{`设备位置：${baseData?.address}`}</div>
                  <div>{`ICCID：${baseData?.iccid}`}</div>
                  <div>{`设备用途：${baseData?.application}`}</div>
                </div>
              </div>
              <Flex vertical justify="flex-end">
                <Button type="primary" size="small">
                  编辑
                </Button>
                <Button
                  type="default"
                  style={{
                    backgroundColor: '#8c8c8c',
                    color: '#fff',
                    borderColor: '#8c8c8c',
                    marginTop: '10px',
                  }}
                  size="small"
                >
                  删除
                </Button>
              </Flex>
            </Flex>
          </div>
          <div className={styles.alarmBox}>
            <Flex style={{ marginBottom: '8px' }}>
              <div className={styles.title}>报警信息</div>
            </Flex>
            <Table<DataType>
              scroll={{ y: 150 }}
              pagination={false}
              columns={columns}
              dataSource={alarmList}
              size="small"
              className="mini-table"
            />
          </div>
        </div>
        <div className={styles.chartsBox}>
          <Flex style={{ marginBottom: '8px' }}>
            <div className={styles.title}>参数监控</div>
          </Flex>
          <div style={{ width: '100%', height: '250px' }}>
            <Line {...config} />
          </div>
        </div>
        <div className={styles.row3}>
          <div className={styles.dataBox}>
            <Flex style={{ marginBottom: '8px' }}>
              <div className={styles.title}>设备上报数据</div>
            </Flex>
            <div className={styles.preBox}>
              <pre
                style={{
                  all: 'unset', // 一键清除默认样式
                  whiteSpace: 'pre', // 保留换行和缩进
                  fontFamily: 'monospace', // 可选：设定等宽字体
                }}
              >
                <code>
                  {`void loop() {
  for (int brightness = 0; brightness <= 255; brightness++) {
    analogWrite(ledPin, brightness);
    delay(10);
  }

  for (int brightness = 255; brightness >= 0; brightness--) {
    analogWrite(ledPin, brightness);
    delay(10);
  }
}`}
                </code>
              </pre>
            </div>
          </div>
          <div className={styles.consoleBox}>
            <Flex style={{ marginBottom: '8px' }}>
              <div className={styles.title}>调试控制台</div>
            </Flex>
            <Flex vertical justify="space-between" style={{ height: '194px' }}>
              <TextArea rows={7} />
              <Button type="primary" size="small" block>
                发送
              </Button>
            </Flex>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DetailMachineModal;
