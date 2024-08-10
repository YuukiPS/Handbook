import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useCallback, useEffect, useRef, useState } from "react";
import { MultiSelect } from "@/components/ui/multi-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    ChevronDownIcon,
    FileIcon,
    FolderIcon,
    RocketIcon,
} from "lucide-react";
import { listen } from "@tauri-apps/api/event";
import { error } from "@/log";

interface Output {
    log_level: string;
    message: string;
}

const App: React.FC = (): JSX.Element => {
    const [selectedResourcesDirectory, setSelectedResourcesDirectory] =
        useState<string>("");
    const [selectedSelections, setSelectedSelections] = useState<string[]>([]);
    const [selectedTextMapPath, setSelectedTextMapPath] = useState<string>("");
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [outputPath, setOutputPath] = useState<string>("");
    const [filename, setFilename] = useState<string>("");
    const [outputLog, setOutputLog] = useState<Output[]>([]);
    const [isOutputVisible, setIsOutputVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const outputContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        if (outputContainerRef.current) {
            outputContainerRef.current.scrollTop =
                outputContainerRef.current.scrollHeight;
        }
    }, []);

    // biome-ignore lint/correctness/useExhaustiveDependencies: This effect only needs to run when outputLog or scrollToBottom change
    useEffect(() => {
        scrollToBottom();
    }, [outputLog, scrollToBottom]);

    useEffect(() => {
        const unlisten = listen("handbook", (event) => {
            const { payload } = event;
            setOutputLog((prev) => [...prev, payload as Output]);
        });
        return () => {
            unlisten.then((f) => f());
        };
    }, []);

    const languages = ["EN", "ID", "TH", "JP", "FR", "RU", "CHS", "CHT"];
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

    const generate = async () => {
        setLoading(true);
        setIsOutputVisible(true);

        const checkAndLogError = (condition: boolean, message: string) => {
            if (condition) {
                setOutputLog((prev) => [
                    ...prev,
                    { log_level: "error", message },
                ]);
                error(message);
                return true;
            }
            return false;
        };

        if (
            checkAndLogError(
                selectedResourcesDirectory.length === 0,
                "No resources directory selected"
            ) ||
            checkAndLogError(languages.length === 0, "No languages selected") ||
            checkAndLogError(
                selectedSelections.length === 0,
                "No selections selected"
            )
        ) {
            setLoading(false);
            return;
        }

        try {
            await invoke("generate_handbook", {
                args: {
                    excelPath: selectedResourcesDirectory,
                    textMapPath: selectedTextMapPath,
                    outputPath,
                    outputFileName: filename,
                },
                game: "genshin-impact",
                selections: selectedSelections,
                languages: selectedLanguages,
            });
        } catch (e) {
            setOutputLog((prev) => [
                ...prev,
                { log_level: "error", message: `Error: ${e}` },
            ]);
            error(`Error: ${e}`);
        } finally {
            setLoading(false);
        }
    };

    const selectResourcesDirectory = async () => {
        const result = await open({
            directory: true,
            title: "Select a directory to where Resources",
            multiple: false,
        });
        if (!result) {
            error("No directory selected");
            return;
        }
        setSelectedResourcesDirectory(result);
    };

    const selectTextMapPath = async () => {
        const result = await open({
            directory: true,
            multiple: false,
            title: "Select a text map folder",
        });
        if (!result) {
            error("No folder selected");
            return;
        }
        setSelectedTextMapPath(result);
    };

    const selectOutputPath = async () => {
        const result = await open({
            directory: true,
            multiple: false,
            title: "Select a directory to where the handbook will be generated",
        });
        if (!result) {
            error("No directory selected");
            return;
        }
        setOutputPath(result);
    };

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

            <div className="mt-6 max-w-4xl mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <Button
                    onClick={() => setIsOutputVisible(!isOutputVisible)}
                    className="w-full p-4 text-left bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 flex justify-between items-center transition-colors duration-200"
                    variant="ghost"
                >
                    <span className="text-lg font-semibold">Output</span>
                    <ChevronDownIcon
                        className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                            isOutputVisible ? "rotate-180" : ""
                        }`}
                    />
                </Button>
                <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                        maxHeight: isOutputVisible ? "20rem" : "0px",
                    }}
                >
                    <div
                        ref={outputContainerRef}
                        className="p-4 font-mono text-sm overflow-auto max-h-[20rem] bg-white dark:bg-gray-900"
                    >
                        {outputLog.length === 0 ? (
                            <div className="py-1">
                                <span className="text-gray-500 dark:text-gray-400">
                                    {"> No output"}
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="mb-3">
                                    <Button
                                        variant="outline"
                                        className="text-green-600 dark:text-green-400"
                                        onClick={() => setOutputLog([])}
                                    >
                                        Clear
                                    </Button>
                                </div>
                                {outputLog.map((line, index) => (
                                    <div
                                        key={`output-line-${index}-${line.message.slice(
                                            0,
                                            10
                                        )}`}
                                        className="py-1"
                                    >
                                        <span
                                            className={`${
                                                line.log_level === "info"
                                                    ? "text-green-600 dark:text-green-400"
                                                    : line.log_level === "warn"
                                                    ? "text-yellow-600 dark:text-yellow-400"
                                                    : "text-red-600 dark:text-red-400"
                                            }`}
                                        >
                                            {`> ${line.message}`}
                                        </span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
