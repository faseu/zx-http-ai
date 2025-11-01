import ConfigParamsModal from '@/components/ConfigParamsModal'; // 导入配置参数组件
import { Line } from '@ant-design/plots';
import {
  Button,
  Flex,
  Modal,
  Popconfirm,
  Space,
  Table,
  TableColumnsType,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import styles from './index.less';

interface DetailMachineModalProps {
  open: boolean;
  data: any;
  initParam: any;
  onCancel?: () => void;
  // 新增：编辑和删除的回调函数
  onEdit?: (machineData: any) => void;
  onDelete?: (machineData: any) => void;
  onSetParams?: (machineData: any) => void;
}

const DetailMachineModal: React.FC<DetailMachineModalProps> = ({
  open,
  data: { baseData, alarmList, chartData },
  onCancel,
  onEdit,
  onDelete,
  onSetParams,
  initParam,
}) => {
  const [configModalOpen, setConfigModalOpen] = React.useState(false);
  const [paramConfigs, setParamConfigs] = React.useState([]);

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

  // 根据配置解析数据的工具函数
  const parseDataByConfig = (rawData: any, parsePath: string) => {
    const keys = parsePath.split('.');
    let result = rawData;
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return null;
      }
    }
    return result;
  };

  // 获取参数配置
  const getParamConfigs = () => {
    try {
      const controlData = JSON.parse(baseData?.control || '[]');
      return Array.isArray(controlData) ? controlData : [];
    } catch {
      return [];
    }
  };

  const config = {
    data: chartData
      ?.flatMap((item: any) => {
        const content = JSON.parse(item?.content);
        const time = item?.time.split(' ')[1];
        const configs = getParamConfigs();

        // 如果没有配置参数，使用默认的 Temperature
        if (configs.length === 0) {
          return {
            time,
            value: parseDataByConfig(content, 'Temperature'),
            category: 'Temperature',
            unit: '°C',
          };
        }

        // 根据配置的参数生成数据
        return configs
          .filter((config) => config.fieldName && config.parsePath) // 过滤有效配置
          .map((config) => ({
            time,
            value: parseDataByConfig(content, config.parsePath),
            category: config.fieldName,
            unit: config.unit || '',
          }))
          .filter((item) => item.value !== null); // 过滤解析失败的数据
      })
      .filter(Boolean), // 过滤掉空值

    xField: 'time',
    yField: 'value',
    colorField: 'category', // 根据参数名称显示不同颜色

    point: {
      shapeField: 'square',
      sizeField: 1,
    },

    interaction: {
      tooltip: {
        marker: false,
        title: (datum: any) => `时间: ${datum.time}`,
        items: [
          (datum: any) => ({
            name: datum.category,
            value: `${datum.value}${datum.unit ? ` ${datum.unit}` : ''}`,
          }),
        ],
      },
    },

    style: {
      lineWidth: 1,
    },

    theme: { type: 'classicDark' },

    // 图例配置
    legend: {
      position: 'top' as const,
    },

    // 坐标轴配置
    axis: {
      x: {
        title: '时间',
        // 设置标签显示数量，避免拥挤
        tickCount: 6, // 最多显示6个时间标签
        // 标签旋转角度，避免重叠
        labelFormatter: (text: string) => {
          // 只显示时分，去掉秒数让标签更简洁
          return text.substring(0, 5); // HH:mm 格式
        },
        // 标签样式
        label: {
          rotate: -45, // 旋转45度避免重叠
          offset: 10,
          style: {
            fontSize: 10,
          },
        },
        // 网格线配置
        grid: {
          line: {
            style: {
              stroke: '#434343',
              lineWidth: 1,
              lineDash: [2, 2],
            },
          },
        },
      },
      y: {
        title: '数值',
        // y轴网格线
        grid: {
          line: {
            style: {
              stroke: '#434343',
              lineWidth: 1,
              lineDash: [2, 2],
            },
          },
        },
      },
    },
  };

  // 处理配置参数提交
  const handleConfigSubmit = (values: any) => {
    setParamConfigs(values.params);
    setConfigModalOpen(false);
    console.log('配置参数:', values.params);
    onSetParams?.({
      machineId: baseData.machineId,
      control: JSON.stringify(values.params),
    });
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
                  src={baseData?.img || '/admin/machine.png'}
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
          <Space>
            <Button type="primary" onClick={() => setConfigModalOpen(true)}>
              配置参数
            </Button>
            <Button onClick={() => onCancel()}>取消</Button>
          </Space>
        </div>
      </div>

      {/* 配置参数弹窗 */}
      <ConfigParamsModal
        open={configModalOpen}
        onCancel={() => setConfigModalOpen(false)}
        onSubmit={handleConfigSubmit}
        initialValues={{ params: JSON.parse(baseData?.control || '[]') }}
      />
    </Modal>
  );
};

export default DetailMachineModal;
