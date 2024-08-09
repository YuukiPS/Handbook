import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "@/styles/index.css";
import Drawer from "../drawer";
import { ThemeProvider } from "@/components/theme-provider";

ReactDOM.createRoot(
    document.getElementById("root") ?? document.createElement("div")
).render(
    <Router>
        <ThemeProvider>
            <Drawer>
                <App />
            </Drawer>
        </ThemeProvider>
    </Router>
);
