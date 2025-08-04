import type { HeaderProps } from '@ant-design/pro-layout';
import { history, useLocation } from '@umijs/max'; // 添加 useLocation
import { Flex } from 'antd';
import React from 'react';
import styles from './index.less';

const CustomMenu: React.FC<HeaderProps> = (props) => {
  const { pathname } = useLocation(); // 获取当前路径

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
                src={`/admin/${
                  pathname === item.path ? item.activeIcon : item.icon
                }`}
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
