import { Route, Routes } from "react-router";
import { Home } from "./modules/home/Home";
import { Catalog } from "./modules/catalog/pages/Catalog";
import { Admin } from "./modules/admin/Admin";
import { Student } from "./modules/student/Student";
import { Register } from "./modules/register/pages/Register";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { PublicLayout } from "./layouts/PublicLayout";

function App() {
  return (
    <Routes>
      <Route element=<PublicLayout />>
        <Route path="/" element=<Home /> />
        <Route path="/catalog" element=<Catalog /> />
      </Route>
      <Route path="/register" element=<Register /> />
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
