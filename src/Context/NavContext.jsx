import { createContext, useState } from "react";

export const NavContext = createContext();
export const NavProvider = ({ children }) => {
  const [activeNav, setActiveNav] = useState("one");
  return (
    <NavContext.Provider value={{ activeNav, setActiveNav }}>
      {children}
    </NavContext.Provider>
  );
};
