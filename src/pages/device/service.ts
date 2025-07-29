// @ts-ignore
import { request } from '@umijs/max';

/**
 * 新增设备
 */
export async function addDevice(params?: { [key: string]: any }) {
  return request('/admin/device/save', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 编辑设备
 */
export async function editDevice(params?: { [key: string]: any }) {
  return request('/admin/device/save', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 设备详情
 */
export async function detailDevice(params?: { [key: string]: any }) {
  return request('/admin/device/getInfo', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 设备详情
 */
export async function detailDeviceData(params?: { [key: string]: any }) {
  return request('/admin/device_data/index', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 设备详情
 */
export async function detailDeviceLastData(params?: { [key: string]: any }) {
  return request('/admin/device/getLastData', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 设备详情
 */
export async function detailDeviceChartData(params?: { [key: string]: any }) {
  return request('/admin/device/getParams', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 删除设备
 */
export async function delDevice(params?: { [key: string]: any }) {
  return request('/admin/device/del', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 设备列表
 */
export async function getDeviceList(params?: { [key: string]: any }) {
  return request('/admin/device/index', {
    method: 'POST',
    params: {
      ...params,
    },
  });
}