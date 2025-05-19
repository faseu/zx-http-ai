// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 发送验证码 POST /code/note */
export async function getFakeCaptcha(options?: { [key: string]: any }) {
  return request('/v4.4/code/note', {
    method: 'POST',
    data: options,
  });
}

/** 登录 POST /code/note */
export async function accountLogin(options?: { [key: string]: any }) {
  return request('/admin/login/index', {
    method: 'POST',
    data: options,
  });
}
/** 登录 POST /code/note */
export async function secondAccountLogin(options?: { [key: string]: any }) {
  return request('/second_login', {
    method: 'POST',
    data: options,
  });
}

/** 登录 POST /code/note */
export async function getUserInfo() {
  return request('/v4.4/account/userInfo', {
    method: 'get',
  });
}

/** 登录 POST /code/note */
export async function getSecondUserInfo() {
  return request('/second/second-data', {
    method: 'get',
  });
}
