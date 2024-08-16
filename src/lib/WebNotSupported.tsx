import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { isTauri } from "@tauri-apps/api/core";

const WebNotSupported: React.FC = (): JSX.Element => {
    return (
        <>
            {!isTauri() && (
                <Dialog open={true}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold">
                                Unsupported Platform
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-500">
                                This feature is currently only supported on
                                Windows and Android. The web browser version
                                you're using is not supported.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
                            <a
                                href="https://github.com/YuukiPS/Handbook/releases"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Download for Windows/Android
                            </a>
                            <a
                                href="/"
                                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Go to Home
                            </a>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default WebNotSupported;
