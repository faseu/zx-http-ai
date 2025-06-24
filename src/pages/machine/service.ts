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
 * 设备详情
 */
export async function detailMachineData(params?: { [key: string]: any }) {
  return request('/admin/machine_data/index', {
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
 * 指令列表
 */
export async function getDialogueList(params?: { [key: string]: any }) {
  return request('/admin/Ai_Log/index', {
    method: 'POST',
    params: {
      ...params,
    },
  });
}

/**
 * 删除指令 - 删除单条
 */
export async function delDialogue(params?: { [key: string]: any }) {
  return request('/admin/ai_log/del', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

/**
 * 清空所有指令
 */
export async function clearAllDialogue() {
  return request('/admin/ai_log/del', {
    method: 'POST',
    data: {}, // 不传id参数表示全部清除
  });
}

/**
 * 清空所有指令
 */
export async function upgrade(params?: { [key: string]: any }) {
  return request('/admin/ota/upgrade', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
/**
 * 清空所有指令
 */
export async function sendControl(params?: { [key: string]: any }) {
  return request('/admin/machine/control', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
