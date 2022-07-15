import { Link, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Safes() {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}
