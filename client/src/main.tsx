import React from "react";
import ReactDOM from "react-dom/client";
import App from "./routes/App";
import { createBrowserRouter, RouterProvider, Route } from "react-router-dom";
import "./index.css";
import Home from "./routes/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/app",
    element: <App />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />
  </React.StrictMode>
);
