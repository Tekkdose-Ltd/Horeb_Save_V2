import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Validate environment configuration on startup
import "./lib/env";

createRoot(document.getElementById("root")!).render(<App />);
