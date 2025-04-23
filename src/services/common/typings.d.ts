// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {};

  interface TableParams {
    pagination?: TablePaginationConfig;
    sortField?: SorterResult<any>['field'];
    sortOrder?: SorterResult<any>['order'];
    filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
  }

  interface Record {
    [key: string]: any; // 允许任意字段，值的类型是 any
  }

  interface Table {
    records: Record[]; // 动态设备记录列表
    totalCount: number; // 总记录数
  }
}
