import CustomTitle from '@/components/CustomTitle';
import { Popover, Space, Table, TableColumnsType } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import { getUserInfo } from './service';
interface DataType {
  key: React.Key;
  id: number;
  otaName: string;
  reason: string;
  cateName: string;
  cateId: number;
  fileUrl?: string;
}

export default () => {
  const { id } = JSON.parse(localStorage.getItem('userInfo') || '');

  useEffect(() => {
    getUserInfo({ id }).then((res) => {});
  }, []);
  const columns: TableColumnsType<DataType> = [
    {
      title: '协议名称',
      dataIndex: 'otaName',
      width: 150,
      render: (text) => {
        return (
          <Popover content={text}>
            <div
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
              }}
            >
              {text}
            </div>
          </Popover>
        );
      },
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
      width: 150,
      render: (_, record) => <Space size="middle">1</Space>,
    },
  ];
  const [directiveList, setDirectiveList] = useState([
    1, 2, 6, 4, 5, 6, 7, 8, 9, 21, 2, 42,
  ]);

  return (
    <div className={styles.container}>
      <div className={styles.titleCard}>
        <div className={styles.titleText}>用户中心</div>
      </div>
      <div className={styles.contentBase}>
        <div className={styles.avatar}>
          <img src="http://temp.im/110x110" alt="用户头像" />
        </div>
        <div className={styles.userInfo}>
          <div className={styles.user}>
            <div className={styles.userName}>张明远</div>
            <div className={styles.userType}>个人用户</div>
          </div>
          <div className={styles.userId}>用户ID：123456789</div>
        </div>
      </div>
      <div className={styles.subInfo}>
        <div className={styles.infoContainer}>
          <div className={styles.infoHeader}>
            <img
              src="http://temp.im/24x18"
              alt=""
              className={styles.headerIcon}
            />
            <div className={styles.headerTitle}>基础信息</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>手机号码</div>
            <div className={styles.infoContent}>
              <div className={styles.infoText}>138 123 5678</div>
              <img
                src="http://temp.im/16x16"
                alt=""
                className={styles.copyIcon}
              />
            </div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>电子邮箱</div>
            <div className={styles.infoContent}>
              <div className={styles.infoText}>zhang.mingyuan@example.com</div>
              <img
                src="http://temp.im/16x16"
                alt=""
                className={styles.copyIcon}
              />
            </div>
          </div>
        </div>
        <div className={styles.infoContainer}>
          <div className={styles.infoHeader}>
            <img
              src="http://temp.im/24x18"
              alt=""
              className={styles.headerIcon}
            />
            <div className={styles.headerTitle}>账号信息</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>创建时间</div>
            <div className={styles.infoContent}>
              <div className={styles.infoText}>2025-05-12 12:34:32</div>
            </div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>账号有效期</div>
            <div className={styles.infoContent}>
              <div className={styles.infoText}>剩余 8 个月 15 天</div>
            </div>
          </div>
        </div>
        <div className={styles.infoContainer}>
          <div className={styles.infoHeader}>
            <img
              src="http://temp.im/24x18"
              alt=""
              className={styles.headerIcon}
            />
            <div className={styles.headerTitle}>账号管理</div>
          </div>
          <div className={styles.btnList}>
            <div className={styles.btnItem}>
              <img src="http://temp.im/16x16" alt="" className={styles.icon} />
              <div className={styles.btnText}>修改密码</div>
            </div>
            <div className={styles.btnItem}>
              <img src="http://temp.im/16x16" alt="" className={styles.icon} />
              <div className={styles.btnText}>更换邮箱</div>
            </div>
            <div className={styles.btnItem}>
              <img src="http://temp.im/16x16" alt="" className={styles.icon} />
              <div className={styles.btnText}>更换手机</div>
            </div>
            <div className={styles.btnItem}>
              <img src="http://temp.im/16x16" alt="" className={styles.icon} />
              <div className={styles.btnText}>编辑资料</div>
            </div>
            <div className={styles.btnItem}>
              <img src="http://temp.im/16x16" alt="" className={styles.icon} />
              <div className={styles.btnText}>退出登录</div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.other}>
        <div className={styles.otherItem}>
          <CustomTitle title="源码列表" />
          <Table<DataType>
            style={{ width: '100%' }}
            key="id"
            scroll={{ y: 200 }}
            pagination={false}
            columns={columns}
            dataSource={directiveList}
            size="small"
          />
        </div>
        <div className={styles.otherItem}>
          <CustomTitle
            title="用户列表"
            searchPlaceholder="搜索用户..."
            addButtonText="添加用户"
          />
          <Table<DataType>
            style={{ width: '100%' }}
            key="id"
            scroll={{ y: 200 }}
            pagination={false}
            columns={columns}
            dataSource={directiveList}
            size="small"
          />
        </div>
      </div>
    </div>
  );
};
