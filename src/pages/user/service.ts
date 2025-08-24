// @ts-ignore

import { request } from '@umijs/max';

/**
 * 用户详情
 */
export async function getUserInfo(params?: { [key: string]: any }) {
  return request('/admin/admin/getinfo', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
/**
 * 用户编辑1
 */
export async function changesUserInfo(params?: { [key: string]: any }) {
  return request('/admin/admin/change', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
/**
 * 用户编辑2
 */
export async function modifyUserInfo(params?: { [key: string]: any }) {
  return request('/admin/admin/modify', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 用户列表
 */
export async function getUserList(params?: { [key: string]: any }) {
  return request('/admin/admin/index', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
