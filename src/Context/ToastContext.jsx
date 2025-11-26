import { createContext, useState } from "react";

export const ToastContext = createContext();
export const ToastProvider = ({ children }) => {
  const [active, setActive] = useState(false);
  return (
    <ToastContext.Provider value={{ active, setActive }}>
      {children}
    </ToastContext.Provider>
  );
};
