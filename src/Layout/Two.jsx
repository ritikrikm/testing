import { useState } from "react";
import "./popupcontainer.css";
/*
Requirements: Creating a toast container to show successfull message only
Assigned to ClientServerWala
*/
export const Two = () => {
  const [openModal, setOpenModal] = useState(false);

  const modal = () => handleToast();
  const handleToast = () => {
    return (
      <div className="toast">
        <h3>SuccesFull Messaged Poped up</h3>
      </div>
    );
  };
  return (
    <div className="popup-container">
      <button onClick={() => modal && setOpenModal((prev) => !prev)}>
        Toast-Success
      </button>
      {openModal && modal()}
    </div>
  );
};
