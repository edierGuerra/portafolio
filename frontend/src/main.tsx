
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import CmsApp from "./cms/CmsApp.tsx";
import "./index.css";

const pathname = window.location.pathname.toLowerCase();
const RootComponent = pathname.startsWith("/cms") ? CmsApp : App;

createRoot(document.getElementById("root")!).render(<RootComponent />);
  