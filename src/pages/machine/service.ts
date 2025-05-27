// @ts-ignore
import { request } from '@umijs/max';

/**
 * 新增设备
 */
export async function addMachine(params?: { [key: string]: any }) {
  return request('/admin/machine/save', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 编辑设备
 */
export async function editMachine(params?: { [key: string]: any }) {
  return request('/admin/machine/save', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 设备详情
 */
export async function detailMachine(params?: { [key: string]: any }) {
  return request('/admin/machine/getInfo', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 删除设备
 */
export async function delMachine(params?: { [key: string]: any }) {
  return request('/admin/machine/del', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 设备列表
 */
export async function getMachineList(params?: { [key: string]: any }) {
  return request('/admin/machine/index', {
    method: 'POST',
    params: {
      ...params,
    },
  });
}

/**
 * 新增协议
 */
export async function addOta(params?: { [key: string]: any }) {
  return request('/admin/ota/save', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 编辑协议
 */
export async function editOta(params?: { [key: string]: any }) {
  return request('/admin/ota/save', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 协议详情
 */
export async function detailOta(params?: { [key: string]: any }) {
  return request('/admin/ota/getInfo', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 删除协议
 */
export async function delOta(params?: { [key: string]: any }) {
  return request('/admin/ota/del', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 协议列表
 */
export async function getOtaList(params?: { [key: string]: any }) {
  return request('/admin/ota/index', {
    method: 'POST',
    params: {
      ...params,
    },
  });
}

/**
 * 分类列表
 */
export async function getCateList(params?: { [key: string]: any }) {
  return request('/admin/cate/getCateList', {
    method: 'POST',
    params: {
      ...params,
    },
  });
}

/**
 * 删除活动类型 (保留原有的，可能其他地方在用)
 */
export async function delActivitiesType(params?: { [key: string]: any }) {
  return request('/category/categories', {
    method: 'delete',
    data: {
      ...params,
    },
  });
}
