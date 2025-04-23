/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！

declare namespace Activities {
  interface TableItem {
    id: number;
    is_followed: boolean;
    name: string;
    description: string;
    star: number;
    recommend_index: number;
    location: string;
    equipment_description: string;
    equipment_image: string;
    activity_preview: number;
    activity_type: number;
    activities_json: string[] | Record<string, string>;
    cover_image: string;
    images: {
      image_path: string;
      image_description: string;
    }[];
  }

  interface AddItem {
    name: string;
    phone: string;
    status: number;
  }

  interface EditItem extends AddItem {
    id: number;
  }

  interface Image {
    image_path: string;
    image_description: string;
  }

  interface DetailItem {
    id: number;
    is_followed: boolean;
    images: {
      image_path: string;
      image_description: string;
    }[];
    equipment: {
      equipment_img: string;
      equipment_desc: string;
    }[];
    name: string;
    description: string;
    star: number;
    activities_json: string[];
    location: string;
    activity_preview: number;
    recommend_index: number;
    cover_image: string;
    activity_type: number;
  }
  interface DetailItemDisplay {
    id: number;
    is_followed: boolean;
    images: {
      url: string;
      description: string;
    }[];
    equipment: {
      url: string;
      description: string;
    }[];
    name: string;
    description: string;
    star: number;
    activities_json: string[];
    location: string;
    activity_preview: number;
    recommend_index: number;
    cover_image: string;
    activity_type: number;
  }
}
