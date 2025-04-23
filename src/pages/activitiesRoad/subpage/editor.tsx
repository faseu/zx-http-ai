import UploadFile from '@/components/UploadFile';
import UploadImage from '@/components/UploadImage';
import {
  bagValues,
  city,
  fitList,
  headValues,
  legValues,
  lowerValues,
  recommendedTimeList,
  travelList,
  upperValues,
} from '@/utils/config';
import {
  PageContainer,
  ProForm,
  ProFormCascader,
  ProFormDependency,
  ProFormDigit,
  type ProFormInstance,
  ProFormRate,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormTimePicker,
} from '@ant-design/pro-components';
import { ProFormGroup } from '@ant-design/pro-form/lib';
import { Button, Card, Divider, Flex, message, Space } from 'antd';
import qs from 'query-string';
import { useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  addActivitiesRoad,
  auditActivitiesRoad,
  detailActivitiesRoad,
  editActivitiesRoad,
} from '../service';
/**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: Activities.AddItem) => {
  const hide = message.loading('正在添加');
  try {
    console.log(fields);
    await addActivitiesRoad({ ...fields });
    hide();
    message.success('添加成功');
    history.back();
    return true;
  } catch (error) {
    hide();
    return false;
  }
};
/**
 * 编辑节点
 * @param id
 * @param fields
 */
const handleEdit = async (id: number, fields: Activities.AddItem) => {
  const hide = message.loading('正在编辑');
  try {
    await editActivitiesRoad(id, { ...fields });
    hide();
    message.success('编辑成功');
    history.back();
    return true;
  } catch (error) {
    hide();
    return false;
  }
};

