import { Line } from '@ant-design/plots';
import {
  Button,
  Flex,
  Input,
  Modal,
  Popconfirm,
  Table,
  TableColumnsType,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import styles from './index.less';
const { TextArea } = Input;

interface DetailMachineModalProps {
  open: boolean;
  data: any;
  onCancel?: () => void;
  // 新增：编辑和删除的回调函数
  onEdit?: (machineData: any) => void;
  onDelete?: (machineData: any) => void;
}

const DetailMachineModal: React.FC<DetailMachineModalProps> = ({
  open,
  data: { baseData, alarmList },
  onCancel,
  onEdit,
  onDelete,
}) => {
  const columns: TableColumnsType<any> = [
    {
      title: '报警时间',
      dataIndex: 'regTime',
      render: (text) => dayjs.unix(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '报警参数',
      dataIndex: 'item',
    },
    {
      title: '原始数据',
      dataIndex: 'content',
      width: '300px',
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

  // 处理编辑按钮点击
  const handleEdit = () => {
    if (onEdit && baseData) {
      onEdit(baseData);
      // 关闭详情弹窗
      onCancel?.();
    }
  };

  // 处理删除确认
  const handleDelete = async () => {
    if (onDelete && baseData) {
      await onDelete(baseData);
      // 关闭详情弹窗
      onCancel?.();
    }
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
                <img
                  style={{ width: '100px', height: '100px' }}
                  src={baseData?.img?.[0] || '/admin/machine.png'}
                  alt=""
                />
              </Flex>
              <div>
                <Tag color={baseData?.isOnline ? '#87d068' : '#A40000'}>
                  {baseData?.isOnline ? '在线' : '离线'}
                </Tag>
              </div>
            </Flex>
            <Flex justify="space-between">
              <div>
                <div>
                  <div>{`设备名称：${baseData?.machineName || ''}`}</div>
                  <div>{`设备类型：${baseData?.cateName || ''}`}</div>
                  <div>{`设备位置：${baseData?.address || ''}`}</div>
                  <div>{`固件版本：${baseData?.version || 'V1.2.3'}`}</div>
                  <div>{`设备用途：${baseData?.application || ''}`}</div>
                </div>
              </div>
              <Flex vertical justify="flex-end">
                <Button type="primary" size="small" onClick={handleEdit}>
                  编辑
                </Button>
                <Popconfirm
                  title="删除设备"
                  description="删除后无法恢复，确定删除设备?"
                  okText="确定"
                  cancelText="取消"
                  onConfirm={handleDelete}
                >
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
                </Popconfirm>
              </Flex>
            </Flex>
          </div>
          <div className={styles.alarmBox}>
            <Flex style={{ marginBottom: '8px' }}>
              <div className={styles.title}>报警信息</div>
            </Flex>
            <Table
              key="id"
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
