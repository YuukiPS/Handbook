import { listen } from "@tauri-apps/api/event";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import Output, { useOutputVisibility } from "@/components/output";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import resourcesGI from "./resources/resources-gi.json";
import resourcesSR from "./resources/resources-sr.json";
import { useToast } from "@/components/ui/use-toast";
import getPlatformFolderSelector from "@/lib/getPlaformFolderSelector";
import { FolderIcon } from "lucide-react";
import { open } from "@tauri-apps/plugin-shell";

interface ResourcesMap {
    label: string;
    value: string;
}

interface CurrentDownload {
    name: string;
    position: number;
}

const Download: React.FC = (): JSX.Element => {
    const [downloadProgress, setDownloadProgress] = useState<number>(0);
    const [downloadSpeed, setDownloadSpeed] = useState<number>(0);
    const [selectedTextMapsGI, setSelectedTextMapsGI] = useState<string[]>([]);
    const [selectedTextMapsSR, setSelectedTextMapsSR] = useState<string[]>([]);
    const [outputLog, setOutputLog] = useState<Output[]>([]);
    const [textMapGI, setTextMapGI] = useState<ResourcesMap[]>([]);
    const [textMapSR, setTextMapSR] = useState<ResourcesMap[]>([]);
    const [excelFilesGI, setExcelFilesGI] = useState<ResourcesMap[]>([]);
    const [excelFilesSR, setExcelFilesSR] = useState<ResourcesMap[]>([]);
    const [selectedExcelFilesGI, setSelectedExcelFilesGI] = useState<string[]>(
        []
    );
    const [selectedExcelFilesSR, setSelectedExcelFilesSR] = useState<string[]>(
        []
    );
    const [currentDownload, setCurrentDownload] = useState<CurrentDownload>({
        name: "",
        position: 0,
    });
    const { isOutputVisible, setIsOutputVisible } = useOutputVisibility();
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [outputPath, setOutputPath] = useState<string>("");
    const { toast } = useToast();

    const handleSelectOutputPath = async () => {
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

        const folder = await folderSelector("Select Output Path").then(
            (res) => {
                if (typeof res === "string") {
                    return res;
                }
                if (res?.displayName) {
                    return res.displayName;
                }
                return null;
            }
        );

        if (!folder) {
            toast({
                title: "Folder not selected",
                description: "Please select a folder to download the resources",
                variant: "destructive",
            });
            return;
        }

        setOutputPath(folder);
    };

    useEffect(() => {
        const setupListeners = async () => {
            const unlistenProgress = await listen<[number, number]>(
                "download-progress-resources",
                ({ payload: [progress, speed] }) => {
                    setDownloadProgress(progress);
                    setDownloadSpeed(speed);
                }
            );

            const unlistenOutput = await listen<Output>(
                "download-output",
                ({ payload }) => {
                    setOutputLog((prev) => [...prev, payload]);
                }
            );

            return () => {
                unlistenProgress();
                unlistenOutput();
            };
        };

        const loadResources = async () => {
            setTextMapGI(resourcesGI.textmap);
            setExcelFilesGI(resourcesGI.excel);
            setTextMapSR(resourcesSR.textmap);
            setExcelFilesSR(resourcesSR.excel);
        };

        const cleanup = setupListeners();
        if (isTauri()) loadResources();

        return () => {
            cleanup.then((unlistenFunction) => {
                unlistenFunction();
            });
        };
    }, []);

    const handleDownload = async () => {
        if (isDownloading) return;

        setIsDownloading(true);
        setOutputLog([]);
        setIsOutputVisible(true);

        try {
            const downloadFiles = async (
                files: string[],
                baseUrl: string,
                outputDir: string,
                typeGame: "Star Rail" | "Genshin Impact"
            ) => {
                for (const [index, file] of files.entries()) {
                    setCurrentDownload({
                        name: `${file} (${typeGame})`,
                        position: index + 1,
                    });
                    await invoke("download_resources", {
                        url: `${baseUrl}${file}`,
                        output: outputDir,
                        fileName: file,
                    });
                }
            };

            await downloadFiles(
                selectedExcelFilesGI,
                "https://gitlab.com/Dimbreath/AnimeGameData/-/raw/master/ExcelBinOutput/",
                `${outputPath}/Genshin/Excel`,
                "Genshin Impact"
            );
            await downloadFiles(
                selectedTextMapsGI,
                "https://gitlab.com/Dimbreath/AnimeGameData/-/raw/master/TextMap/",
                `${outputPath}/Genshin/TextMap`,
                "Genshin Impact"
            );
            await downloadFiles(
                selectedExcelFilesSR,
                "https://raw.githubusercontent.com/Dimbreath/StarRailData/master/ExcelOutput/",
                `${outputPath}/StarRail/Excel`,
                "Star Rail"
            );
            await downloadFiles(
                selectedTextMapsSR,
                "https://raw.githubusercontent.com/Dimbreath/StarRailData/master/TextMap/",
                `${outputPath}/StarRail/TextMap`,
                "Star Rail"
            );
        } catch (error) {
            console.error("Download failed:", error);
            setOutputLog((prev) => [
                ...prev,
                { log_level: "error", message: `Error: ${error}` },
            ]);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-8">
            <h1 className="text-2xl md:text-3xl font-bold text-center">
                Resource Download
            </h1>
            <div className="bg-card text-card-foreground rounded-lg shadow-md p-4 md:p-6 space-y-4 max-w-3xl mx-auto">
                <div className="space-y-6">
                    <div className="md:flex md:space-x-4 space-y-6 md:space-y-0">
                        <div className="md:w-1/2">
                            <h3 className="text-lg font-semibold mb-2">
                                Genshin Impact
                            </h3>
                            <div className="space-y-2">
                                <Label htmlFor="textmap-select-gi">
                                    Select TextMaps
                                </Label>
                                <MultiSelect
                                    id="textmap-select-gi"
                                    options={textMapGI}
                                    value={selectedTextMapsGI}
                                    onValueChange={setSelectedTextMapsGI}
                                    placeholder="Select TextMaps"
                                    defaultValue={[]}
                                />
                            </div>
                            <div className="space-y-2 mt-2">
                                <Label htmlFor="excel-select-gi">
                                    Select Excel Files
                                </Label>
                                <MultiSelect
                                    id="excel-select-gi"
                                    options={excelFilesGI}
                                    value={selectedExcelFilesGI}
                                    onValueChange={setSelectedExcelFilesGI}
                                    placeholder="Select Excel Files"
                                    defaultValue={[]}
                                />
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <h3 className="text-lg font-semibold mb-2">
                                Star Rail
                            </h3>
                            <div className="space-y-2">
                                <Label htmlFor="textmap-select-sr">
                                    Select TextMaps
                                </Label>
                                <MultiSelect
                                    id="textmap-select-sr"
                                    options={textMapSR}
                                    value={selectedTextMapsSR}
                                    onValueChange={setSelectedTextMapsSR}
                                    placeholder="Select TextMaps"
                                    defaultValue={[]}
                                />
                            </div>
                            <div className="space-y-2 mt-2">
                                <Label htmlFor="excel-select-sr">
                                    Select Excel Files
                                </Label>
                                <MultiSelect
                                    id="excel-select-sr"
                                    options={excelFilesSR}
                                    value={selectedExcelFilesSR}
                                    onValueChange={setSelectedExcelFilesSR}
                                    placeholder="Select Excel Files"
                                    defaultValue={[]}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex justify-center">
                        <div className="w-full">
                            <Label className="mb-2 block">Output Path</Label>
                            <Button
                                onClick={handleSelectOutputPath}
                                variant="outline"
                                className="w-full justify-start"
                            >
                                <FolderIcon className="mr-2 h-4 w-4" />
                                <span className="truncate">
                                    {outputPath || "Select Output Path"}
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
                <Button
                    onClick={handleDownload}
                    className="w-full"
                    disabled={selectedTextMapsGI.length === 0 || isDownloading}
                    loading={isDownloading}
                    loadingMessage={`Downloading ${currentDownload.name} (${currentDownload.position} / ${selectedTextMapsGI.length})`}
                >
                    Download Resources
                </Button>
                {downloadProgress > 0 && (
                    <DownloadProgress
                        progress={downloadProgress}
                        speed={downloadSpeed}
                    />
                )}
            </div>
            <Output
                outputLog={outputLog}
                setOutputLog={setOutputLog}
                isOutputVisible={isOutputVisible}
                setIsOutputVisible={setIsOutputVisible}
            />
            <div className="text-center text-sm text-muted-foreground">
                <p>Data provided by:</p>
                <Button
                    variant={"link"}
                    className="hover:underline"
                    onClick={() => {
                        open("https://gitlab.com/Dimbreath/AnimeGameData");
                    }}
                >
                    Genshin Impact Data Repository
                </Button>
                <span>|</span>
                <Button
                    variant={"link"}
                    className="hover:underline"
                    onClick={() => {
                        open("https://github.com/Dimbreath/StarRailData");
                    }}
                >
                    Star Rail Data Repository
                </Button>
            </div>
        </div>
    );
};

const DownloadProgress: React.FC<{ progress: number; speed: number }> = ({
    progress,
    speed,
}) => (
    <div className="space-y-2">
        <Progress value={progress} />
        <div className="flex justify-between text-sm text-muted-foreground">
            <span>{progress}% Complete</span>
            <span>{speed.toFixed(2)} MB/s</span>
        </div>
    </div>
);

export default Download;
