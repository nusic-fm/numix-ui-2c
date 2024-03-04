import { ThemeProvider } from "@mui/material/styles";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import theme from "./theme";
import {
  // createBrowserRouter,
  createHashRouter,
  RouterProvider,
  // Route,
  // Link,
} from "react-router-dom";
import Fx from "./Fx";
import VoiceCover from "./VoiceCover";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/fx",
    element: <Fx />,
  },
  // {
  //   path: "/voice-cover",
  //   element: <VoiceCover />,
  // },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
