import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router";
import App from "./App.tsx";
import { useAuthStore } from "./shared/stores/authStore";

import "@fontsource-variable/sora";
import "@fontsource-variable/inter";
import "./index.css";

// Outside React, so StrictMode doesn't fire two refreshes with the same cookie
useAuthStore.getState().restoreSession();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);
