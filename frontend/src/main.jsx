import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";
import { EventProvider } from "./context/EventProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EventProvider>
          <App />
          <ToastContainer
            position="bottom-center"
            autoClose={2000}
            hideProgressBar
            closeOnClick
            pauseOnHover
            draggable
            theme="light"
          />
        </EventProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
