import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { isTauri } from "./utils";

const WebNotSupported: React.FC = (): JSX.Element => {
    return (
        <>
            {!isTauri && (
                <Dialog open={true}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Unsupported Platform</DialogTitle>
                            <DialogDescription>
                                This feature is currently only supported on
                                Windows and Android. The web browser version
                                you're using is not supported.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <a
                                href="https://github.com/YuukiPS/Handbook/releases"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Download for Windows/Android
                            </a>
                            <a
                                href="/"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
