import { useContext } from "react";
import { NavBar } from "../Components/NavBar";
import { Tab, TabList, TabPanel, Tabs } from "../Layout/Tab";
import "./homecontainer.css";
import { NavContext } from "../Context/NavContext";
import { One } from "../Layout/One";
import { Two } from "../Layout/Two";
export const HomePage = () => {
  const { activeNav, setActiveNav } = useContext(NavContext);
  console.log(activeNav);
  return (
    <div className="home-container">
      <div className="home-title">Welcome to the homepage</div>
      <div className="home-content">
        <Tabs>
          <TabList>
            <Tab index={0}>State</Tab>
            <Tab index={1}>Country</Tab>
          </TabList>
          <TabPanel index={0}>
            <NavBar activeNav={activeNav} setActiveNav={setActiveNav} />
          </TabPanel>
          <TabPanel index={1}>Content-1</TabPanel>
        </Tabs>
      </div>
      <div>
        {activeNav === "one" && <One />}
        {activeNav === "two" && <Two />}
      </div>
    </div>
  );
};
