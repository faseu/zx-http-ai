import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Button, Checkbox, Input, Popconfirm } from 'antd';
import classNames from 'classnames';
import { debounce } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import styles from './index.less';

interface CustomTitleProps {
  title: string;
  searchPlaceholder?: string;
  addButtonText?: string;
  showEmpty?: boolean;
  showCheckbox?: boolean;
  onSubmit?: () => void;
  onSearch?: (inputValue: string) => void;
  onClear?: () => void; // 新增：清空回调函数
  // 全选相关props
  isAllSelected?: boolean;
  showSearch?: boolean;
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
  onClear, // 新增参数
  // 全选相关props
  isAllSelected = false,
  showSearch = true,
  onSearch,
  onSelectAll,
  selectedCount = 0,
  totalCount = 0,
}) => {
  const { initialState } = useModel('@@initialState');
  const isDark = initialState?.settings?.navTheme === 'realDark';
  const [inputValue, setInputValue] = useState('');

  // 创建防抖搜索函数
  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue: string) => {
        onSearch?.(searchValue);
      }, 500), // 500ms 防抖延迟
    [onSearch],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const handleAddClick = () => {
    if (onSubmit) {
      onSubmit();
    }
  };

  // 全选checkbox变化处理
  const handleSelectAllChange = (e: any) => {
    if (onSelectAll) {
      onSelectAll(e.target.checked);
    }
  };

  // 计算全选checkbox的状态
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
          {showSearch && (
            <Input
              style={{ width: '200px', marginRight: '8px' }}
              placeholder={searchPlaceholder}
              suffix={<SearchOutlined />}
              value={inputValue}
              onChange={handleInputChange}
            />
          )}
          <Button color="primary" variant="solid" onClick={handleAddClick}>
            {addButtonText}
          </Button>
        </>
      )}

      {showEmpty && (
        <>
          <Popconfirm
            title="清空指令"
            description="清空后无法恢复，确定清空指令?"
            okText="确定"
            cancelText="取消"
            onConfirm={onClear} // 使用传入的清空回调
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
