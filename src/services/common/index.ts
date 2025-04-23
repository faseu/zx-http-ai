// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/**
 * 获取角色列表下拉数据
 */
export async function getRoleListPull(params?: { [key: string]: any }) {
  return await request('/api/v4.4/global/pullList', {
    method: 'get',
    params: {
      ...params,
    },
  });
}
/**
 * 获取省市区列表下拉数据
 */
export async function getDistrictListPull(params?: { [key: string]: any }) {
  return await request('/api/v4.4/district/list', {
    method: 'get',
    params: {
      ...params,
    },
  });
}
/**
 * 获取项目列表下拉数据
 */
export async function getPropertyListPull(params?: { [key: string]: any }) {
  return await request('/api/v4.4/global/propertyList', {
    method: 'get',
    params: {
      ...params,
    },
  });
}
/**
 * 获取领导下拉数据
 */
export async function getLeaderListPull(params?: { [key: string]: any }) {
  return await request('/api/v4.4/global/leaderList', {
    method: 'get',
    params: {
      ...params,
    },
  });
}
/**
 * 获取处理人下拉数据
 */
export async function getHandlersListPull(params?: { [key: string]: any }) {
  return await request('/api/v4.4/global/handlersList', {
    method: 'get',
    params: {
      ...params,
    },
  });
}
/**
 * 获取设备下拉数据
 */
export async function getMachineListPull(params?: { [key: string]: any }) {
  return await request('/api/v4.4/global/machineList', {
    method: 'get',
    params: {
      ...params,
    },
  });
}
/**
 * 获取工单规则下拉数据
 */
export async function getTicketRulesListPull(params?: { [key: string]: any }) {
  return await request('/api/v4.4/global/ticketRulesList', {
    method: 'get',
    params: {
      ...params,
    },
  });
}
/**
 * 获取卫生间（场景）下拉数据
 */
export async function getToiletListPull(params?: { [key: string]: any }) {
  return await request('/api/v4.4/global/scenarioList', {
    method: 'get',
    params: {
      ...params,
    },
  });
}
