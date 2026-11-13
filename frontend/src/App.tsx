import { Route, Routes } from "react-router";
import { Home } from "./modules/home/Home";
import { Catalog } from "./modules/catalog/pages/Catalog";
import { CourseDetail } from "./modules/catalog/pages/CourseDetail";
import { Admin } from "./modules/admin/pages/Admin";
import { AdminCourses } from "./modules/admin/pages/AdminCourses";
import { AdminUsers } from "./modules/admin/pages/AdminUsers";
import { adminNav } from "./modules/admin/constants/nav";
import { Student } from "./modules/student/pages/Student";
import { Learn } from "./modules/student/pages/Learn";
import { Teacher } from "./modules/teacher/pages/Teacher";
import { teacherNav } from "./modules/teacher/constants/nav";
import { Register } from "./modules/auth/pages/Register";
import { Login } from "./modules/auth/pages/Login";
import { AdminLogin } from "./modules/auth/pages/AdminLogin";
import { NotFound } from "./modules/errors/NotFound";
import { Terms } from "./modules/legal/pages/Terms";
import { Privacy } from "./modules/legal/pages/Privacy";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { RequireAuth } from "./shared/components/RequireAuth";

function App() {
  return (
    <Routes>
      <Route element=<PublicLayout />>
        <Route path="/" element=<Home /> />
        <Route path="/catalog" element=<Catalog /> />
        <Route path="/catalog/:slug" element=<CourseDetail /> />
        <Route path="/terms" element=<Terms /> />
        <Route path="/privacy" element=<Privacy /> />
        <Route
          path="/student"
          element=<RequireAuth role="student">
            <Student />
          </RequireAuth>
        />
        <Route path="*" element=<NotFound /> />
      </Route>
      <Route
        path="/student/courses/:slug"
        element=<RequireAuth role="student">
          <Learn />
        </RequireAuth>
      />
      <Route path="/register" element=<Register /> />
      <Route path="/login" element=<Login /> />
      <Route path="/admin/login" element=<AdminLogin /> />
      <Route
        path="/admin"
        element=<RequireAuth role="admin">
          <DashboardLayout
            title="Panel de administración"
            roleLabel="Administrador"
            nav={adminNav}
          />
        </RequireAuth>
      >
        <Route index element=<Admin /> />
        <Route path="courses" element=<AdminCourses /> />
        <Route path="users" element=<AdminUsers /> />
      </Route>
      <Route
        path="/teacher"
        element=<RequireAuth role="teacher">
          <DashboardLayout
            title="Panel docente"
            roleLabel="Docente"
            nav={teacherNav}
          />
        </RequireAuth>
      >
        <Route index element=<Teacher /> />
      </Route>
    </Routes>
  );
}

export default App;
