import type React from "react";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useCookies } from "react-cookie";
import { IoMdSearch, IoMdClose } from "react-icons/io";
import { GiHamburgerMenu } from "react-icons/gi";
import expiresInAMonth from "./cookieExpires";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Icon } from "@/components/ui/icon";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ToggleIcon } from "@/components/ui/toggle-icon";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import debounce from "lodash/debounce";
import type { State } from "./types";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { open, type OpenDialogOptions } from "@tauri-apps/plugin-dialog";
import { FolderIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { platform } from "@tauri-apps/plugin-os";

interface SearchProps {
    currentLanguage: string;
    loadGI: () => Promise<void>;
    loadSR: () => Promise<void>;
    state: State;
    setState: React.Dispatch<React.SetStateAction<State>>;
}

interface StoragePermissionResponse {
    status: "Granted" | "Cancelled" | "Denied";
}

const Search: React.FC<SearchProps> = ({
    loadGI,
    loadSR,
    currentLanguage,
    state,
    setState,
}) => {
    const { t } = useTranslation("translation", { keyPrefix: "search" });
    const { toast } = useToast();
    const [cookie, setCookie] = useCookies([
        "language",
        "showImage",
        "showCommands",
        "type",
        "uid",
        "code",
        "server",
        "limitsResult",
    ]);
    const [sliderValue, setSliderValue] = useState<number[]>([
        cookie.limitsResult || 30,
    ]);
    const [pathHandbook, setPathHandbook] = useState<string>("");
    const [forceUpdatePath, setForceUpdatePath] = useState<boolean>(false);

    const [isOpen, setIsOpen] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState((prevState) => ({
            ...prevState,
            searchTerm: e.target.value,
        }));
    };

    const handleSearch = useCallback(
        (e: string) => {
            setState((prevState) => ({
                ...prevState,
                searchTerm: e,
                searchInputValue: e,
                error: false,
            }));
        },
        [setState]
    );

    const handleSearchTrigger = useCallback(() => {
        if (state.searchTerm === "") return;
        setState((prevState) => ({
            ...prevState,
            loading: true,
        }));
        handleSearch(state.searchTerm);
        state.currentType === "Genshin Impact" ? loadGI() : loadSR();
    }, [
        state.searchTerm,
        state.currentType,
        handleSearch,
        loadGI,
        loadSR,
        setState,
    ]);

    const debouncedSetCookie = useCallback(
        debounce((value: number[]) => {
            setCookie("limitsResult", value[0], {
                path: "/",
                expires: expiresInAMonth(),
            });
        }, 1000),
        []
    );

    useEffect(() => {
        debouncedSetCookie(sliderValue);
    }, [sliderValue, debouncedSetCookie]);

    const toggleMenu = useCallback(() => {
        setIsOpen((prevIsOpen) => !prevIsOpen);
    }, []);
    useEffect(() => {
        const getPath = async () => {
            const response = await invoke<string>("get_path_handbook");
            setPathHandbook(response);
        };
        if (isTauri()) {
            getPath();
        }
    }, []);

    const selectHandbook = useCallback(async () => {
        if (!isTauri()) {
            toast({
                title: "Error",
                description:
                    "This feature is only available on desktop and mobile applications. It is not supported in web browsers.",
                variant: "destructive",
            });
            return;
        }
        const currentPlatform = platform();
        if (currentPlatform === "android") {
            try {
                const checkPermissions =
                    await invoke<StoragePermissionResponse>(
                        "plugin:handbook-finder|checkPermissions"
                    );
                if (checkPermissions.status === "Denied") {
                    const result = await invoke<StoragePermissionResponse>(
                        "plugin:handbook-finder|requestStoragePermission"
                    );
                    if (result.status === "Cancelled") {
                        // Re-check permissions may return 'Cancelled' even when granted
                        const recheck = await invoke<StoragePermissionResponse>(
                            "plugin:handbook-finder|checkPermissions"
                        );
                        if (recheck.status === "Denied") {
                            toast({
                                title: "Storage permission denied",
                                description:
                                    "Storage permission is required to read the handbook file",
                            });
                            return;
                        }
                    }
                }
            } catch (e) {
                toast({
                    title: "Error",
                    description: `Error requesting storage permission: ${JSON.stringify(
                        e
                    )}`,
                    variant: "destructive",
                });
                return;
            }
        }

        const options: OpenDialogOptions = useMemo(() => {
            const currentPlatform = platform();
            return {
                directory: false,
                title: "Select GM Handbook path",
                filters:
                    currentPlatform === "windows"
                        ? [{ name: "GM Handbook", extensions: ["json"] }]
                        : undefined,
            };
        }, []);

        const path = await open(options);
        if (!path) {
            toast({
                title: "No path selected",
                description: "Please select a path",
                variant: "destructive",
            });
            return;
        }

        try {
            await invoke("update_path_handbook", {
                path: path.path,
                force: forceUpdatePath,
            });
            const newPath = await invoke<string>("get_path_handbook");
            setPathHandbook(newPath);
            const listCategory = await invoke<string[]>("get_category");
            setState((prev) => ({
                ...prev,
                listCategory,
            }));
            toast({
                title: "Path updated",
                description: "Path updated successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: `Error while selecting path: ${error}`,
                variant: "destructive",
            });
        }
    }, [forceUpdatePath, toast, setState]);

    const handleTypeChange = useCallback(
        (e: string) => {
            const newType = e as "Genshin Impact" | "Star Rail";
            setCookie("type", newType, {
                path: "/",
                expires: expiresInAMonth(),
            });
            setState((prevState) => ({
                ...prevState,
                currentType: newType,
                selectedCategory: "category",
                searchTerm: "",
            }));
            handleSearch("");
        },
        [setCookie, handleSearch, setState]
    );

    const handleSearchInputKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Enter") {
            if (state.searchTerm === "") {
                return;
            }
            handleSearch(state.searchTerm);
            state.currentType === "Genshin Impact" ? loadGI() : loadSR();
        } else if (e.key === "Escape") {
            handleSearch("");
            setState((prevState) => ({
                ...prevState,
                searchTerm: "",
            }));
        }
    };

    const setShowCommandsMapping = useMemo(
        () => ({
            "Genshin Impact": () =>
                setState((prevState) => ({
                    ...prevState,
                    showCommands: !prevState.showCommands,
                })),
            "Star Rail": () =>
                setState((prevState) => ({
                    ...prevState,
                    showCommandsSR: !prevState.showCommandsSR,
                })),
        }),
        [setState]
    );

    return (
        <div className="mt-5 flex justify-center">
            <div
                className={
                    "relative flex w-full flex-col items-center justify-between rounded-lg border border-gray-600 shadow-lg md:w-3/4 lg:w-3/5"
                }
            >
                <h2 className="absolute left-5 top-8 select-none text-gray-600 dark:text-gray-400 max-sm:hidden">
                    {state.currentType}
                </h2>
                <div className="form-control w-full items-center justify-between p-4">
                    <Label className="my-2 flex justify-center">
                        <span className="label-text select-none">
                            <Trans
                                i18nKey={"kbd.enter"}
                                t={t}
                                components={[<Kbd key={"search-kbd-enter"} />]}
                            />
                        </span>
                        <span className="label-text ml-3 select-none">
                            <Trans
                                i18nKey={"kbd.escape"}
                                t={t}
                                components={[<Kbd key={"search-kbd-escape"} />]}
                            />
                        </span>
                    </Label>
                    <div className="flex w-full items-center">
                        <Input
                            type="text"
                            placeholder={t("input_placeholder")}
                            className="w-full rounded-l-lg rounded-r-none border-2 border-gray-500 bg-transparent px-4 py-2 outline-none"
                            value={state.searchTerm}
                            onChange={handleInputChange}
                            onKeyDown={handleSearchInputKeyDown}
                        />
                        <Icon
                            icon={IoMdSearch}
                            className="cursor-pointer rounded-lg rounded-l-none bg-slate-300 p-2 dark:bg-slate-700"
                            size={36}
                            onClick={handleSearchTrigger}
                        />
                    </div>
                    <div className="mt-2 flex justify-center">
                        <TooltipProvider delayDuration={500}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ToggleIcon
                                        originalIcon={GiHamburgerMenu}
                                        toggledIcon={IoMdClose}
                                        onClick={toggleMenu}
                                        className="rounded-lg bg-gray-300 p-3 dark:bg-gray-800"
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    {isOpen
                                        ? t("tooltip_menu.close")
                                        : t("tooltip_menu.open")}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                <div
                    className={`flex w-full flex-col overflow-hidden duration-300 ${
                        isOpen ? "max-h-[400px]" : "max-h-0"
                    }`}
                >
                    <Label className="flex justify-center">
                        {t("label.api_settings")}
                    </Label>
                    <div className="m-2 flex flex-col space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            GM Handbook Path
                        </Label>
                        <div className="relative w-full">
                            <Input
                                type="text"
                                placeholder="Select path..."
                                value={pathHandbook}
                                className="w-full pl-3 pr-[6.4rem] py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all duration-300 ease-in-out"
                                readOnly
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center">
                                <div className="flex items-center mr-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center">
                                                    <Checkbox
                                                        id="force-update"
                                                        checked={
                                                            forceUpdatePath
                                                        }
                                                        onCheckedChange={() =>
                                                            setForceUpdatePath(
                                                                !forceUpdatePath
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        htmlFor="force-update"
                                                        className="text-xs ml-1"
                                                    >
                                                        Force
                                                    </label>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Force update the handbook path
                                                even if it's the same
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="h-full px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg transition-colors duration-300"
                                                onClick={selectHandbook}
                                            >
                                                <FolderIcon className="h-5 w-5 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-300" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Select handbook path
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                    <div className="m-2 space-y-1">
                        <Select
                            value={state.currentType}
                            onValueChange={(e) => handleTypeChange(e)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a games" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>
                                        {t("label.games")}
                                    </SelectLabel>
                                    <SelectItem value="Genshin Impact">
                                        Genshin Impact
                                    </SelectItem>
                                    <SelectItem value="Star Rail">
                                        Honkai: Star Rail
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Select
                            value={state.selectedCategory}
                            onValueChange={(e) =>
                                setState((prevState) => ({
                                    ...prevState,
                                    selectedCategory: e,
                                }))
                            }
                            defaultValue="Select a category"
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>
                                        {t("label.category")}
                                    </SelectLabel>
                                    <SelectItem value="category" defaultChecked>
                                        {t("label.category_all")}
                                    </SelectItem>
                                    {state.listCategory.map((category) => (
                                        <SelectItem
                                            key={`${category.replace(/ /, "")}`}
                                            value={category}
                                        >
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Select
                            value={currentLanguage}
                            onValueChange={(e) => {
                                setCookie("language", e, {
                                    path: "/",
                                    expires: expiresInAMonth(),
                                });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>
                                        {t("label.language")}
                                    </SelectLabel>
                                    <SelectItem value="EN">English</SelectItem>
                                    <SelectItem value="ID">
                                        Indonesian
                                    </SelectItem>
                                    <SelectItem value="JP">Japanese</SelectItem>
                                    <SelectItem value="CHS">
                                        Simplified Chinese (Mainland China)
                                    </SelectItem>
                                    <SelectItem value="CHT">
                                        Traditional Chinese (Hong Kong)
                                    </SelectItem>
                                    <SelectItem value="TH">Thai</SelectItem>
                                    <SelectItem value="RU">Russian</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mx-12 max-sm:mx-6">
                        <div className="mb-2 flex items-center">
                            <label
                                htmlFor="results-input"
                                className="mr-2 select-none"
                            >
                                {t("label.results")}
                            </label>
                            <Input
                                id="results-input"
                                type="number"
                                value={sliderValue[0]}
                                onChange={(e) => {
                                    const value = Number.parseInt(
                                        e.target.value,
                                        10
                                    );
                                    setSliderValue([
                                        Math.min(Math.max(value, 1), 500),
                                    ]);
                                }}
                                className="w-16"
                                min={1}
                                max={500}
                            />
                        </div>
                        <Slider
                            defaultValue={[30]}
                            min={1}
                            max={500}
                            step={1}
                            value={sliderValue}
                            onValueChange={setSliderValue}
                            aria-label="Number of results"
                        />
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="flex items-center justify-center p-4">
                            <Label
                                htmlFor="show-image"
                                className="label-text mr-1 select-none opacity-80 hover:cursor-pointer"
                            >
                                {t("checkbox.image")}
                            </Label>
                            <Checkbox
                                id="show-image"
                                checked={state.showImage}
                                onClick={() => {
                                    setState((prevState) => ({
                                        ...prevState,
                                        showImage: !prevState.showImage,
                                    }));
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-center">
                            <Label
                                htmlFor="show-commands"
                                className="label-text mr-1 select-none opacity-80 hover:cursor-pointer"
                            >
                                {t("checkbox.commands")}
                            </Label>
                            <Checkbox
                                id="show-commands"
                                checked={
                                    state.currentType === "Genshin Impact"
                                        ? state.showCommands
                                        : state.showCommandsSR
                                }
                                onClick={() =>
                                    setShowCommandsMapping[state.currentType]()
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Search;
