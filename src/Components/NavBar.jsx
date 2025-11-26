import "./navbar.css";
export const NavBar = ({ activeNav, setActiveNav }) => {
  return (
    <div className="navbar-container">
      <ul className="nav-bar">
        <li className="nav-item" onClick={() => setActiveNav("one")}>
          One
        </li>
        <li className="nav-item" onClick={() => setActiveNav("two")}>
          Two
        </li>
        <li className="nav-item has-dropdown">
          Three
          <ul className="nav-item-dropper">
            <li className="nav-item dropper">Three.1</li>
            <li className="nav-item dropper">Three.2</li>
            <li className="nav-item dropper">Three.3</li>
          </ul>
        </li>
        <li className="nav-item" onClick={() => setActiveNav("four")}>
          Four
        </li>
      </ul>
    </div>
  );
};
