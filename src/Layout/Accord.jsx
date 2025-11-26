/*
<Accords>
    <AccordList index={0}>
        <Accord>What is this</Accord>
        <AccordPanel>Ans is this </AccordPanel?
    </AccordList>
</Accords>
*/

import { AccordProvider, useAccord } from "../Context/AccordContext";

export const Accords = ({ children, defaultValue }) => {
  return (
    <AccordProvider defaultValue={defaultValue}>{children}</AccordProvider>
  );
};
export const AccordList = ({ children }) => {
  return <div>{children}</div>;
};
export const Accord = ({ index, children }) => {
  const { activeAccord, setActiveAccord } = useAccord();

  return (
    <button
      onClick={() => setActiveAccord(activeAccord === index ? null : index)}
    >
      {children}
    </button>
  );
};
export const AccordPanel = ({ index, children }) => {
  const { activeAccord } = useAccord(index);
  console.log(index);
  return index === activeAccord ? <div>{children}</div> : null;
};
