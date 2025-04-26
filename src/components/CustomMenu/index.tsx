// src/components/CustomMenu/index.tsx
import type { HeaderProps } from '@ant-design/pro-layout';
import React from 'react';
import styles from './index.less';

const CustomMenu: React.FC<HeaderProps> = (props) => {
  // 你可以根据 props.menuData 自定义渲染菜单结构
  console.log(props.menuData);
  return (
    <aside className={styles.aside}>
      <h3 style={{ margin: 0 }}>自定义菜单</h3>
      <ul>
        {props.menuData?.map((item: any) => (
          <li key={item.key}>
            {item.icon}
            {item.name}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default CustomMenu;
