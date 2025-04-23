/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！

declare namespace ActivitiesRoad {
  interface RecommendedGear {
    head: string;
    legs: string;
    backpack: string;
    lower_body: string;
    upper_body: string;
  }

  interface TableItem {
    id: number;
    status_display: string;
    audit_status_display: string;
    created_by: string;
    name: string;
    region: string;
    parking_location: string;
    difficulty_level: number;
    start_altitude: number;
    summit_altitude: number;
    distance: number;
    elevation_gain: number;
    track_data: string;
    track_distance: number;
    coordinates: string;
    suitable_for: number;
    travel_advice: number;
    recommended_time: string;
    departure_time: string; // ISO string
    highlights: string;
    accommodation: string;
    other: string;
    start_image_paths: string[];
    scenery_image_paths: string[];
    recommended_gear: RecommendedGear;
    status: number;
    audit_status: number;
    created_at: string; // ISO string
    updated_at: string; // ISO string
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
    status_display: string;
    audit_status_display: string;
    created_by: string;
    name: string;
    region: string;
    parking_location: string;
    difficulty_level: number;
    start_altitude: number;
    summit_altitude: number;
    distance: number;
    elevation_gain: number;
    track_data: string;
    track_distance: number;
    coordinates: string;
    suitable_for: number;
    travel_advice: number;
    recommended_time: string;
    departure_time: string; // ISO 日期时间字符串
    highlights: string;
    accommodation: string;
    other: string;
    start_image_paths: string[];
    scenery_image_paths: string[];
    recommended_gear: RecommendedGear;
    status: number;
    audit_status: number;
    created_at: string; // ISO 日期时间字符串
    updated_at: string; // ISO 日期时间字符串
  }

  interface DetailItemDisplay {
    id: number;
    status_display: string;
    audit_status_display: string;
    created_by: string;
    name: string;
    region: string[]; // ["山西省", "长治市"]
    parking_location: string;
    difficulty_level: number;
    start_altitude: number;
    summit_altitude: number;
    distance: number;
    elevation_gain: number;
    track_data: string;
    track_distance: string; // 已经 toFixed(3)，是字符串
    coordinates: string;
    suitable_for: number;
    travel_advice: number;
    recommended_time: string; // 如果匹配到了推荐值就原样保留，否则是 '其他'
    recommended_other_time: string; // 保留原始值
    departure_time: string;
    highlights: string;
    accommodation: string;
    other: string;
    start_image_paths: string[];
    scenery_image_paths: string[];
    recommended_gear: {
      head: string[];
      upper_body: string[];
      lower_body: string[];
      legs: string[];
      backpack: string[];
    };
    status: number;
    audit_status: number;
    created_at: string;
    updated_at: string;
  }
}
