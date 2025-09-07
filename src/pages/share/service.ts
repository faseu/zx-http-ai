// @ts-ignore
import { request } from '@umijs/max';

/**
 * 新增共创星球
 */
export async function addDialogue(params?: { [key: string]: any }) {
  return request('/admin/project/save', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 共创星球列表
 */
export async function getDialogueList(params?: { [key: string]: any }) {
  return request('/admin/project/index', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 共创星球详情
 */
export async function getDialogueDetail(params?: { [key: string]: any }) {
  return request('/admin/project/getInfo', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 审核共创星球项目
 */
export async function changeProjectStatus(params?: { [key: string]: any }) {
  return request('/admin/project/change', {
    method: 'POST',
    data: {
      ...params,
      field: 'isEnabled',
    },
  });
}
