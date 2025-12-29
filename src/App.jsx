import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Turnos from "./components/Turnos";
import NavBar from "./components/NavBar";
import Registro from "./components/Registro";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/turnos" element={<Turnos />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
