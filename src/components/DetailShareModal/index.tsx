import { Button, message, Modal, Popconfirm, Spin } from 'antd';
import React from 'react';

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  data: any;
  loading: boolean;
  onStatusChange?: (id: string, status: number) => Promise<void>;
  showAuditButtons?: boolean; // 控制是否显示审核按钮
}

const DetailModal: React.FC<DetailModalProps> = ({
  open,
  onClose,
  data,
  loading,
  onStatusChange,
  showAuditButtons = false,
}) => {
  // 处理审核状态变更
  const handleStatusChange = async (status: number) => {
    if (onStatusChange && data?.id) {
      try {
        await onStatusChange(data.id, status);
        message.success('审核状态更新成功');
      } catch (error) {
        message.error('审核状态更新失败');
      }
    }
  };

  // 获取状态显示文本和颜色
  const getStatusInfo = (status: any) => {
    switch (status) {
      case 0:
        return { text: '审核不通过', color: '#ff4d4f' };
      case 1:
        return { text: '审核中', color: '#ffb347' };
      case 2:
        return { text: '审核通过', color: '#52c41a' };
      default:
        return { text: '审核中', color: '#ffb347' };
    }
  };

  const statusInfo = getStatusInfo(data?.isEnabled);

  return (
    <Modal
      title="内容详情"
      open={open}
      onCancel={onClose}
      footer={[
        // 审核按钮组
        ...(showAuditButtons && data
          ? [
              <Popconfirm
                key="reject"
                title="确认审核不通过"
                description="确定要将此项目审核为不通过吗？"
                onConfirm={() => handleStatusChange(0)}
                okText="确定"
                cancelText="取消"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  style={{
                    marginRight: '8px',
                  }}
                >
                  审核不通过
                </Button>
              </Popconfirm>,
              <Button
                key="approve"
                type="primary"
                style={{
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                  marginRight: '8px',
                }}
                onClick={() => handleStatusChange(2)}
              >
                审核通过
              </Button>,
            ]
          : []),
        <Button
          key="close"
          style={{
            backgroundColor: '#232325',
            borderColor: '#232325',
            color: '#ffffff',
          }}
          onClick={onClose}
        >
          关闭
        </Button>,
      ]}
      width={800}
      style={{
        top: 20,
      }}
      styles={{
        body: {
          backgroundColor: '#1a1a1a',
          padding: '24px',
        },
      }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" style={{ color: '#ffffff' }} />
        </div>
      ) : (
        data && (
          <div style={{ padding: '0', color: '#ffffff' }}>
            {/* 封面图片 */}
            {data.img && (
              <div style={{ marginBottom: '24px' }}>
                <h4
                  style={{
                    marginBottom: '12px',
                    color: '#ffffff',
                    fontWeight: 'bold',
                  }}
                >
                  封面图片：
                </h4>
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={data.img}
                    alt={data.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      height: 'auto',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      border: '1px solid #333333',
                    }}
                  />
                </div>
              </div>
            )}

            {/* 内容名称 */}
            <div style={{ marginBottom: '20px' }}>
              <h4
                style={{
                  marginBottom: '8px',
                  color: '#ffffff',
                  fontWeight: 'bold',
                }}
              >
                内容名称：
              </h4>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#ffffff',
                  padding: '12px 16px',
                  backgroundColor: '#2d2d2d',
                  borderRadius: '6px',
                  border: '1px solid #404040',
                }}
              >
                {data.name || '暂无名称'}
              </div>
            </div>

            {/* 指令描述 */}
            <div style={{ marginBottom: '20px' }}>
              <h4
                style={{
                  marginBottom: '8px',
                  color: '#ffffff',
                  fontWeight: 'bold',
                }}
              >
                指令描述：
              </h4>
              <div
                style={{
                  lineHeight: '1.6',
                  color: '#cccccc',
                  backgroundColor: '#232325',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #404040',
                  whiteSpace: 'pre-wrap',
                  minHeight: '60px',
                }}
              >
                {data.content || '暂无描述'}
              </div>
            </div>

            {/* 功能说明 */}
            {data.remark && (
              <div style={{ marginBottom: '20px' }}>
                <h4
                  style={{
                    marginBottom: '8px',
                    color: '#ffffff',
                    fontWeight: 'bold',
                  }}
                >
                  功能说明：
                </h4>
                <div
                  style={{
                    lineHeight: '1.6',
                    color: '#cccccc',
                    backgroundColor: '#232325',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #404040',
                    whiteSpace: 'pre-wrap',
                    minHeight: '60px',
                  }}
                >
                  {data.remark}
                </div>
              </div>
            )}

            {/* 标签 */}
            {data.tag && (
              <div style={{ marginBottom: '20px' }}>
                <h4
                  style={{
                    marginBottom: '8px',
                    color: '#ffffff',
                    fontWeight: 'bold',
                  }}
                >
                  标签：
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {data.tag.split(',').map((tag: string, index: number) => (
                    <span
                      key={index}
                      style={{
                        padding: '6px 14px',
                        background:
                          'linear-gradient(315deg, rgba(47, 85, 118, 0.8) 0%, rgba(72, 71, 119, 0.8) 100%)',
                        color: '#ffffff',
                        borderRadius: '16px',
                        fontSize: '13px',
                        border: '1px solid #4a5568',
                        fontWeight: '500',
                      }}
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 材料清单 */}
            {data.materialList && (
              <div style={{ marginBottom: '20px' }}>
                <h4
                  style={{
                    marginBottom: '8px',
                    color: '#ffffff',
                    fontWeight: 'bold',
                  }}
                >
                  材料清单：
                </h4>
                <div
                  style={{
                    backgroundColor: '#232325',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #404040',
                  }}
                >
                  {(() => {
                    try {
                      const materials = JSON.parse(data.materialList);
                      return (
                        <div style={{ display: 'grid', gap: '12px' }}>
                          {materials.map((material: any, index: number) => (
                            <div
                              key={index}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                backgroundColor: '#2d2d2d',
                                borderRadius: '6px',
                                border: '1px solid #404040',
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: '500',
                                  color: '#ffffff',
                                }}
                              >
                                {material.name}
                              </span>
                              <span style={{ color: '#cccccc' }}>
                                数量: {material.数量}
                              </span>
                              {material.购买连接 && (
                                <a
                                  href={material.购买连接}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: '#4a9eff',
                                    textDecoration: 'underline',
                                    fontWeight: '500',
                                  }}
                                >
                                  购买链接
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    } catch (e) {
                      return (
                        <span style={{ color: '#888888' }}>
                          材料清单格式错误
                        </span>
                      );
                    }
                  })()}
                </div>
              </div>
            )}

            {/* 文件下载区域 */}
            <div style={{ marginBottom: '20px' }}>
              <h4
                style={{
                  marginBottom: '12px',
                  color: '#ffffff',
                  fontWeight: 'bold',
                }}
              >
                相关文件：
              </h4>
              <div style={{ display: 'grid', gap: '12px' }}>
                {/* 3D打印文件 */}
                {data['3dfile'] && (
                  <div
                    style={{
                      padding: '12px 16px',
                      background:
                        'linear-gradient(315deg, rgba(47, 85, 118, 0.4) 0%, rgba(72, 71, 119, 0.4) 100%)',
                      border: '1px solid #4a5568',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ color: '#ffffff', fontWeight: '500' }}>
                      📁 3D打印文件
                    </span>
                    <a
                      href={data['3dfile']}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#4a9eff',
                        textDecoration: 'none',
                        padding: '4px 12px',
                        border: '1px solid #4a9eff',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                      }}
                    >
                      下载文件
                    </a>
                  </div>
                )}

                {/* 协议文档 */}
                {data.otafile && (
                  <div
                    style={{
                      padding: '12px 16px',
                      background:
                        'linear-gradient(315deg, rgba(118, 85, 47, 0.4) 0%, rgba(119, 103, 72, 0.4) 100%)',
                      border: '1px solid #8b7355',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ color: '#ffffff', fontWeight: '500' }}>
                      📄 协议文档
                    </span>
                    <a
                      href={data.otafile}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#ffb347',
                        textDecoration: 'none',
                        padding: '4px 12px',
                        border: '1px solid #ffb347',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                      }}
                    >
                      下载文件
                    </a>
                  </div>
                )}

                {/* 实现代码 */}
                {data.code && (
                  <div
                    style={{
                      padding: '12px 16px',
                      background:
                        'linear-gradient(315deg, rgba(47, 118, 76, 0.4) 0%, rgba(72, 119, 84, 0.4) 100%)',
                      border: '1px solid #4a8b5c',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ color: '#ffffff', fontWeight: '500' }}>
                      💻 实现代码
                    </span>
                    <a
                      href={data.code}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#52c878',
                        textDecoration: 'none',
                        padding: '4px 12px',
                        border: '1px solid #52c878',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                      }}
                    >
                      下载文件
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* 审核状态 */}
            <div style={{ marginBottom: '16px' }}>
              <h4
                style={{
                  marginBottom: '8px',
                  color: '#ffffff',
                  fontWeight: 'bold',
                }}
              >
                审核状态：
              </h4>
              <span
                style={{
                  padding: '6px 16px',
                  backgroundColor: statusInfo.color,
                  color: '#ffffff',
                  borderRadius: '16px',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                {statusInfo.text}
              </span>
            </div>

            {/* 时间信息 */}
            {data.createTime && (
              <div style={{ marginBottom: '12px' }}>
                <span style={{ color: '#888888', fontSize: '14px' }}>
                  📅 发布时间：{data.createTime}
                </span>
              </div>
            )}

            {data.author && (
              <div style={{ marginBottom: '12px' }}>
                <span style={{ color: '#888888', fontSize: '14px' }}>
                  👤 发布者：{data.author}
                </span>
              </div>
            )}
          </div>
        )
      )}
    </Modal>
  );
};

export default DetailModal;
