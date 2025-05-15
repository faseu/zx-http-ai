// src/components/CustomMenu/index.tsx
import { RedditCircleFilled } from '@ant-design/icons';
import type { HeaderProps } from '@ant-design/pro-layout';
import { Flex } from 'antd';
import React from 'react';
import styles from './index.less';

const CustomMenu: React.FC<HeaderProps> = (props) => {
  // 你可以根据 props.menuData 自定义渲染菜单结构
  return (
    <aside className={styles.aside}>
      <Flex vertical align="center">
        {props.menuData
          ?.filter((item) => item.path !== '/')
          ?.map((item: any) => (
            <div className={styles.menuBox} key={item.key}>
              <RedditCircleFilled style={{ fontSize: '24px' }} />
              <div>{item.name}</div>
            </div>
          ))}
      </Flex>
    </aside>
  );
};

export default CustomMenu;
