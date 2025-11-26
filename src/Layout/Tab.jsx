import { TabProvider, useTab } from "../Context/TabContext";

/*
<Tabs> 
    <TabList> 
        <Tab index={0}>Home </Tab> 
    </TabList>
    <TabPanel index={0}> Content(Home) </TabPanel>
</Tabs>
*/
export const Tabs = ({ children, defaultValue = 0 }) => {
  return <TabProvider defaultValue={defaultValue}>{children}</TabProvider>;
};
export const TabList = ({ children }) => {
  return <div>{children}</div>;
};
export const Tab = ({ index, children }) => {
  const { activeTab, setActiveTab } = useTab();
  return <button onClick={() => setActiveTab(index)}>{children}</button>;
};
export const TabPanel = ({ index, children }) => {
  const { activeTab } = useTab();
  return activeTab === index ? <div>{children}</div> : null;
};
