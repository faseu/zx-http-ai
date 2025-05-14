// @ts-ignore
import { request } from '@umijs/max';

/**
 * 新增活动类型
 */
export async function addActivitiesType(params?: { [key: string]: any }) {
  return request('/api/category/categories', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 编辑活动类型
 */
export async function editActivitiesType(
  id: number,
  params?: { [p: string]: any },
) {
  return request(`/api/category/categories/${id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

/**
 * 列表
 */
export async function getMachineList(params?: { [key: string]: any }) {
  return request('/api/admin/machine/index', {
    method: 'POST',
    params: {
      ...params,
    },
  });
}

/**
 * 删除活动类型
 */
export async function delActivitiesType(params?: { [key: string]: any }) {
  return request('/api/category/categories', {
    method: 'delete',
    data: {
      ...params,
    },
  });
}
