// src/components/CustomMenu/index.tsx
import type { HeaderProps } from '@ant-design/pro-layout';
import { Flex } from 'antd';
import React from 'react';
import styles from './index.less';

const CustomMenu: React.FC<HeaderProps> = (props) => {
  // 你可以根据 props.menuData 自定义渲染菜单结构
  console.log(props);
  return (
    <aside className={styles.aside}>
      <Flex vertical align="center">
        {props.menuData
          ?.filter((item) => item.path !== '/')
          ?.map((item: any) => (
            <div className={styles.menuBox} key={item.key}>
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
