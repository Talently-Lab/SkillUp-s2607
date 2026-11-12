// Global styles first, so module styles can refine the shared classes
import "@fontsource/caveat/700.css";
import "@fontsource-variable/inter";
import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router";
import { Toaster } from "sonner";
import App from "./App.tsx";
import { useAuthStore } from "./shared/stores/authStore";


// Outside React, so StrictMode doesn't fire two refreshes with the same cookie
useAuthStore.getState().restoreSession();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <App />
      <Toaster position="top-right" richColors closeButton toastOptions={{ className: "skillup-toast" }} />
    </Router>
  </StrictMode>,
);
