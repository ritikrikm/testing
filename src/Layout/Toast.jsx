import { useContext } from "react";
import "./toast.css";
import { ToastContext } from "../Context/ToastContext";
export const ToastContainer = () => {
  const { toasts } = useContext(ToastContext);

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          {t.message}
        </div>
      ))}
    </div>
  );
};
