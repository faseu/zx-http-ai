// @ts-ignore
import { request } from '@umijs/max';

/**
 * 新增用户
 */
export async function addSecondUser(params?: { [key: string]: any }) {
  return request('/api/second_admin', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 编辑用户
 */
export async function editSecondUser(
  id: number,
  params?: { [p: string]: any },
) {
  return request(`/api/second_admin/${id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

/**
 * 用户列表
 */
export async function getSecondUserList(params?: { [key: string]: any }) {
  return request('/api/second_admin', {
    method: 'get',
    params: {
      ...params,
    },
  });
}

/**
 * 删除用户
 */
export async function delSecondUser(params?: { [key: string]: any }) {
  return request('/api/second_admin', {
    method: 'delete',
    params: {
      ...params,
    },
  });
}
