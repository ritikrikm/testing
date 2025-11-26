import { Accord, AccordList, AccordPanel, Accords } from "./Accord";

/*
<Accords>
    <AccordList index={0}>
        <Accord>What is this</Accord>
        <AccordPanel>Ans is this </AccordPanel?
    </AccordList>
</Accords>
*/
export const One = () => {
  return (
    <div className="accord-container">
      <Accords>
        <AccordList>
          <Accord index={0}>What is this</Accord>
          <AccordPanel index={0}>Ans is this</AccordPanel>
        </AccordList>
      </Accords>
      <Accords>
        <AccordList>
          <AccordList>
            <Accord index={0}>What is this 1</Accord>
            <AccordPanel index={0}>Ans is this 1</AccordPanel>
          </AccordList>
        </AccordList>
      </Accords>
    </div>
  );
};
