import { CloseCircleOutlined } from '@ant-design/icons';
import { Button, Rate } from 'antd';
import { useState } from 'react';
import styles from './index.less';

interface ScoreModalProps {
  open: boolean;
  submit: (score: number) => void;
  close: () => void;
}

const ScoreModal: React.FC<ScoreModalProps> = ({ open, submit, close }) => {
  const [rateValue, setRateValue] = useState<number>(0);

  const handleSubmit = () => {
    // 将 Rate 的分数（0-5分）转换为满分100分的分数
    const score = (rateValue / 5) * 100;
    submit(score);
  };

  return (
    <div className={styles.scoreBox}>
      <div className={styles.scoreContent}>
        <img className={styles.scoreBg} src="/admin/score.png" alt="" />
        <div className={styles.scoreText}>
          <div className={styles.text1}>升级成功</div>
          <div className={styles.text2}>请对本次AI代码生成功能进行评分</div>
          <Rate
            allowHalf
            value={rateValue}
            onChange={setRateValue}
            style={{ fontSize: 28, marginTop: 6 }}
          />
          <Button
            type="primary"
            size="large"
            block
            onClick={handleSubmit}
            disabled={rateValue === 0}
          >
            确认
          </Button>
        </div>
        <div className={styles.close}>
          <CloseCircleOutlined
            style={{ fontSize: '30px' }}
            onClick={() => {
              close();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ScoreModal;
