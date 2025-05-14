// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 发送验证码 POST /code/note */
export async function getFakeCaptcha(options?: { [key: string]: any }) {
  return request('/api/v4.4/code/note', {
    method: 'POST',
    data: options,
  });
}

/** 登录 POST /code/note */
export async function accountLogin(options?: { [key: string]: any }) {
  return request('/api/admin/login/index', {
    method: 'POST',
    data: options,
  });
}
/** 登录 POST /code/note */
export async function secondAccountLogin(options?: { [key: string]: any }) {
  return request('/api/second_login', {
    method: 'POST',
    data: options,
  });
}

/** 登录 POST /code/note */
export async function getUserInfo() {
  return request('/api/v4.4/account/userInfo', {
    method: 'get',
  });
}

/** 登录 POST /code/note */
export async function getSecondUserInfo() {
  return request('/api/second/second-data', {
    method: 'get',
  });
}
