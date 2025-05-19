import styles from '@/pages/login/index.less';
import { accountLogin } from '@/services/login';
import { setToken } from '@/utils/token';
import { LockOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons';
import {
  LoginFormPage,
  ProConfigProvider,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { Tabs, message, theme } from 'antd';
import { useState } from 'react';

import { flushSync } from 'react-dom';

type LoginType = 'phone' | 'account';

const a = {
  id: 1,
  userName: 'admin',
  password: '1d9e7e492ee5afc2871adb689a0da830',
  email: '123@163.com',
  realName: '郑飞',
  phone: '13018909115',
  img: 'https://well.iothzbf.com/uploads/images/20220830/3355afc1c1db8bc4150530c62bb761b9.png',
  regTime: 1498276451,
  regIp: '127.0.0.1',
  loginTime: 1747565836,
  loginIp: '39.149.12.184',
  updateTime: 1686822815,
  isEnabled: 1,
  groupId: 2,
  deptId: 2,
  deptGroupId: 1,
  isAdmin: null,
  title: '客户管理员',
};

const Page = () => {
  const [loginType, setLoginType] = useState<LoginType>('account');
  const { initialState, setInitialState } = useModel('@@initialState');

  const { token } = theme.useToken();
  const handleSubmit = async (value: { [key: string]: any } | undefined) => {
    let { userToken, userInfo } = await accountLogin({ ...value });
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => {
          const obj = {
            ...s,
            currentUser: {
              avatar: '',
              name: `${userInfo.realName}`,
            },
            ...userInfo,
          };
          localStorage.setItem('userInfo', JSON.stringify(obj));
          return obj;
        });
      });
    }
    if (userToken) {
      setToken(userToken);
      history.replace('/');
    } else {
      message.error('登录失败！');
    }
  };
  return (
    <div
      style={{
        backgroundColor: 'black',
        height: '100vh',
      }}
    >
      <div className={styles.rightBox}>
        <img className={styles.rightBox_img} src="/logo.png" alt="" />
        <div className={styles.titleBox}>
          <div className={styles.rightBox_title1}>即插智联管理后台</div>
          <div className={styles.rightBox_title2}>自然语言编程智能体</div>
        </div>
      </div>
      <LoginFormPage
        backgroundImageUrl="/login-bg.jpg"
        title="欢 迎 登 陆"
        containerStyle={{
          height: 720,
          backgroundColor: 'rgba(17, 17, 17,0.65)',
          backdropFilter: 'blur(4px)',
          backgroundImage: 'none',
        }}
        subTitle=" "
        style={{
          paddingRight: '75px',
        }}
        initialValues={{
          phone: '15713977886',
          password: 'zxc123',
        }}
        onFinish={async (values) => {
          await handleSubmit(values as API.LoginParams);
        }}
      >
        <Tabs
          centered
          activeKey={loginType}
          onChange={(activeKey) => setLoginType(activeKey as LoginType)}
        >
          <Tabs.TabPane key={'account'} tab={'密码登录'} />
          <Tabs.TabPane key={'phone'} tab={'短信登录'} />
        </Tabs>
        {loginType === 'account' && (
          <>
            <ProFormText
              name="phone"
              fieldProps={{
                size: 'large',
                prefix: (
                  <UserOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={'prefixIcon'}
                  />
                ),
              }}
              placeholder={'请输入用户名'}
              rules={[
                {
                  required: true,
                  message: '请输入用户名!',
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: (
                  <LockOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={'prefixIcon'}
                  />
                ),
              }}
              placeholder={'请输入密码'}
              rules={[
                {
                  required: true,
                  message: '请输入密码！',
                },
              ]}
            />
          </>
        )}
        {loginType === 'phone' && (
          <>
            <ProFormText
              fieldProps={{
                size: 'large',
                prefix: (
                  <MobileOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={'prefixIcon'}
                  />
                ),
              }}
              name="mobile"
              placeholder={'手机号'}
              rules={[
                {
                  required: true,
                  message: '请输入手机号！',
                },
                {
                  pattern: /^1\d{10}$/,
                  message: '手机号格式错误！',
                },
              ]}
            />
            <ProFormCaptcha
              fieldProps={{
                size: 'large',
                prefix: (
                  <LockOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={'prefixIcon'}
                  />
                ),
              }}
              captchaProps={{
                size: 'large',
              }}
              placeholder={'请输入验证码'}
              captchaTextRender={(timing, count) => {
                if (timing) {
                  return `${count} ${'获取验证码'}`;
                }
                return '获取验证码';
              }}
              name="captcha"
              rules={[
                {
                  required: true,
                  message: '请输入验证码！',
                },
              ]}
              onGetCaptcha={async () => {
                message.success('获取验证码成功！验证码为：1234');
              }}
            />
          </>
        )}
        <div
          style={{
            marginBlockEnd: 24,
          }}
        >
          <ProFormCheckbox noStyle name="autoLogin">
            自动登录
          </ProFormCheckbox>
          <a
            style={{
              float: 'right',
            }}
          >
            忘记密码
          </a>
        </div>
      </LoginFormPage>
    </div>
  );
};

export default () => {
  return (
    <ProConfigProvider dark>
      <Page />
    </ProConfigProvider>
  );
};
