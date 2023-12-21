import { Route, Router, Routes } from "react-router-dom";
import DashBoard from "./Dashboard";
import App from "./App";

export default function Root() {
  return (
    <Routes>
      <Route path="/" element={<DashBoard />} />
      <Route path="/app" element={<App />} />
    </Routes>
  )
}
