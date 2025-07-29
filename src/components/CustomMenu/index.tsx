import type { HeaderProps } from '@ant-design/pro-layout';
import { history } from '@umijs/max'; // 添加这行导入
import { Flex } from 'antd';
import React from 'react';
import styles from './index.less';

const CustomMenu: React.FC<HeaderProps> = (props) => {
  const handleMenuClick = (path: string) => {
    history.push(path);
  };

  return (
    <aside className={styles.aside}>
      <Flex vertical align="center">
        {props.menuData
          ?.filter((item) => item.path !== '/')
          ?.map((item: any) => (
            <div
              className={styles.menuBox}
              key={item.key}
              onClick={() => handleMenuClick(item.path)}
            >
              <img
                src={`/admin/${item.icon}`}
                style={{ width: '28px', height: '28px', marginBottom: '8px' }}
                alt=""
              />
              <div>{item.name}</div>
            </div>
          ))}
      </Flex>
    </aside>
  );
};

export default CustomMenu;
