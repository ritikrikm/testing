import { Cross } from "lucide-react";
import "./popup.css";
export const PopUp = ({ setOpen }) => {
  return (
    <div onClick={() => setOpen(false)} className="popup-content">
      <Cross onClick={() => setOpen(false)} className="cross-icon" />
      <h2>HELLO</h2>
    </div>
  );
};
