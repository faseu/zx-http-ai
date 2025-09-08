// @ts-ignore
import { request } from '@umijs/max';

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
 * 协议到智能空间
 */
export async function setOtaGroup(params?: { [key: string]: any }) {
  return request('/admin/ota/setBatGroup', {
    method: 'POST',
    params: {
      ...params,
    },
  });
}
