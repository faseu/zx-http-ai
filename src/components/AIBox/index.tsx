import { UserOutlined } from '@ant-design/icons';
import { Bubble, Sender, Suggestion } from '@ant-design/x';
import { Flex } from 'antd';
import React from 'react';
import styles from './index.less';

export default () => {
  const [value, setValue] = React.useState('');

  return (
    <Flex vertical className={styles.aiBox} gap={6}>
      <Bubble.List
        style={{ flex: 1 }}
        items={[
          {
            key: '1',
            placement: 'end',
            content: '写一个arduino控制LED灯的程序',
            avatar: { icon: <UserOutlined /> },
          },
          {
            key: '2',
            content:
              '好的，用户让我写一个 Arduino 控制 LED 灯的程序。首先，我需要确定用户的具体需求是什么。控制 LED 灯有很多种方式，比如简单的闪烁、调光或者根据传感器输入变化等。用户没有特别说明，所以应该从最基础的开始，比如让LED 灯闪烁。',
            avatar: { icon: <UserOutlined /> },
          },
        ]}
      />
      <Suggestion items={[{ label: 'Write a report', value: 'report' }]}>
        {({ onTrigger, onKeyDown }) => {
          return (
            <Sender
              value={value}
              onChange={(nextVal) => {
                if (nextVal === '/') {
                  onTrigger();
                } else if (!nextVal) {
                  onTrigger(false);
                }
                setValue(nextVal);
              }}
              autoSize={{ minRows: 6, maxRows: 6 }}
              onKeyDown={onKeyDown}
              placeholder='Type "/" to trigger suggestion'
            />
          );
        }}
      </Suggestion>
    </Flex>
  );
};
