import { createContext, useContext, useState } from "react";

export const TabContext = createContext({});
export const TabProvider = ({ children, defaultValue }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
};
export const useTab = () => {
  const ctx = useContext(TabContext);
  if (!ctx) throw new Error("error in ctx");
  return ctx;
};
