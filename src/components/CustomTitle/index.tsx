// src/components/ThemeSwitchButton/index.tsx
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Button, Input, Popconfirm } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import styles from './index.less';

interface CustomTitleProps {
  title: string;
  searchPlaceholder?: string; //
  addButtonText?: string; //
  showEmpty?: boolean; //
  onSubmit?: (inputValue: string) => void;
}

const CustomTitle: React.FC<CustomTitleProps> = ({
  title,
  searchPlaceholder,
  addButtonText,
  showEmpty,
  onSubmit, // 👈
}) => {
  const { initialState } = useModel('@@initialState');
  const isDark = initialState?.settings?.navTheme === 'realDark';
  const [inputValue, setInputValue] = useState(''); // 👈 用来保存输入框内容

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleAddClick = () => {
    if (onSubmit) {
      onSubmit(inputValue); // 点击时把输入框的值传给父组件
    }
  };
  return (
    <div
      className={classNames({
        [styles.commonCard]: true,
        [styles.darkCard]: isDark,
        [styles.lightCard]: !isDark,
      })}
    >
      <div className={styles.dot}></div>
      <div className={styles.title}>{title}</div>
      {addButtonText && (
        <>
          <Input
            style={{ width: '200px', marginRight: '8px' }}
            placeholder={searchPlaceholder} // ✅ 用 props 里的
            suffix={<SearchOutlined />}
            value={inputValue} // 👈 受控组件
            onChange={handleInputChange} // 👈 保存输入
          />
          <Button color="primary" variant="solid" onClick={handleAddClick}>
            {addButtonText} {/* ✅ 用 props 里的 */}
          </Button>
        </>
      )}
      {showEmpty && (
        <>
          <Popconfirm
            title="清空指令"
            description="清空后无法回复，确定清空指令?"
            okText="确定"
            cancelText="取消"
          >
            <div className={styles.empty}>
              <DeleteOutlined />
              <span style={{ marginLeft: '4px' }}>清空</span>
            </div>
          </Popconfirm>
        </>
      )}
    </div>
  );
};

export default CustomTitle;
