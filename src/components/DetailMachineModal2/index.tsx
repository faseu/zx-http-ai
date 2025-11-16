import ConfigParamsModal from '@/components/ConfigParamsModal'; // 导入配置参数组件
import { sendControl } from '@/pages/machine/service';
import { Line } from '@ant-design/plots';
import {
  Button,
  Card,
  Flex,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  TableColumnsType,
  Tag,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
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

/**
 * 发送指令
 * @param fields
 */
const handleSendControl = async (e: any) => {
  const hide = message.loading('正在发送');
  try {
    await sendControl({ ...e });
    hide();
    message.success('发送成功');
    return true;
  } catch (error) {
    hide();
    message.error('发送失败，请重试');
    return false;
  }
};

const DetailMachineModal: React.FC<DetailMachineModalProps> = ({
  open,
  data: { baseData, alarmList, lastData, chartData },
  onCancel,
  onEdit,
  onDelete,
  onSetParams,
  initParam,
}) => {
  const [configModalOpen, setConfigModalOpen] = React.useState(false);
  const [paramConfigs, setParamConfigs] = React.useState([]);
  const [controlValue, setControlValue] = React.useState('');

  // 添加横向滚动容器的引用
  const horizontalScrollRef = React.useRef<HTMLDivElement>(null);

  // 处理横向滚动的鼠标滚轮事件
  const handleHorizontalScroll = React.useCallback((e: WheelEvent) => {
    if (horizontalScrollRef.current) {
      e.preventDefault();
      // 增加滚动速度，乘以倍数（比如3倍）
      const scrollSpeed = 2.4;
      horizontalScrollRef.current.scrollBy({
        left: e.deltaY * scrollSpeed,
        behavior: 'smooth',
      });
    }
  }, []);

  // 添加和移除滚轮事件监听
  React.useEffect(() => {
    const scrollContainer = horizontalScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('wheel', handleHorizontalScroll, {
        passive: false,
      });

      return () => {
        scrollContainer.removeEventListener('wheel', handleHorizontalScroll);
      };
    }
  }, [handleHorizontalScroll]);

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
  // 定义一组淡色渐变
  const lightGradients = [
    'linear-gradient(-90deg, rgba(255,255,255,0.1) 0%, rgba(108,117,125,0.3) 30%)', // 淡灰色
  ];
  const config = {
    data: (() => {
      const configs = getParamConfigs();
      // 根据配置的参数生成数据
      const validConfigs = configs.filter(
        (config) => config.fieldName && config.parsePath,
      );
      const result: any[] = [];

      // 为每个参数单独处理，确保每个参数都有24条数据
      validConfigs.forEach((config) => {
        const paramData =
          chartData
            ?.map((item: any) => {
              const content = JSON.parse(item?.content);
              const time = item?.time.split(' ')[1];
              const value = parseDataByConfig(content, config.parsePath);
              return value !== null
                ? {
                    time,
                    value,
                    category: config.fieldName,
                    unit: config.unit || '',
                  }
                : null;
            })
            .filter(Boolean) // 过滤掉空值
            .slice(0, 24) || []; // 每个参数取前24条有效数据

        result.push(...paramData);
      });

      return result.reverse();
    })(),
    shapeField: 'smooth',
    xField: 'time',
    yField: 'value',
    colorField: 'category', // 根据参数名称显示不同颜色

    point: {
      shapeField: 'square',
      sizeField: 1,
    },

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
        title: '',
        // 设置标签显示数量，避免拥挤
        tickCount: 6, // 最多显示6个时间标签
        // 标签格式化函数
        labelFormatter: (text: string) => {
          // 只显示时分，去掉秒数让标签更简洁
          return text.substring(0, 5); // HH:mm 格式
        },
        // label: false,
        // 简化 transform 配置
        transform: [
          {
            type: 'hide',
            keepHeader: true, // 保留第一个刻度值
            keepTail: true, // 保留最后一个刻度值
          },
        ],
      },
      y: {
        title: '',
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

    // 使用随机或按索引选择
    area: {
      style: {
        fill: lightGradients[Math.floor(Math.random() * lightGradients.length)],
      },
    },
  };

  // 生成卡片数据
  const generateCardData = () => {
    const configs = getParamConfigs();
    const validConfigs = configs.filter(
      (config) => config.fieldName && config.parsePath,
    );

    if (!chartData || chartData.length === 0) return [];

    // 按时间分组数据
    const timeGroupedData = chartData.reduce((acc: any, item: any) => {
      const time = item?.time.split(' ')[1]; // 获取时间部分
      const content = JSON.parse(item?.content);

      if (!acc[time]) {
        acc[time] = {
          time,
          params: {},
        };
      }

      // 为每个配置的参数解析数据
      validConfigs.forEach((config) => {
        const value = parseDataByConfig(content, config.parsePath);
        // 过滤掉空值：null、undefined、空字符串、NaN
        if (
          value !== null &&
          value !== undefined &&
          value !== '' &&
          !Number.isNaN(value)
        ) {
          acc[time].params[config.fieldName] = {
            value,
            unit: config.unit || '',
          };
        }
      });

      return acc;
    }, {});

    // 转换为数组并排序，过滤掉没有任何参数数据的时间点
    return Object.values(timeGroupedData)
      .filter((item: any) => Object.keys(item.params).length > 0) // 过滤掉没有参数数据的时间点
      .sort((a: any, b: any) => a.time.localeCompare(b.time));
  };

  const cardData = generateCardData();

  // 处理配置参数提交
  const handleConfigSubmit = (values: any) => {
    setParamConfigs(values.params);
    setConfigModalOpen(false);
    console.log('配置参数:', values.params);
    onSetParams?.({
      machineId: baseData.machineId,
      control: JSON.stringify(values.params),
    });
    onCancel?.();
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
          <Flex style={{ marginBottom: '6px' }}>
            <div className={styles.title}>参数监控</div>
          </Flex>
          {cardData.length > 0 && (
            <div
              ref={horizontalScrollRef}
              style={{
                width: '100%',
                height: '90px',
                overflowX: 'auto',
                overflowY: 'hidden',
              }}
              className={styles.cardContainer}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  width: 'fit-content',
                  height: '100%',
                }}
              >
                {cardData.map((item: any, index: number) => (
                  <Card
                    key={`${item.time}-${index}`}
                    size="small"
                    style={{
                      minWidth: '100px',
                      maxWidth: '200px',
                      height: '76px', // 改为90px，适配100px容器
                      backgroundColor: '#1f1f1f',
                      borderColor: '#434343',
                      flexShrink: 0,
                    }}
                    bodyStyle={{
                      padding: '8px', // 减少内边距
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      style={{
                        color: '#fff',
                        fontSize: '12px', // 减小字体
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                    >
                      {item.time} {/* 显示 HH:mm 格式 */}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        overflowY: 'auto',
                        display: 'flex',
                        gap: '4px', // 减少间距
                      }}
                      className={styles.cardContainer}
                    >
                      {Object.entries(item.params).map(
                        ([paramName, paramData]: [string, any]) => (
                          <div
                            key={paramName}
                            style={{
                              padding: '2px', // 减少内边距
                              borderRadius: '3px', // 减小圆角
                            }}
                          >
                            <div
                              style={{
                                color: '#87d068',
                                fontSize: '10px', // 减小字体
                                marginBottom: '2px', // 减少下边距
                                fontWeight: '500',
                              }}
                            >
                              {paramName}
                            </div>
                            <div
                              style={{
                                color: '#fff',
                                fontSize: '12px', // 减小字体
                                fontWeight: 'bold',
                              }}
                            >
                              {paramData.value}
                              {paramData.unit && (
                                <span
                                  style={{
                                    color: '#8c8c8c',
                                    fontSize: '10px', // 减小字体
                                    marginLeft: '2px', // 减少左边距
                                  }}
                                >
                                  {paramData.unit}
                                </span>
                              )}
                            </div>
                          </div>
                        ),
                      )}
                      {Object.keys(item.params).length === 0 && (
                        <div
                          style={{
                            color: '#8c8c8c',
                            fontSize: '10px', // 减小字体
                            textAlign: 'center',
                            padding: '10px', // 减少内边距
                          }}
                        >
                          暂无数据
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {cardData.length > 0 && (
            <div style={{ width: '100%', height: '250px' }}>
              <Line {...config} />
            </div>
          )}
          {cardData.length === 0 && (
            <div
              style={{
                width: '100%',
                height: '310px', // 调整为适配100px容器
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8c8c8c',
                backgroundColor: '#1f1f1f',
                borderRadius: '6px',
                border: '1px dashed #434343',
              }}
            >
              暂无监控数据，请先配置参数
            </div>
          )}
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
                  {lastData
                    ?.map((item) => `${item.time} ${item.content}`)
                    .join('\n')}
                </code>
              </pre>
            </div>
          </div>
          <div className={styles.consoleBox}>
            <Flex style={{ marginBottom: '8px' }}>
              <div className={styles.title}>调试控制台</div>
            </Flex>
            <Flex vertical justify="space-between" style={{ height: '194px' }}>
              <TextArea
                rows={7}
                value={controlValue}
                onChange={(e) => setControlValue(e.target.value)}
              />
              <Button
                type="primary"
                size="small"
                block
                onClick={() =>
                  handleSendControl({
                    machineId: baseData.machineId,
                    control: controlValue,
                  })
                }
              >
                发送
              </Button>
            </Flex>
          </div>
        </div>
        <div className={styles.row4}>
          <Space>
            <Button type="primary" onClick={() => setConfigModalOpen(true)}>
              配置参数
            </Button>
            <Button onClick={() => onCancel?.()}>取消</Button>
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
