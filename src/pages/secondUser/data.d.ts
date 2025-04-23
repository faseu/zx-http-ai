/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！

declare namespace SecondUser {
  interface TableItem {
    id: number;
    name: string;
    logo: string;
    created_at: string;
    updated_at: string;
  }

  interface EditorItem {
    id?: number;
    name: string;
    logo: string;
  }

  interface EditItem extends AddItem {
    id: number;
  }
}
