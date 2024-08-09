import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
    Overlay,
    Sidebar,
    type SidebarState,
    useSidebar,
} from "@rewind-ui/core";
import type React from "react";
import { memo, useState } from "react";

import "@/i18n";
import {
    Users,
    Search,
    SunIcon,
    MoonIcon,
    PaletteIcon,
    PickaxeIcon,
    MenuIcon,
} from "lucide-react";

interface DrawerProps {
    children: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = memo(({ children }) => {
    // const { t } = useTranslation("default", { keyPrefix: "drawer" });
    const { setTheme } = useTheme();
    const [expanded, setExpanded] = useState(true);
    const [mobile, setMobile] = useState(false);
    const sidebar = useSidebar();

    return (
        <div className="relative flex flex-row min-h-screen">
            <Sidebar
                onToggle={(state: SidebarState) => {
                    setExpanded(state.expanded);
                    setMobile(state.mobile);
                }}
                className="absolute"
            >
                <Sidebar.Head>
                    <Sidebar.Head.Logo>
                        <img
                            src="/logo.png"
                            width={32}
                            height={32}
                            alt="Logo"
                        />
                    </Sidebar.Head.Logo>
                    <Sidebar.Head.Title>Handbook Finder</Sidebar.Head.Title>
                    <Sidebar.Head.Toggle />
                </Sidebar.Head>

                <Sidebar.Nav>
                    <Sidebar.Nav.Section>
                        <Sidebar.Nav.Section.Title>
                            Menu
                        </Sidebar.Nav.Section.Title>
                        <Sidebar.Nav.Section.Item
                            icon={<Search />}
                            label="Search ID"
                            href="/"
                        />
                        <Sidebar.Nav.Section.Item
                            icon={<PickaxeIcon />}
                            label="Generate"
                            href="/generate"
                        />
                    </Sidebar.Nav.Section>
                    <Sidebar.Nav.Section>
                        <Sidebar.Nav.Section.Title>
                            Settings
                        </Sidebar.Nav.Section.Title>
                        <Sidebar.Nav.Section.Item
                            icon={<Users />}
                            label="Players"
                            href="/settings"
                        />
                        <Sidebar.Nav.Section.Item
                            as={"button"}
                            label="Theme"
                            icon={<PaletteIcon />}
                        >
                            <Sidebar.Nav.Section
                                isChild
                                className="dark:bg-slate-900"
                            >
                                <Sidebar.Nav.Section.Item
                                    icon={<SunIcon />}
                                    label="Light"
                                    href="#"
                                    as={"button"}
                                    onClick={() => setTheme("light")}
                                    className="ml-4"
                                />
                                <Sidebar.Nav.Section.Item
                                    icon={<MoonIcon />}
                                    label="Dark"
                                    href="#"
                                    as={"button"}
                                    onClick={() => setTheme("dark")}
                                    className="ml-4"
                                />
                            </Sidebar.Nav.Section>
                        </Sidebar.Nav.Section.Item>
                    </Sidebar.Nav.Section>
                </Sidebar.Nav>

                <Sidebar.Footer>
                    <div className="flex flex-col justify-center items-center text-sm">
                        <span className="font-semibold">Handbook Finder</span>
                        <span>version 1.0.0</span>
                    </div>
                </Sidebar.Footer>
            </Sidebar>

            <main
                className={`transition-all transform duration-100 flex w-full flex-col items-center ${
                    expanded && "md:ml-20"
                }`}
            >
                {mobile && (
                    <Overlay
                        blur="none"
                        onClick={() => {
                            sidebar.toggleMobile();
                        }}
                        className="md:hidden z-40"
                    />
                )}
                <header>
                    <Button
                        onClick={() => {
                            sidebar.toggleMobile();
                        }}
                        size="sm"
                        color="white"
                        className="ml-auto flex md:hidden"
                    >
                        <MenuIcon />
                    </Button>
                </header>
                {children}
            </main>
        </div>
    );
});

export default Drawer;
