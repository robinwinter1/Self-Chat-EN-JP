import { Routes, Route, Navigate } from "react-router-dom";
import Chat from "./pages/Chat";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />

      <Route path="/chat" element={<Chat />} />
    </Routes>
  );
}
