import { useState } from "react";
import "./popupcontainer.css";
import { PopUp } from "../Modal/PopUp";

import { useToast } from "../API/toast";
export const Two = () => {
  const [open, setOpen] = useState(false);
  const { success, fail } = useToast();

  return (
    <div className="popup-container">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="toast-element"
      >
        PopUp
      </button>
      {open ? <PopUp setOpen={setOpen} /> : null}
      <button onClick={() => success("Applied")}>Toast-S</button>
      <button onClick={() => fail("fail")}>Toast-F</button>
    </div>
  );
};
