import { Outlet } from "react-router-dom";
import { Drawer } from "../Components/Drawer";
import "./mainlayout.css";
import { useState } from "react";
export const MainLayout = () => {
  const [open, setOpen] = useState(false);
  const handleDrawer = () => {
    setOpen((prev) => !prev);
  };
  return (
    <div className={`container ${open ? "open" : "collapsed"}`}>
      <div className="drawer">
        <Drawer setOpen={() => handleDrawer()} />
      </div>
      <div className="container-content">
        <Outlet />
      </div>
    </div>
  );
};
