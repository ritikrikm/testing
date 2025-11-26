import { createContext, useContext, useState } from "react";

export const AccordContext = createContext({});
export const AccordProvider = ({ children, defaultValue = null }) => {
  const [activeAccord, setActiveAccord] = useState(defaultValue);
  return (
    <AccordContext.Provider value={{ activeAccord, setActiveAccord }}>
      {children}
    </AccordContext.Provider>
  );
};
export const useAccord = () => {
  const ctx = useContext(AccordContext);
  return ctx;
};
