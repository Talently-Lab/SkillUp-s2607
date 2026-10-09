import { Route, Routes } from "react-router";
import { Home } from "./modules/home/Home";
import { Catalog } from "./modules/catalog/pages/Catalog";
import { CourseDetail } from "./modules/catalog/pages/CourseDetail";
import { Admin } from "./modules/admin/pages/Admin";
import { Student } from "./modules/student/pages/Student";
import { Register } from "./modules/auth/pages/Register";
import { Login } from "./modules/auth/pages/Login";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { RequireAuth } from "./shared/components/RequireAuth";

function App() {
  return (
    <Routes>
      <Route element=<PublicLayout />>
        <Route path="/" element=<Home /> />
        <Route path="/catalog" element=<Catalog /> />
        <Route path="/catalog/:courseId" element=<CourseDetail /> />
        {/* The student panel keeps the site header, so it lives in the public layout */}
        <Route
          path="/student"
          element=<RequireAuth role="student">
            <Student />
          </RequireAuth>
        />
      </Route>
      <Route path="/register" element=<Register /> />
      <Route path="/login" element=<Login /> />
      <Route
        path="/admin"
        element=<RequireAuth role="admin">
          <DashboardLayout title="Admin" />
        </RequireAuth>
      >
        <Route index element=<Admin /> />
      </Route>
    </Routes>
  );
}

export default App;
