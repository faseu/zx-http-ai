// @ts-ignore
import { request } from '@umijs/max';

/**
 * 新增
 */
export async function addActivitiesRoad(params?: { [key: string]: any }) {
  return request('/api/hiking', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 详情
 */
export async function detailActivitiesRoad(
  id: number,
): Promise<{ data: ActivitiesRoad.DetailItem }> {
  return request(`/api/hiking_data/${id}`, {
    method: 'get',
  });
}

/**
 * 编辑
 */
export async function editActivitiesRoad(
  id: number,
  params?: { [p: string]: any },
) {
  return request(`/api/hiking/${id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

/**
 * 列表
 */
export async function getActivitiesRoadList(params?: { [key: string]: any }) {
  return request('/api/hiking_list', {
    method: 'get',
    params: {
      ...params,
    },
  });
}

/**
 * 删除
 */
export async function delActivitiesRoad(id: number) {
  return request(`/api/hiking/${id}`, {
    method: 'delete',
  });
}

/**
 * 审核
 */
export async function auditActivitiesRoad(
  id: number,
  params?: { [p: string]: any },
) {
  return request(`/api/hiking/${id}`, {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
