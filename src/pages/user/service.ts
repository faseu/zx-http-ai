// @ts-ignore

import { request } from '@umijs/max';

/**
 * 新增设备
 */
export async function getUserInfo(params?: { [key: string]: any }) {
  return request('/admin/admin/getinfo', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
