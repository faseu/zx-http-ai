import UploadImage from '@/components/UploadImage';
import { getActivitiesTypeList } from '@/pages/activitiesType/service';
import { LikeFilled } from '@ant-design/icons';
import {
  PageContainer,
  ProForm,
  type ProFormInstance,
  ProFormRate,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Card, Flex, message, Space } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { addActivities, detailActivities, editActivities } from '../service';

/**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: Activities.AddItem) => {
  const hide = message.loading('正在添加');
  try {
    await addActivities({ ...fields });
    hide();
    message.success('添加成功');
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
  const hide = message.loading('正在更新');
  try {
    await editActivities(id, { ...fields });
    hide();
    message.success('更新成功');
    return true;
  } catch (error) {
    hide();
    return false;
  }
};

/**
 *  获取下拉选项
 */
const fetchPullOptions = async () => {
  const [
    {
      data: { list = [] },
    },
  ] = await Promise.all([
    getActivitiesTypeList({
      page_size: 1000,
      page: 1,
    }),
  ]);
  return [
    list?.map((item: { id: any; name: any }) => {
      return {
        value: item.id,
        label: item.name,
      };
    }),
  ];
};

export default () => {
  const { id } = useParams(); // 从路由获取 id 参数
  const formRef = useRef<ProFormInstance>();
  const [typeListPull, setTypeListPull] = useState([]);
  const [detail, setDetail] = useState<Activities.DetailItemDisplay | null>(
    null,
  );
  useEffect(() => {
    const loadPull = async () => {
      const [typeList = []] = await fetchPullOptions();
      setTypeListPull(typeList);
    };
    loadPull();
  }, []);
  return (
    <PageContainer title="活动表单">
      <Card>
        <ProForm
          layout="vertical"
          grid={true}
          formRef={formRef}
          submitter={{
            render: (props, doms) => (
              <Flex justify="flex-end">
                <Space>{doms[1]}</Space>
              </Flex>
            ),
          }}
          onFinish={async (values: any) => {
            console.log('提交数据：', values);
            const newValues = {
              ...values,
              images: values?.images?.map(
                (item: { url: any; description: any }) => {
                  return {
                    image_path: item.url,
                    image_description: item.description,
                  };
                },
              ),
              equipment: values?.equipment?.map(
                (item: { url: any; description: any }) => {
                  return {
                    equipment_img: item.url,
                    equipment_desc: item.description,
                  };
                },
              ),
            };
            if (id && Number(id) > 0) {
              await handleEdit(Number(id), newValues as Activities.AddItem);
            } else {
              await handleAdd(newValues as Activities.AddItem);
            }
            history.back();
          }}
          request={async () => {
            if (id && Number(id) > 0) {
              const { data } = await detailActivities(Number(id));
              const newData = {
                ...data,
                equipment: data?.equipment?.map((item) => ({
                  url: item.equipment_img,
                  description: item.equipment_desc,
                })),
                images: data?.images?.map((item) => ({
                  url: item.image_path,
                  description: item.image_description,
                })),
              };
              setDetail(newData);
              return newData;
            } else {
              return {};
            }
          }}
        >
          <ProFormText
            colProps={{ md: 12, xl: 8 }}
            width="md"
            name="name"
            label="活动名称"
            placeholder="请输入活动名称"
            rules={[{ required: true, message: '活动名称为必填项' }]}
          />
          <ProFormRate
            colProps={{ md: 12, xl: 8 }}
            width="md"
            name="star"
            label="活动难度"
            rules={[{ required: true, message: '活动难度为必填项' }]}
          />
          <ProFormRate
            colProps={{ md: 12, xl: 8 }}
            width="md"
            fieldProps={{ character: <LikeFilled /> }}
            name="recommend_index"
            label="推荐指数"
            rules={[{ required: true, message: '推荐指数为必填项' }]}
          />
          <ProFormText
            colProps={{ md: 12, xl: 8 }}
            width="md"
            name="location"
            label="活动地点"
            placeholder="请输入地点"
            rules={[{ required: true, message: '地点为必填项' }]}
          />
          <ProFormText
            colProps={{ md: 12, xl: 8 }}
            width="md"
            name="description"
            label="活动描述"
            placeholder="请输入活动描述"
            rules={[{ required: true, message: '活动描述为必填项' }]}
          />
          <ProFormSelect
            colProps={{ md: 12, xl: 8 }}
            width="md"
            name="activity_type"
            label="活动类型"
            placeholder="活动类型"
            options={typeListPull}
            rules={[{ required: true, message: '活动类型为必填项' }]}
          />
          <ProFormSelect
            colProps={{ md: 12, xl: 8 }}
            width="md"
            name="activities_json"
            label="活动标签"
            mode="tags"
            placeholder="活动标签"
            options={[]}
          />
          <UploadImage
            colProps={{ md: 12, xl: 8 }}
            label="封面图"
            name="cover_image"
            category="cover_image"
            max={1}
            onSuccess={(filesList) => {
              formRef.current?.setFieldValue(
                'cover_image',
                filesList?.[0]?.url,
              );
              message.success('封面图上传成功');
            }}
            initialValue={detail?.cover_image ? [detail?.cover_image] : []}
          />
          <UploadImage
            colProps={{ md: 12, xl: 12 }}
            label="装备图片"
            name="equipment"
            category="equipment"
            max={12}
            addDescription
            onSuccess={(filesList) => {
              formRef.current?.setFieldValue('equipment', filesList);
            }}
            initialValue={detail?.equipment ? detail?.equipment : []}
          />
          <UploadImage
            colProps={{ md: 12, xl: 12 }}
            label="活动图片"
            name="images"
            category="images"
            max={12}
            addDescription
            onSuccess={(filesList) => {
              formRef.current?.setFieldValue('images', filesList);
            }}
            initialValue={detail?.images ? detail?.images : []}
          />
        </ProForm>
      </Card>
    </PageContainer>
  );
};
