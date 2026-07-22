import { BrowserRouter, Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Input from "./pages/Input";
import Display from "./pages/Display";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/input" element={<Input />} />
        <Route path="/display" element={<Display />} />
      </Routes>
    </BrowserRouter>
  );
}