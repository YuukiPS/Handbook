import { invoke } from "@tauri-apps/api/core";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { MultiSelect } from "@/components/ui/multi-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileIcon, FolderIcon, RocketIcon } from "lucide-react";
import { listen } from "@tauri-apps/api/event";
import { error, info } from "@tauri-apps/plugin-log";
import { useToast } from "@/components/ui/use-toast.ts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Output, { useOutputVisibility } from "@/components/output";
import getPlatformFolderSelector from "@/lib/getPlaformFolderSelector";

const App: React.FC = (): JSX.Element => {
    const { toast } = useToast();
    const [selectedResourcesDirectory, setSelectedResourcesDirectory] =
        useState<string>("");
    const [selectedSelections, setSelectedSelections] = useState<string[]>([]);
    const [selectedTextMapPath, setSelectedTextMapPath] = useState<string>("");
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [outputPath, setOutputPath] = useState<string>("");
    const [filename, setFilename] = useState<string>("");
    const [outputLog, setOutputLog] = useState<Output[]>([]);
    const [loading, setLoading] = useState(false);
    const [gameType, setGameType] = useState<string>("");
    const { isOutputVisible, setIsOutputVisible } = useOutputVisibility();

    useEffect(() => {
        const unlisten = listen("handbook", (event) => {
            const { payload } = event;
            setOutputLog((prev) => [...prev, payload as Output]);
        });
        return () => {
            unlisten.then((f) => f());
        };
    }, []);

    const [languages, setLanguages] = useState<string[]>([]);
    const selections = [
        "Characters",
        "Materials",
        "Weapons",
        "Artifacts",
        "Quests",
        "Dungeons",
        "Scenes",
        "Monsters",
    ];

    const generate = useCallback(async () => {
        setLoading(true);
        setIsOutputVisible(true);

        const logError = (message: string) => {
            setOutputLog((prev) => [...prev, { log_level: "error", message }]);
            error(message);
        };

        const errors = [];
        if (selectedResourcesDirectory.length === 0) {
            errors.push("No resources directory selected");
        }
        if (languages.length === 0) {
            errors.push("No languages selected");
        }
        if (selectedSelections.length === 0) {
            errors.push("No selections selected");
        }

        if (errors.length > 0) {
            errors.forEach(logError);
            setLoading(false);
            return;
        }

        try {
            await invoke("generate_handbook", {
                args: {
                    excelPath: selectedResourcesDirectory,
                    textMapPath: selectedTextMapPath,
                    outputPath,
                    outputFileName: filename || "gmhandbook.json",
                },
                game: gameType,
                selections: selectedSelections,
                languages: selectedLanguages,
            });
        } catch (e) {
            const errorMessage = `Error: ${e instanceof Error ? e.message : e}`;
            logError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [
        filename,
        outputPath,
        selectedLanguages,
        selectedSelections,
        selectedTextMapPath,
        selectedResourcesDirectory,
        languages.length,
        gameType,
        setIsOutputVisible,
    ]);

    const selectFolder = async (
        title: string,
        setPath: (path: string) => void
    ) => {
        const folderSelector = await getPlatformFolderSelector();
        if (!folderSelector) {
            toast({
                title: "Not Supported",
                description:
                    "Platform does not support folder selection, or permission was denied on Android.",
                variant: "destructive",
            });
            return null;
        }

        const result = await folderSelector(title);
        const selectedPath =
            typeof result === "string" ? result : result?.displayName;
        if (!selectedPath) {
            toast({
                title: "Folder Select",
                description: "No folder is selected.",
                variant: "destructive",
            });
            return null;
        }

        setPath(selectedPath);
        await info(`Selected directory: ${selectedPath}`);
        return selectedPath;
    };

    const selectResourcesDirectory = async () =>
        await selectFolder(
            "Select a directory to where Resources",
            setSelectedResourcesDirectory
        );
    const selectTextMapPath = async () => {
        try {
            const selectedPath = await selectFolder(
                "Select a directory to where Text Map",
                setSelectedTextMapPath
            );
            const listTextMap = await invoke<string[]>("get_list_text_map", {
                path: selectedPath,
            });
            setLanguages(listTextMap);
            if (listTextMap.length === 0) {
                toast({
                    title: "Text Map",
                    description: `No TextMap found in the '${selectedTextMapPath}' folders`,
                    variant: "destructive",
                });
            }
        } catch (e) {
            await error(e instanceof Error ? e.message : `Unknown error: ${e}`);
        }
    };
    const selectOutputPath = async () =>
        await selectFolder("Select a directory to where Output", setOutputPath);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
                    Generate GM Handbook
                </h1>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label className="mb-2 block">
                                Resources Directory
                            </Label>
                            <Button
                                onClick={selectResourcesDirectory}
                                variant="outline"
                                className="w-full justify-start"
                            >
                                <FolderIcon className="mr-2 h-4 w-4" />
                                <span className="truncate">
                                    {selectedResourcesDirectory ||
                                        "Select Resources Directory"}
                                </span>
                            </Button>
                        </div>

                        <div>
                            <Label className="mb-2 block">Text Map Path</Label>
                            <Button
                                onClick={selectTextMapPath}
                                variant="outline"
                                className="w-full justify-start"
                            >
                                <FileIcon className="mr-2 h-4 w-4" />
                                <span className="truncate">
                                    {selectedTextMapPath ||
                                        "Select Text Map Path"}
                                </span>
                            </Button>
                        </div>

                        <div>
                            <Label className="mb-2 block">Output Path</Label>
                            <Button
                                onClick={selectOutputPath}
                                variant="outline"
                                className="w-full justify-start"
                            >
                                <FolderIcon className="mr-2 h-4 w-4" />
                                <span className="truncate">
                                    {outputPath || "Select Output Path"}
                                </span>
                            </Button>
                        </div>

                        <div>
                            <Label htmlFor="filename" className="mb-2 block">
                                Output File Name
                            </Label>
                            <Input
                                id="filename"
                                type="text"
                                value={filename}
                                onChange={(e) => setFilename(e.target.value)}
                                className="w-full"
                                placeholder="gmhandbook.json"
                            />
                        </div>

                        <div>
                            <Label className="mb-2 block">
                                Select Languages
                            </Label>
                            <MultiSelect
                                options={languages.map((lang) => ({
                                    label: lang,
                                    value: lang,
                                }))}
                                onValueChange={setSelectedLanguages}
                                defaultValue={selectedLanguages}
                                placeholder="Select languages"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <Label className="mb-2 block">
                                List To Include
                            </Label>
                            <MultiSelect
                                options={selections.map((selection) => ({
                                    label: selection,
                                    value: selection,
                                }))}
                                onValueChange={setSelectedSelections}
                                defaultValue={selectedSelections}
                                placeholder="Select items to include"
                                className="w-full"
                            />
                        </div>

                        <div>
                            <div>
                                <Label className="mb-2 block">
                                    Type of Game
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setGameType(value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a Game" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="genshin-impact">
                                            Genshin Impact
                                        </SelectItem>
                                        <SelectItem value="star-rail">
                                            Honkai: Star Rail
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={generate}
                        className="w-full mt-6"
                        loadingMessage="Generating..."
                        loading={loading}
                    >
                        <RocketIcon className="mr-2 h-4 w-4" />
                        Generate Handbook
                    </Button>
                </div>
            </div>

            <Output
                outputLog={outputLog}
                setOutputLog={setOutputLog}
                setIsOutputVisible={setIsOutputVisible}
                isOutputVisible={isOutputVisible}
            />
        </div>
    );
};

export default App;
