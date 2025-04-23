import { accountLogin } from '@/services/login';
import { setToken } from '@/utils/token';
import { LockOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { Tabs, message } from 'antd';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
// @ts-ignore
import { flushSync } from 'react-dom';
// @ts-ignore
import { getFakeCaptcha } from '@/services/ant-design-pro/login';
import styles from './index.less';

const LoginPage: React.FC = () => {
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  const handleSubmit = async (value: { [key: string]: any } | undefined) => {
    let { access_token, data } = await accountLogin({ ...value });
    if (access_token) {
      setToken(access_token);
      flushSync(() => {
        setInitialState((s) => {
          const obj = {
            ...s,
            currentUser: {
              avatar: '',
              name: `${data.username}`,
            },
          };
          localStorage.setItem('userInfo', JSON.stringify(obj));
          return obj;
        });
      });
      history.replace('/');
    } else {
      message.error('登录失败！');
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.rightBox}>
        <img className={styles.rightBox_img} src="/logo.png" alt="" />
        <div>
          <div className={styles.rightBox_title1}>即插智联管理后台</div>
          <div className={styles.rightBox_title2}>自然语言编程智能体</div>
        </div>
      </div>
      <div className={styles.loginBox}>
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          title="欢 迎 登 陆"
          initialValues={{}}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '密码登录',
              },
              {
                key: 'mobile',
                label: '短信登录',
              },
            ]}
          />

          {type === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder="用户名"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage defaultMessage="请输入用户名!" />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder="密码"
                rules={[
                  {
                    required: true,
                    message: <FormattedMessage defaultMessage="请输入密码！" />,
                  },
                ]}
              />
            </>
          )}

          {type === 'mobile' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined />,
                }}
                name="mobile"
                placeholder="手机号"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage defaultMessage="请输入手机号！" />
                    ),
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: (
                      <FormattedMessage defaultMessage="手机号格式错误！" />
                    ),
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder="请输入验证码"
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} 获取验证码`;
                  }
                  return '获取验证码';
                }}
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage defaultMessage="请输入验证码！" />
                    ),
                  },
                ]}
                onGetCaptcha={async (phone) => {
                  const result = await getFakeCaptcha({
                    phone,
                  });
                  if (!result) {
                    return;
                  }
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
        </LoginForm>
      </div>
    </div>
  );
};

export default LoginPage;
