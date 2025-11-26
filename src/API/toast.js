import { useContext } from "react";
import { ToastContext } from "../Context/ToastContext";

export const useToast = () => {
  const { addToast } = useContext(ToastContext);
  return {
    success: (msg) => addToast("success", msg),
    fail: (msg) => addToast("fail", msg),
  };
};