export default () => {
  const { id } = useParams(); // 从路由获取 id 参数
  const location = useLocation();
  const { readonly, audit } = qs.parse(location.search);

  const formRef = useRef<ProFormInstance>();
  const [detail, setDetail] = useState<ActivitiesRoad.DetailItemDisplay | null>(
    null,
  );
  const initialState = {
    name: '名称1',
    region: ['山西省', '长治市'],
    parking_location: '导航停车点',
    difficulty_level: 4,
    start_altitude: '12341',
    summit_altitude: '1231231',
    distance: '123123',
    elevation_gain: '123123',
    coordinates: '1232312 12312312',
    suitable_for: 1,
    travel_advice: 2,
    recommended_time: '两天一夜',
    departure_time: '2025-04-20',
    recommended_gear: {
      head: ['遮阳帽', '抓绒帽', '魔术头巾'],
      upper_body: ['羽绒', '抓绒', '冲锋衣'],
      lower_body: ['速干裤', '护具'],
      legs: ['羊毛袜', '登山鞋', '徒步鞋'],
      backpack: ['急救包', '洗漱用品', '防水袋'],
    },
    other: '大撒大撒',
    accommodation: '酒店名称1+15723122312',
    highlights: '景点亮点景点亮点景点亮点景点亮点景点亮点',
    track_distance: '1.001',
    start_image_paths: [
      'http://1.14.59.102:8000/media/start_image_paths/微信图片_20250124233944.jpg',
    ],
    scenery_image_paths: [
      'http://1.14.59.102:8000/media/scenery_image_paths/工作区.png',
      'http://1.14.59.102:8000/media/scenery_image_paths/工作区.png',
    ],
  };
  const handleSubmit = async (status: number) => {
    const e = formRef?.current?.getFieldsFormatValue?.();
    if (!e) return;

    const values = {
      ...e,
      region: e.region?.join('/'),
      recommended_gear: {
        head: e.recommended_gear?.head.join('，'),
        upper_body: e.recommended_gear?.upper_body.join('，'),
        lower_body: e.recommended_gear?.lower_body.join('，'),
        legs: e.recommended_gear?.legs.join('，'),
        backpack: e.recommended_gear?.backpack.join('，'),
      },
      recommended_time:
        e.recommended_time !== '其他'
          ? e.recommended_time
          : e.recommended_other_time,
      track_distance: Math.round(e.track_distance * 1000),
      status,
      audit_status: 0,
    };

    console.log('提交数据：', values);

    if (id && Number(id) > 0) {
      await handleEdit(Number(id), values);
    } else {
      await handleAdd(values);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await formRef?.current?.validateFields();
      await handleSubmit(0);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };
  const handleSubmitReview = async () => {
    try {
      await formRef?.current?.validateFields();
      await handleSubmit(1);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };
  const handleBack = () => {
    history.back();
  };
  const handleApproved = async () => {
    await auditActivitiesRoad(Number(id), {
      audit_status: 1,
    });
    message.success('审核已通过');
    history.back();
  };
  const handleRejection = async () => {
    await auditActivitiesRoad(Number(id), {
      audit_status: 2,
    });
    message.success('审核已拒绝');
    history.back();
  };

  return (
    <PageContainer title="路线表单">
      <Card>
        <Flex>
          <Card style={{ flex: 1 }}>
            <ProForm
              readonly={!!readonly}
              layout="vertical"
              grid={true}
              formRef={formRef}
              submitter={{
                render: () => (
                  <Flex justify="flex-end">
                    <Space>
                      {!readonly && (
                        <Space>
                          <Button onClick={handleSaveDraft}>保存草稿</Button>
                          <Button onClick={handleSubmitReview} type="primary">
                            提交审核
                          </Button>
                        </Space>
                      )}
                      {audit && (
                        <Space>
                          <Button type="primary" onClick={handleApproved}>
                            通过审核
                          </Button>
                          <Button danger onClick={handleRejection}>
                            拒绝审核
                          </Button>
                        </Space>
                      )}
                      {readonly && (
                        <Space>
                          <Button onClick={handleBack}>返回</Button>
                        </Space>
                      )}
                    </Space>
                  </Flex>
                ),
              }}
              request={async () => {
                if (id && Number(id) > 0) {
                  const { data } = await detailActivitiesRoad(Number(id));
                  const e = {
                    ...data,
                    region: data.region.split('/'),
                    recommended_gear: {
                      head: data.recommended_gear?.head.split('，'),
                      upper_body: data.recommended_gear?.upper_body.split('，'),
                      lower_body: data.recommended_gear?.lower_body.split('，'),
                      legs: data.recommended_gear?.legs.split('，'),
                      backpack: data.recommended_gear?.backpack.split('，'),
                    },
                    track_distance: (data.track_distance / 1000).toFixed(3),
                    recommended_time: recommendedTimeList.includes(
                      data?.recommended_time,
                    )
                      ? data.recommended_time
                      : '其他',
                    recommended_other_time: data.recommended_time,
                  };
                  setDetail(e);
                  return e;
                } else {
                  return {};
                }
              }}
            >
              <ProFormGroup title="基本信息" grid={true}>
                <ProFormText
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name="name"
                  label="名 称"
                  placeholder="请输入名称"
                  rules={[{ required: true, message: '名称为必填项' }]}
                />
                <ProFormCascader
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name="region"
                  label="地 区"
                  fieldProps={{
                    options: city,
                  }}
                  placeholder="请选择地区"
                  rules={[{ required: true, message: '地区为必填项' }]}
                />
                <ProFormText
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name="parking_location"
                  label="导航停车点"
                  placeholder="请输入导航停车点"
                  rules={[{ required: true, message: '导航停车点为必填项' }]}
                />
                <ProFormRate
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name="difficulty_level"
                  label="难度等级"
                  fieldProps={{
                    count: 8,
                  }}
                  rules={[{ required: true, message: '难度等级为必填项' }]}
                />
                <ProFormDigit
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name="start_altitude"
                  label="起点海拔（m）"
                  placeholder="请输入起点海拔"
                  fieldProps={{
                    addonAfter: 'm',
                  }}
                  rules={[{ required: true, message: '起点海拔为必填项' }]}
                />
                <ProFormDigit
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name="summit_altitude"
                  label="登顶海拔（m）"
                  placeholder="请输入登顶海拔"
                  fieldProps={{
                    addonAfter: 'm',
                  }}
                  rules={[{ required: true, message: '登顶海拔为必填项' }]}
                />
                <ProFormDigit
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name="distance"
                  label="徒步距离（m）"
                  placeholder="请输入徒步距离"
                  fieldProps={{
                    addonAfter: 'm',
                  }}
                  rules={[{ required: true, message: '徒步距离为必填项' }]}
                />
                <ProFormDigit
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name="elevation_gain"
                  label="海拔爬升（m）"
                  placeholder="请输入海拔爬升"
                  fieldProps={{
                    addonAfter: 'm',
                  }}
                  rules={[{ required: true, message: '海拔爬升为必填项' }]}
                />
                <ProFormDigit
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name="track_distance"
                  label="轨迹总距离（m）"
                  placeholder="请输入轨迹总距离"
                  fieldProps={{
                    addonAfter: 'km',
                    step: '0.001',
                  }}
                  rules={[{ required: true, message: '轨迹总距离为必填项' }]}
                />
                <ProFormText
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name="coordinates"
                  label="经纬度"
                  placeholder="请输入经纬度"
                  rules={[{ required: true, message: '经纬度为必填项' }]}
                />
                <ProFormSelect
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name="suitable_for"
                  label="适合人群"
                  placeholder="适合人群"
                  options={fitList}
                  rules={[{ required: true, message: '适合人群为必填项' }]}
                />
                <ProFormSelect
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name="travel_advice"
                  label="出行建议"
                  placeholder="出行建议"
                  options={travelList}
                />
                <UploadFile
                  colProps={{ md: 24, xl: 8 }}
                  label="轨迹上传"
                  name="track_data"
                  onSuccess={(filesList) => {
                    formRef.current?.setFieldValue(
                      'track_data',
                      filesList?.[0]?.url,
                    );
                  }}
                  initialValue={detail?.track_data ? [detail?.track_data] : []}
                />
              </ProFormGroup>
              <Divider />
              <ProFormGroup title="推荐装备" grid={true}>
                <ProFormSelect
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name={['recommended_gear', 'head']}
                  label="头部"
                  placeholder="头部"
                  options={headValues}
                  fieldProps={{ mode: 'multiple' }}
                  rules={[{ required: true, message: '头部为必填项' }]}
                />
                <ProFormSelect
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name={['recommended_gear', 'upper_body']}
                  label="上半身"
                  placeholder="上半身"
                  options={upperValues}
                  fieldProps={{ mode: 'multiple' }}
                  rules={[{ required: true, message: '上半身为必填项' }]}
                />
                <ProFormSelect
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name={['recommended_gear', 'lower_body']}
                  label="下半身"
                  placeholder="下半身"
                  options={lowerValues}
                  fieldProps={{ mode: 'multiple' }}
                  rules={[{ required: true, message: '下半身为必填项' }]}
                />
                <ProFormSelect
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name={['recommended_gear', 'legs']}
                  label="腿部"
                  placeholder="腿部"
                  options={legValues}
                  fieldProps={{ mode: 'multiple' }}
                  rules={[{ required: true, message: '腿部为必填项' }]}
                />
                <ProFormSelect
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name={['recommended_gear', 'backpack']}
                  label="背包"
                  placeholder="背包"
                  options={bagValues}
                  fieldProps={{ mode: 'multiple' }}
                  rules={[{ required: true, message: '背包为必填项' }]}
                />
                <ProFormText
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name="other"
                  label="其他装备"
                  placeholder="请输入其他"
                />
              </ProFormGroup>
              <Divider />
              <ProFormGroup title="行程攻略" grid={true}>
                <ProFormSelect
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name="recommended_time"
                  label="推荐时间"
                  placeholder="推荐时间"
                  options={recommendedTimeList}
                />
                <ProFormDependency name={['recommended_time']}>
                  {({ recommended_time }) => {
                    if (recommended_time === '其他') {
                      return (
                        <ProFormText
                          colProps={{ md: 12, xl: 8 }}
                          width="md"
                          name="recommended_other_time"
                          label="其他时间"
                          placeholder="请输入其他时间"
                        />
                      );
                    }
                  }}
                </ProFormDependency>
                <ProFormTimePicker
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name="departure_time"
                  label="建议出发时间"
                  placeholder="建议出发时间"
                />
              </ProFormGroup>
              <ProFormGroup grid={true}>
                <ProFormTextArea
                  colProps={{ md: 12, xl: 8 }}
                  width="md"
                  name="accommodation"
                  label="住宿推荐"
                  tooltip="多家酒店请用作为分隔，联系方式：酒店名称+联系方式"
                  placeholder="多家酒店请用作为分隔，联系方式：酒店名称+联系方式"
                />
              </ProFormGroup>
              <Divider />
              <ProFormGroup title="景点亮点" grid={true}>
                <ProFormTextArea
                  style={{ width: '100%' }}
                  colProps={{ md: 12, xl: 16 }}
                  name="highlights"
                  placeholder="请输入景点亮点"
                />
              </ProFormGroup>
              <Divider />
              <ProFormGroup title="实景照片" grid={true}>
                <UploadImage
                  readonly={!!readonly}
                  colProps={{ md: 24, xl: 24 }}
                  label="起点图片"
                  name="start_image_paths"
                  category="start_image_paths"
                  max={5}
                  onSuccess={(filesList) => {
                    console.log(filesList);
                    formRef.current?.setFieldValue(
                      'start_image_paths',
                      filesList.map((item: { url: any }) => item.url),
                    );
                    message.success('装备图片上传成功');
                  }}
                  initialValue={detail?.start_image_paths}
                />
                <UploadImage
                  readonly={!!readonly}
                  colProps={{ md: 24, xl: 24 }}
                  label="美景分享"
                  name="scenery_image_paths"
                  category="scenery_image_paths"
                  max={15}
                  onSuccess={(filesList) => {
                    formRef.current?.setFieldValue(
                      'scenery_image_paths',
                      filesList.map((item: { url: any }) => item.url),
                    );
                  }}
                  initialValue={detail?.scenery_image_paths}
                />
              </ProFormGroup>
            </ProForm>
          </Card>
        </Flex>
      </Card>
    </PageContainer>
  );
};
