import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PlayerElement } from "@/types/yuukipsAccount";
import type React from "react";
import { memo } from "react";
import { useTranslation } from "react-i18next";

interface SelectAccountProps {
    listServer: PlayerElement[];
    handleSelectAccount: (value: string) => void;
}

const Trans = (key: string): string => {
    const { t } = useTranslation();
    return t(`select_account.${key}`);
};

const SelectAccount: React.FC<SelectAccountProps> = memo(
    ({ listServer, handleSelectAccount }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="mt-1">
                <Button variant={"outline"}>{Trans("button_trigger")}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel className="flex justify-center">
                    <p>{Trans("menu_label")}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup onValueChange={handleSelectAccount}>
                    {listServer.map((player) => (
                        <DropdownMenuRadioItem
                            value={`${player.server.title}|${player.server.id}|${player.player.data?.uid}`}
                            key={`list-server-${player.player.data?.uid}`}
                            className="cursor-pointer"
                        >
                            {player.server.title} |{" "}
                            {player.player.data?.nickname} |{" "}
                            {player.player.data?.uid}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
);

export default SelectAccount;
