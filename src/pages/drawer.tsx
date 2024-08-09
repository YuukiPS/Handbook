import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import type React from "react";
import { memo, useState } from "react";
import Updater from "./updater";

import "@/i18n";
import {
    MenuIcon,
    SunMoonIcon,
    UserIcon,
    SearchIcon,
    PickaxeIcon,
    MoonIcon,
} from "lucide-react";

interface DrawerProps {
    children: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = memo(({ children }) => {
    const { setTheme, theme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-b-muted px-4 sm:px-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen((prev) => !prev)}
                    className="lg:hidden"
                >
                    <MenuIcon className="h-6 w-6" />
                    <span className="sr-only">Toggle sidebar</span>
                </Button>
                <a href="/" className="flex items-center gap-2 font-bold">
                    <img
                        src="/logo.png"
                        alt="Handbook Finder"
                        className="h-6 w-6"
                    />
                    <span>Handbook Finder</span>
                </a>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                    }
                >
                    <div className="relative w-6 h-6">
                        <SunMoonIcon
                            className={`h-6 w-6 absolute transition-all duration-300 ${
                                theme === "dark"
                                    ? "opacity-100 rotate-0"
                                    : "opacity-0 -rotate-90"
                            }`}
                        />
                        <MoonIcon
                            className={`h-6 w-6 absolute transition-all duration-300 ${
                                theme === "light"
                                    ? "opacity-100 rotate-0"
                                    : "opacity-0 rotate-90"
                            }`}
                        />
                    </div>
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>
            <div className="flex flex-1 relative">
                <nav
                    className={`
                        fixed top-16 left-0 h-[calc(100vh-4rem)] z-50 flex flex-col border-r border-r-muted px-4 py-6 sm:px-6 
                        transition-all duration-300 ease-in-out dark:border-r-[#2d3748] bg-background
                        lg:relative lg:top-0 lg:z-auto lg:w-64 lg:translate-x-0
                        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    `}
                >
                    <ul className="grid gap-2">
                        <li>
                            <a
                                href="/"
                                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted dark:hover:bg-[#2d3748] ${
                                    window.location.pathname === "/"
                                        ? "bg-primary text-primary-foreground dark:bg-[#4c51bf] dark:text-[#e5e7eb]"
                                        : "text-muted-foreground hover:text-foreground dark:text-[#a0aec0] dark:hover:text-[#e5e7eb]"
                                }`}
                            >
                                <SearchIcon className="h-5 w-5" />
                                Search ID
                            </a>
                        </li>
                        <li>
                            <a
                                href="/settings"
                                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted dark:hover:bg-[#2d3748] ${
                                    window.location.pathname === "/settings"
                                        ? "bg-primary text-primary-foreground dark:bg-[#4c51bf] dark:text-[#e5e7eb]"
                                        : "text-muted-foreground hover:text-foreground dark:text-[#a0aec0] dark:hover:text-[#e5e7eb]"
                                }`}
                            >
                                <UserIcon className="h-5 w-5" />
                                Player Settings
                            </a>
                        </li>
                        <li>
                            <a
                                href="/generate"
                                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted dark:hover:bg-[#2d3748] ${
                                    window.location.pathname === "/generate"
                                        ? "bg-primary text-primary-foreground dark:bg-[#4c51bf] dark:text-[#e5e7eb]"
                                        : "text-muted-foreground hover:text-foreground dark:text-[#a0aec0] dark:hover:text-[#e5e7eb]"
                                }`}
                            >
                                <PickaxeIcon className="h-5 w-5" />
                                Generate
                            </a>
                        </li>
                    </ul>
                    <footer className="mt-auto py-4 text-center text-sm text-muted-foreground dark:text-[#a0aec0]">
                        version 1.0.0
                    </footer>
                </nav>
                <main className="flex-1 overflow-auto w-full">
                    <Updater />
                    {children}
                </main>
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") setIsSidebarOpen(false);
                        }}
                        role="button"
                        tabIndex={0}
                    />
                )}
            </div>
        </div>
    );
});

export default Drawer;
