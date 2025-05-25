import { UploadFile } from 'antd/es/upload/interface';

// 将省市数据进行格式化（不处理 district）
export const cityCalc = (data: {
  province: Common.Location[];
  city: Common.Location[];
}) => {
  const { province, city } = data;

  // 为省份添加空 children
  const provinceList: (Common.Location & {
    children: Common.Location[];
  })[] = province.map((item) => ({ ...item, children: [] }));

  // 将城市归类到对应省份
  for (let i = 0; i < city.length; i++) {
    const cityItem = city[i];
    const provinceIdPrefix = cityItem.id.toString().slice(0, 2);

    for (let j = 0; j < provinceList.length; j++) {
      const provinceItem = provinceList[j];
      if (provinceItem.id.toString().startsWith(provinceIdPrefix)) {
        provinceItem.children.push(cityItem);
        break; // 找到归属省份后退出内层循环
      }
    }
  }
  return provinceList;
};

export const getUploadFileUrls = (
  fileList: UploadFile[],
): string[] | number[] => {
  if (!fileList) {
    return [];
  }
  return fileList.map(
    (file: UploadFile): string =>
      file.url || (file.response && file.response.data),
  );
};

export const normalizeUploadFileList = (
  value: string | string[] | null | undefined,
): UploadFile[] => {
  if (!value || value.length === 0) {
    return [];
  }
  const urls = typeof value === 'string' ? [value] : value;
  return urls.map((url, index) => ({
    uid: `pic-upload-${-index}`,
    size: 500,
    name: 'image.png',
    type: 'image/png',
    status: 'done',
    url,
  }));
};
export const calculateTimeDifference = (
  time1: string,
  time2?: string,
): string => {
  // 转换为 Date 对象
  const date1: Date = new Date(time1.replace(' ', 'T'));
  const date2: Date = time2 ? new Date(time2.replace(' ', 'T')) : new Date();

  // 计算时间差（单位为毫秒）
  const timeDifference: number = date2.getTime() - date1.getTime();

  // 将时间差转换为天、小时、分钟、秒
  const days: number = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours: number = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes: number = Math.floor(
    (timeDifference % (1000 * 60 * 60)) / (1000 * 60),
  );
  const seconds: number = Math.floor((timeDifference % (1000 * 60)) / 1000);
  // 动态拼接时间差
  const timeParts: string[] = [];

  if (days > 0) timeParts.push(`${days}天`);
  if (hours > 0) timeParts.push(`${hours}小时`);
  if (minutes > 0) timeParts.push(`${minutes}分钟`);
  if (seconds > 0 || timeParts.length === 0) timeParts.push(`${seconds}秒`);

  // 返回拼接后的时间差字符串
  return timeParts.join('');
};

interface Building {
  buildingId: number;
  name: string;
  buildingName: string;
}

export const groupByBuilding = (buildings: Building[]): string => {
  if (!buildings || buildings.length < 0) return '';
  // 按照 buildingId 分组，并将同一个 buildingId 的 name 连接为字符串
  const groupedBuildings = buildings.reduce(
    (
      acc: { [key: number]: { buildingName: string; names: string[] } },
      building,
    ) => {
      if (!acc[building.buildingId]) {
        acc[building.buildingId] = {
          buildingName: building.buildingName,
          names: [],
        };
      }
      acc[building.buildingId].names.push(building.name);
      return acc;
    },
    {},
  );

  // 转换成所需格式的字符串
  return Object.values(groupedBuildings)
    .map(({ buildingName, names }) => `${buildingName}（${names.join('，')}）`)
    .join('，');
};
