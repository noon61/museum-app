import { BrowserRouter, Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Input from "./pages/Input";
import Display from "./pages/Display";
import Quiz from "./pages/Quiz";
import Persona from "./pages/Persona";
import DataExperience from "./pages/DataExperience";
import AnnotationWall from "./pages/AnnotationWall";
import WallControl from "./pages/WallControl";
import MarkPad from "./pages/MarkPad";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/input" element={<Input />} />
        <Route path="/display" element={<Display />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/persona/:personaId" element={<Persona />} />
        <Route path="/persona/:personaId/:mode" element={<DataExperience />} />
        <Route path="/wall" element={<AnnotationWall />} />
        <Route path="/control" element={<WallControl />} />
        <Route path="/ipad" element={<MarkPad />} />
      </Routes>
    </BrowserRouter>
  );
}
