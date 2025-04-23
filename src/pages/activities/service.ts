// @ts-ignore
import { request } from '@umijs/max';

/**
 * 新增
 */
export async function addActivities(params?: { [key: string]: any }) {
  return request('/api/activity/activities', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 详情
 */
export async function detailActivities(
  id: number,
): Promise<{ data: Activities.DetailItem }> {
  return request(`/api/activity/activities/${id}`, {
    method: 'get',
  });
}

/**
 * 编辑
 */
export async function editActivities(
  id: number,
  params?: { [p: string]: any },
) {
  return request(`/api/activity/activities/${id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

/**
 * 列表
 */
export async function getActivitiesList(params?: { [key: string]: any }) {
  return request('/api/activity/activities', {
    method: 'get',
    params: {
      ...params,
    },
  });
}

/**
 * 删除
 */
export async function delActivities(id: number) {
  return request(`/api/activity/activities/${id}`, {
    method: 'delete',
  });
}
