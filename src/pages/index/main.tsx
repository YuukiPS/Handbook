import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "@/styles/index.css";
import Drawer from "../drawer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

ReactDOM.createRoot(
    document.getElementById("root") ?? document.createElement("div")
).render(
    <Router>
        <ThemeProvider>
            <Drawer>
                <App />
            </Drawer>
            {/* <div className="flex min-h-screen">
                <Drawer />
                <div className="flex flex-col flex-1 justify-between">
                    <App />
                </div>
            </div> */}
            <Toaster />
        </ThemeProvider>
    </Router>
);
