import { Route, Routes } from "react-router";
import { Home } from "./modules/home/Home";
import { Catalog } from "./modules/catalog/Catalog";
import { Admin } from "./modules/admin/Admin";
import { Student } from "./modules/student/Student";
import { DashboardLayout } from "./layouts/DashboardLayout";

function App() {
  return (
    <Routes>
      <Route path="/" element=<Home /> />
      <Route path="/catalog" element=<Catalog /> />
      {/* This route must be protected and only accessible to users with admin privileges */}
      <Route path="/admin" element=<DashboardLayout title="Admin" />>
        <Route index element=<Admin /> />
      </Route>
      <Route path="/student" element=<DashboardLayout title="Estudiante" />>
        <Route index element=<Student /> />
      </Route>
    </Routes>
  );
}

export default App;
