import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import type React from "react";
import { memo, useState } from "react";
import Updater from "./updater";
import LanguageSwitcher from "@/components/LanguageSwitcher";

import "@/i18n";
import {
    DownloadIcon,
    MenuIcon,
    MoonIcon,
    PickaxeIcon,
    SearchIcon,
    SunMoonIcon,
    UserIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    GlobeIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface DrawerProps {
    children: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = memo(({ children }) => {
    const { t } = useTranslation("default", {
        keyPrefix: "drawer",
    });
    const { setTheme, theme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktopSidebarMinimized, setIsDesktopSidebarMinimized] =
        useState(false);

    const navItems = [
        { href: "/", icon: SearchIcon, label: "search_id" },
        { href: "/settings", icon: UserIcon, label: "player_settings" },
        { href: "/generate", icon: PickaxeIcon, label: "generate" },
        { href: "/download", icon: DownloadIcon, label: "download" },
        {
            href: "#",
            icon: GlobeIcon,
            label: "language",
            onClick: () => setIsDesktopSidebarMinimized(false),
            isLanguageSwitcher: true,
        },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
            <div className="fixed top-0 left-0 right-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-b-muted bg-background px-4 sm:px-6">
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
                        fixed top-[4rem] left-0 h-[calc(100vh-4rem)] z-50 flex flex-col border-r border-r-muted px-4 py-6 sm:px-6 
                        transition-all duration-300 ease-in-out dark:border-r-[#2d3748] bg-background
                        lg:fixed lg:top-[4rem] lg:z-30 lg:translate-x-0
                        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                        ${isDesktopSidebarMinimized ? "lg:w-20" : "lg:w-64"}
                    `}
                >
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                setIsDesktopSidebarMinimized((prev) => !prev)
                            }
                            className="absolute top-0 -right-10 hidden lg:flex"
                        >
                            {isDesktopSidebarMinimized ? (
                                <ChevronRightIcon className="h-4 w-4" />
                            ) : (
                                <ChevronLeftIcon className="h-4 w-4" />
                            )}
                            <span className="sr-only">Toggle sidebar</span>
                        </Button>
                    </div>
                    <ul className="grid gap-2 mt-8">
                        {navItems.map(
                            ({
                                href,
                                icon: Icon,
                                label,
                                onClick,
                                isLanguageSwitcher,
                            }) => (
                                <li key={href}>
                                    {isLanguageSwitcher &&
                                    !isDesktopSidebarMinimized ? (
                                        <div className="px-3 py-2">
                                            <LanguageSwitcher />
                                        </div>
                                    ) : (
                                        <a
                                            href={href}
                                            onClick={onClick}
                                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted dark:hover:bg-[#2d3748] ${
                                                window.location.pathname ===
                                                href
                                                    ? "bg-primary text-primary-foreground dark:bg-[#4c51bf] dark:text-[#e5e7eb]"
                                                    : "text-muted-foreground hover:text-foreground dark:text-[#a0aec0] dark:hover:text-[#e5e7eb]"
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span
                                                className={
                                                    isDesktopSidebarMinimized
                                                        ? "lg:hidden"
                                                        : ""
                                                }
                                            >
                                                {t(label)}
                                            </span>
                                        </a>
                                    )}
                                </li>
                            )
                        )}
                    </ul>
                    <footer className="mt-auto py-4 text-center text-sm text-muted-foreground dark:text-[#a0aec0]">
                        <a
                            href={"https://github.com/YuukiPS/Handbook"}
                            target={"_blank"}
                            rel="noreferrer"
                            className={
                                isDesktopSidebarMinimized ? "lg:hidden" : ""
                            }
                        >
                            Version 0.1.1 (pre-release)
                        </a>
                    </footer>
                </nav>
                <main
                    className={`flex-1 overflow-auto w-full pt-16 transition-all duration-300 ${
                        isDesktopSidebarMinimized ? "lg:pl-20" : "lg:pl-64"
                    }`}
                >
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
