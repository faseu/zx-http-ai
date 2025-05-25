import { Button, Modal } from 'antd';
import { useEffect, useState } from 'react';

interface EditCodeModalProps {
  open: boolean;
  initialCode: string;
  title?: string;
  onOk: (code: string) => void;
  onCancel: () => void;
}

const EditCodeModal: React.FC<EditCodeModalProps> = ({
  open,
  initialCode,
  title = '编辑代码',
  onOk,
  onCancel,
}) => {
  const [code, setCode] = useState(initialCode);

  // 当模态框打开时，重置代码内容
  useEffect(() => {
    if (open) {
      setCode(initialCode);
    }
  }, [open, initialCode]);

  const handleOk = () => {
    onOk(code);
  };

  const handleCancel = () => {
    setCode(initialCode); // 重置为初始代码
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      style={{ top: 50 }}
      destroyOnClose
      okText="保存"
      cancelText="取消"
      maskClosable={false}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="ok" type="primary" onClick={handleOk}>
          保存
        </Button>,
      ]}
    >
      <div style={{ marginTop: 16 }}>
        <textarea
          spellCheck="false"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{
            width: '100%',
            height: '400px',
            fontFamily:
              'Fira Code, Monaco, Menlo, Consolas, "Ubuntu Mono", monospace',
            fontSize: '14px',
            border: '1px solid #282c34',
            borderRadius: '6px',
            padding: '12px',
            resize: 'vertical',
            outline: 'none',
            backgroundColor: '#282c34',
            lineHeight: '1.5',
            background: 'transparent',
          }}
          placeholder="请输入代码..."
        />
      </div>
    </Modal>
  );
};

export default EditCodeModal;
