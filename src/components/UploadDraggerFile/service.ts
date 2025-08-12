// @ts-ignore
import { request } from '@umijs/max';

/**
 * 上传
 */
export async function uploadImage(formData: FormData) {
  return request('/api/upload-image', {
    method: 'POST',
    data: formData, // 这也不行！
    // 正确方式如下：
    requestType: 'form', // 让 umi-request 处理 multipart/form-data
  });
}
