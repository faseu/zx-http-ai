import styles from './index.less';

interface ScoreModalProps {
  open: boolean;
}

const ScoreModal: React.FC<ScoreModalProps> = ({ open }) => {
  return (
    <div className={styles.scoreBox}>
      <img className={styles.scoreBg} src="/admin/score.png" alt="" />
    </div>
  );
};

export default ScoreModal;
