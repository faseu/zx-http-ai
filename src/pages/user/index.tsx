import AddCodeModal from '@/components/AddCodeModal';
import CustomTitle from '@/components/CustomTitle';
import UploadImage from '@/components/UploadImage';
import { getOtaList } from '@/pages/machine/service';
import { DownloadOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import {
  Form,
  Input,
  message,
  Modal,
  Popover,
  Space,
  Table,
  TableColumnsType,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './index.less';
import {
  addOta,
  changesUserInfo,
  editOta,
  getUserInfo,
  getUserList,
} from './service';

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

/**
 * 新增协议
 * @param fields
 */
const handleAddOta = async (fields: any) => {
  const hide = message.loading('正在新增');
  try {
    await addOta({
      ...fields,
      cate: 'code',
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
 * 编辑协议
 * @param fields
 */
const handleEditOta = async (fields: any) => {
  const hide = message.loading('正在更新');
  try {
    await editOta({
      ...fields,
      cate: 'code',
    });
    hide();
    message.success('更新成功');
    return true;
  } catch (error) {
    hide();
    message.error('更新失败请重试！');
    return false;
  }
};

export default () => {
  const { id } = JSON.parse(localStorage.getItem('userInfo') || '{}') || {};
  const [user, setUser] = useState<ApiUser | null>(null);
  // 添加用户：弹窗与表单
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserForm] = Form.useForm();

  // 编辑资料弹窗
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm] = Form.useForm();

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [codeList, setCodeList] = useState([1]);
  const [userList, setUserList] = useState([]);
  const [total, setTotal] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);

  const [editOtaId, setEditOtaId] = useState(0);
  const [modalDirectiveOpen, setModalDirectiveOpen] = useState(false);
  const [editOtaDetail, setEditOtaDetail] = useState({});

  // 获取用户列表
  const fetchUserList = async (
    nextPage: number = page,
    nextPageSize: number = pageSize,
  ) => {
    const res = await getUserList({
      page: nextPage,
      psize: 100,
    });
    setUserList(res?.data || []);
  };

  // 获取协议列表（带分页）
  const fetchOtaList = async (
    nextPage: number = page,
    nextPageSize: number = pageSize,
  ) => {
    try {
      setLoading(true);
      const res = await getOtaList({
        page: nextPage,
        psize: nextPageSize,
        cate: 'code',
      });
      setCodeList(res?.data || []);
      setTotal(res?.total ?? 0);
      setPage(nextPage);
      setPageSize(nextPageSize);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchUserList(1, 1000);
    fetchOtaList(1, pageSize);

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
      title: '描述',
      dataIndex: 'reason',
    },
    {
      title: '分类',
      dataIndex: 'cateName',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <a href={record.fileUrl} target="_blank" rel="noopener noreferrer">
            <DownloadOutlined />
            <span>下载</span>
          </a>
        </Space>
      ),
    },
  ];

  const userColumns: TableColumnsType<DataType> = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '姓名',
      dataIndex: 'realName',
    },
    {
      title: '角色',
      dataIndex: 'title',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
    },

    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <a onClick={async () => {}}>编辑</a>
        </Space>
      ),
    },
  ];

  const handleAddCode = () => {
    setModalDirectiveOpen(true);
  };
  const handleAddUser = () => {
    addUserForm.resetFields();
    setAddUserOpen(true);
  };

  const submitAddUser = async () => {
    try {
      const values = await addUserForm.validateFields();
      setAddUserLoading(true);
      await request('/admin/admin/save', {
        method: 'POST',
        data: {
          val: values.val, // 可为空，编辑时携带
          realName: values.realName,
          img: values.img,
          phone: values.phone,
          email: values.email,
          password: values.password,
          userName: values.userName, // 昵称
        },
      });
      message.success('用户保存成功');
      setAddUserOpen(false);
      setAddUserLoading(false);
      // 这里按需刷新用户列表或执行其他回调
      // refreshUserList?.();
    } catch (err) {
      setAddUserLoading(false);
      if ((err as any)?.errorFields) return; // 表单校验错误
      message.error('保存失败，请重试');
    }
  };

  // 统一字段修改弹窗状态
  const [changeOpen, setChangeOpen] = useState(false);
  const [changeField, setChangeField] = useState<
    'password' | 'email' | 'phone'
  >('password');
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeForm] = Form.useForm();

  const openChangeModal = (field: 'password' | 'email' | 'phone') => {
    setChangeField(field);
    setChangeOpen(true);
    changeForm.resetFields();
  };

  const handleChangeSubmit = async () => {
    try {
      const values = await changeForm.validateFields();
      setChangeLoading(true);
      await changesUserInfo({
        val: user?.id,
        field: changeField,
        value: values.value,
      });
      message.success('修改成功');
      setChangeOpen(false);
      setChangeLoading(false);
      // 修改后刷新用户信息（尤其是邮箱/手机）
      if (id) {
        const res = await getUserInfo({ id });
        const data: ApiUser | undefined = (res && (res.data || res)) as
          | ApiUser
          | undefined;
        if (data) setUser(data);
      }
    } catch (e) {
      setChangeLoading(false);
    }
  };

  useEffect(() => {
    if (user && editOpen) {
      editForm.setFieldsValue({
        val: user.id,
        realName: user.realName,
        img: user.img || '',
        phone: user.phone || '',
        email: user.email || '',
        password: '',
      });
    }
  }, [user, editOpen, editForm]);

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      setEditLoading(true);
      await request('/admin/admin/modify', {
        method: 'POST',
        data: {
          val: values.val,
          realName: values.realName,
          img: values.img,
          phone: values.phone,
          email: values.email,
          password: values.password || undefined,
        },
      });
      message.success('资料已更新');
      setEditOpen(false);
      setEditLoading(false);
      // 刷新用户信息
      if (id) {
        const res = await getUserInfo({ id });
        const data: ApiUser | undefined = (res && (res.data || res)) as
          | ApiUser
          | undefined;
        if (data) setUser(data);
      }
    } catch (e) {
      setEditLoading(false);
    }
  };

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
              src="/admin/user-module-1.png"
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
                src="/admin/user-checkmark.png"
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
                src="/admin/user-checkmark.png"
                alt=""
                className={styles.copyIcon}
              />
            </div>
          </div>
        </div>
        <div className={styles.infoContainer}>
          <div className={styles.infoHeader}>
            <img
              src="/admin/user-module-2.png"
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
              src="/admin/user-module-3.png"
              alt=""
              className={styles.headerIcon}
            />
            <div className={styles.headerTitle}>账号管理</div>
          </div>
          <div className={styles.btnList}>
            <div
              className={styles.btnItem}
              onClick={() => openChangeModal('password')}
            >
              <img src="/admin/user-btn-1.png" alt="" className={styles.icon} />
              <div className={styles.btnText}>修改密码</div>
            </div>
            <div
              className={styles.btnItem}
              onClick={() => openChangeModal('email')}
            >
              <img src="/admin/user-btn-2.png" alt="" className={styles.icon} />
              <div className={styles.btnText}>更换邮箱</div>
            </div>
            <div
              className={styles.btnItem}
              onClick={() => openChangeModal('phone')}
            >
              <img src="/admin/user-btn-3.png" alt="" className={styles.icon} />
              <div className={styles.btnText}>更换手机</div>
            </div>
            <div
              className={styles.btnItem}
              onClick={() => {
                setEditOpen(true);
              }}
            >
              <img src="/admin/user-btn-4.png" alt="" className={styles.icon} />
              <div className={styles.btnText}>编辑资料</div>
            </div>
            <div
              className={styles.btnItem}
              onClick={() => {
                window.open(
                  'http://121.40.161.20:8080/uploads/AIOT.html',
                  '_blank',
                );
              }}
            >
              <img src="/admin/user-btn-6.png" alt="" className={styles.icon} />
              <div className={styles.btnText}>协议文档</div>
            </div>
            <div
              className={styles.btnItemSignOut}
              onClick={() => {
                try {
                  localStorage.removeItem('token');
                  localStorage.removeItem('userInfo');
                } catch {}
                window.location.href = '/login';
              }}
            >
              <img src="/admin/user-btn-5.png" alt="" className={styles.icon} />
              <div className={styles.btnText}>退出登录</div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.other}>
        <div className={styles.otherItem}>
          <CustomTitle
            title="源码列表"
            addButtonText={user?.isAdmin ? '添加源码' : ''}
            onSubmit={handleAddCode}
            showSearch={false}
          />
          <Table<DataType>
            style={{ width: '100%' }}
            key="id"
            scroll={{ y: 200 }}
            pagination={false}
            columns={columns}
            dataSource={codeList as any}
            size="small"
          />
        </div>
        <div className={styles.otherItem}>
          <CustomTitle
            title="用户列表"
            searchPlaceholder="搜索用户..."
            addButtonText="添加用户"
            onSubmit={handleAddUser}
          />
          <Table<DataType>
            style={{ width: '100%' }}
            key="id"
            scroll={{ y: 200 }}
            pagination={false}
            columns={userColumns}
            dataSource={userList as any}
            size="small"
          />
        </div>
      </div>
      {/* 修改字段弹窗：密码/邮箱/手机 共用 */}
      {changeOpen && (
        <Modal
          title={
            changeField === 'password'
              ? '修改密码'
              : changeField === 'email'
              ? '更换邮箱'
              : '更换手机'
          }
          open={changeOpen}
          confirmLoading={changeLoading}
          onOk={handleChangeSubmit}
          onCancel={() => setChangeOpen(false)}
          destroyOnClose
        >
          <Form form={changeForm} layout="vertical" autoComplete="off">
            <Form.Item
              label={
                changeField === 'password'
                  ? '新密码'
                  : changeField === 'email'
                  ? '新邮箱'
                  : '新手机号'
              }
              name="value"
              rules={[
                { required: true, message: '请输入内容' },
                ...(changeField === 'email'
                  ? [{ type: 'email' as const, message: '请输入正确的邮箱' }]
                  : []),
                ...(changeField === 'phone'
                  ? [
                      {
                        pattern: /^1\d{10}$/,
                        message: '请输入11位手机号',
                      },
                    ]
                  : []),
                ...(changeField === 'password'
                  ? [{ min: 6, message: '密码至少6位' }]
                  : []),
              ]}
            >
              {changeField === 'password' ? (
                <Input.Password placeholder="请输入新密码" />
              ) : (
                <Input
                  placeholder={`请输入${
                    changeField === 'email' ? '新邮箱' : '新手机号'
                  }`}
                />
              )}
            </Form.Item>
          </Form>
        </Modal>
      )}
      {/* 编辑资料弹窗 */}
      {editOpen && (
        <Modal
          title="编辑资料"
          open={editOpen}
          confirmLoading={editLoading}
          onOk={handleEditSubmit}
          onCancel={() => setEditOpen(false)}
          destroyOnClose
        >
          <Form
            form={editForm}
            layout="vertical"
            initialValues={{ val: user?.id }}
            autoComplete="off"
          >
            <Form.Item
              label="真实姓名"
              name="realName"
              rules={[{ required: true, message: '请输入真实姓名' }]}
            >
              <Input placeholder="请输入真实姓名" />
            </Form.Item>

            <Form.Item label="头像：" name="img" rules={[{ required: true }]}>
              <UploadImage
                name="img"
                onSuccess={(value: any) => {
                  editForm.setFieldValue('img', value);
                }}
              />
            </Form.Item>
            <Form.Item
              label="手机"
              name="phone"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1\d{10}$/, message: '请输入11位手机号' },
              ]}
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>
            <Form.Item
              label="邮箱"
              name="email"
              rules={[{ type: 'email', message: '请输入正确的邮箱' }]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>
            <Form.Item label="密码" name="password" tooltip="不修改可留空">
              <Input.Password
                placeholder="如需重置密码请填写，至少6位"
                autoComplete="new-password"
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
      {addUserOpen && (
        <Modal
          title="新增用户"
          open={addUserOpen}
          confirmLoading={addUserLoading}
          onOk={submitAddUser}
          onCancel={() => setAddUserOpen(false)}
          destroyOnClose
        >
          <Form layout="vertical" form={addUserForm} autoComplete="off">
            <Form.Item
              label="真实姓名"
              name="realName"
              rules={[{ required: true, message: '请输入真实姓名' }]}
            >
              <Input placeholder="请输入真实姓名" />
            </Form.Item>
            <Form.Item label="昵称" name="userName">
              <Input placeholder="请输入昵称" />
            </Form.Item>
            <Form.Item label="头像：" name="img" rules={[{ required: true }]}>
              <UploadImage
                name="img"
                onSuccess={(value: any) => {
                  addUserForm.setFieldValue('img', value);
                }}
              />
            </Form.Item>
            <Form.Item
              label="手机"
              name="phone"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1\d{10}$/, message: '请输入11位手机号' },
              ]}
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>
            <Form.Item
              label="邮箱"
              name="email"
              rules={[{ type: 'email', message: '请输入正确的邮箱' }]}
            >
              <Input placeholder="请输入邮箱（可选）" />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' },
              ]}
            >
              <Input.Password
                placeholder="请输入密码"
                autoComplete="new-password"
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
      {modalDirectiveOpen && (
        <AddCodeModal
          isEdit={!!editOtaId}
          detail={editOtaDetail}
          open={modalDirectiveOpen}
          styles={{}}
          onOk={async (values: any) => {
            const success = editOtaId
              ? await handleEditOta({ id: editOtaId, ...values })
              : await handleAddOta(values);
            if (success) {
              setModalDirectiveOpen(false);
              setEditOtaDetail({});
              setEditOtaId(0);
              // 新增/编辑后刷新当前页
              await fetchOtaList(page, pageSize);
            }
          }}
          onCancel={() => {
            setModalDirectiveOpen(false);
            setEditOtaDetail({});
            setEditOtaId(0);
          }}
        />
      )}
    </div>
  );
};
