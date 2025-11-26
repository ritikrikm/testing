import { Menu } from "lucide-react";
import "./drawer.css";
export const Drawer = ({ setOpen }) => {
  return (
    <>
      <div className="drawer-title">
        <Menu onClick={setOpen} className="icon" />
        <span>Welcome </span>
      </div>
      <div className="drawer-content">
        <button onClick={setOpen} className="drawer-btn">
          ClickMe
        </button>
      </div>
    </>
  );
};
