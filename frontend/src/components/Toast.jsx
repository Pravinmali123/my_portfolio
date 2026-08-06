import { useEffect } from 'react';
import { useToast } from '../context/ToastContext';

const Toast = () => {
  const { toast } = useToast();
  useEffect(() => {
    if (!toast.visible) return;
    const timer = window.setTimeout(() => {}, 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <div className={`toast ${toast.type} ${toast.visible ? 'show' : ''}`}>
      {toast.message}
    </div>
  );
};

export default Toast;
