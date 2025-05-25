// src/components/ThemeSwitchButton/index.tsx
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Button, Checkbox, Input, Popconfirm } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import styles from './index.less';

interface CustomTitleProps {
  title: string;
  searchPlaceholder?: string;
  addButtonText?: string;
  showEmpty?: boolean;
  showCheckbox?: boolean;
  onSubmit?: (inputValue: string) => void;
  // 新增：全选相关props
  isAllSelected?: boolean;
  onSelectAll?: (checked: boolean) => void;
  selectedCount?: number;
  totalCount?: number;
}

const CustomTitle: React.FC<CustomTitleProps> = ({
  title,
  searchPlaceholder,
  addButtonText,
  showEmpty,
  showCheckbox,
  onSubmit,
  // 新增：全选相关props
  isAllSelected = false,
  onSelectAll,
  selectedCount = 0,
  totalCount = 0,
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

  // 新增：全选checkbox变化处理
  const handleSelectAllChange = (e: any) => {
    if (onSelectAll) {
      onSelectAll(e.target.checked);
    }
  };

  // 新增：计算全选checkbox的状态
  const getCheckboxProps = () => {
    if (totalCount === 0) {
      return {
        checked: false,
        indeterminate: false,
        disabled: true,
      };
    }

    if (selectedCount === totalCount) {
      return {
        checked: true,
        indeterminate: false,
        disabled: false,
      };
    }

    if (selectedCount > 0 && selectedCount < totalCount) {
      return {
        checked: false,
        indeterminate: true,
        disabled: false,
      };
    }

    return {
      checked: false,
      indeterminate: false,
      disabled: false,
    };
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
          {showCheckbox && (
            <div
              style={{
                marginRight: '8px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Checkbox
                {...getCheckboxProps()}
                onChange={handleSelectAllChange}
              >
                全选
              </Checkbox>
              {/* 显示选中数量 */}
              {totalCount > 0 && (
                <span
                  style={{
                    marginLeft: '8px',
                    fontSize: '12px',
                    color: isDark ? '#888' : '#666',
                  }}
                >
                  ({selectedCount}/{totalCount})
                </span>
              )}
            </div>
          )}
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
