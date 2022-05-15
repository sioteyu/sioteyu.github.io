import logo from "./logo.svg";
import "./assets/App.css";
import {Routes, Route, Link} from "react-router-dom";
import Home from "./Home.js";
import History from "./History.js";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/History/:type" element={<History />} />
      </Routes>
    </div>
  );
}

export default App;
