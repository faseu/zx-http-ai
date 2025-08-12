import CustomTitle from '@/components/CustomTitle';
import { Popover, Space, Table, TableColumnsType } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
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

interface ApiUser {
  id: number;
  userName: string;
  password?: string;
  email: string | null;
  realName: string;
  phone: string;
  img: string | null;
  regTime: number;
  regIp: string;
  loginTime: number; // 秒或毫秒时间戳，下面会兼容处理
  loginIp: string;
  updateTime: number;
  isEnabled: number;
  groupId: number;
  deptId: number;
  deptGroupId: number;
  isAdmin: number | null;
  expireDay: number; // 剩余有效天数
  title: string; // 角色/类型
}

function formatPhone(phone?: string) {
  if (!phone) return '-';
  // 138 1234 5678 格式
  const p = phone.replace(/\D/g, '').slice(0, 11);
  if (p.length <= 3) return p;
  if (p.length <= 7) return `${p.slice(0, 3)} ${p.slice(3)}`;
  return `${p.slice(0, 3)} ${p.slice(3, 7)} ${p.slice(7)}`;
}

function tsToDateTime(ts?: number) {
  if (!ts) return '-';
  // 兼容秒/毫秒
  const ms = ts < 10_000_000_000 ? ts * 1000 : ts;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return '-';
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default () => {
  const { id } = JSON.parse(localStorage.getItem('userInfo') || '{}') || {};
  const [user, setUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    if (!id) return;
    getUserInfo({ id })
      .then((res) => {
        // 兼容不同请求封装：有的返回在 res.data，有的直接返回对象
        const data: ApiUser | undefined = (res && (res.data || res)) as
          | ApiUser
          | undefined;
        if (data) {
          setUser(data);
        }
      })
      .catch(() => {
        // 可按需添加错误处理
      });
  }, [id]);

  const avatarSrc = useMemo(
    () => user?.img || 'http://temp.im/110x110',
    [user],
  );
  const displayName = user?.realName || user?.userName || '未知用户';
  const displayType = user?.title || '普通用户';
  const displayId = user?.id ?? '-';
  const displayPhone = formatPhone(user?.phone);
  const displayEmail = user?.email || '-';
  const displayCreateTime = tsToDateTime(user?.regTime);
  const displayExpire = user?.expireDay;

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
          <img src={avatarSrc} alt="用户头像" />
        </div>
        <div className={styles.userInfo}>
          <div className={styles.user}>
            <div className={styles.userName}>{displayName}</div>
            <div className={styles.userType}>{displayType}</div>
          </div>
          <div className={styles.userId}>用户ID：{displayId}</div>
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
              <div className={styles.infoText}>{displayPhone}</div>
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
              <div className={styles.infoText}>{displayEmail}</div>
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
              <div className={styles.infoText}>{displayCreateTime}</div>
            </div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>账号有效期</div>
            <div className={styles.infoContent}>
              <div className={styles.infoText}>{displayExpire}</div>
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
            dataSource={directiveList as any}
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
            dataSource={directiveList as any}
            size="small"
          />
        </div>
      </div>
    </div>
  );
};
