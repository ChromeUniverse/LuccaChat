import React from "react";
import ReactDOM from "react-dom/client";
import App from "./routes/App";
import { createBrowserRouter, RouterProvider, Route } from "react-router-dom";
import "./index.css";
import Home from "./routes/Home";
import Invite from "./routes/Invite";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/app",
    element: <App />,
  },
  {
    path: "/invite/:inviteCode",
    element: <Invite />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
