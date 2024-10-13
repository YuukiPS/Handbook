import type { Category } from "@/types/category";
import type { APIElaXan, GmhandbookGI } from "@/types/gm";
import type { Hsr } from "@/types/hsr";
import axios from "axios";

interface HandbookGi {
    search: string[];
    limit: number;
    category?: string[];
    language?: string;
    command?: boolean;
    image?: boolean;
}

interface HandbookSr {
    search: string[];
    limit: number;
    category?: string[];
    language?: string;
}

const endpoints = {
    gi: "/v4/gm",
    sr: "/v3/sr",
    category: "/v2/category",
};

function getHandbook(
    baseURL: string,
    type: "gi",
    data: HandbookGi
): Promise<GmhandbookGI[]>;
function getHandbook(
    baseURL: string,
    type: "sr",
    data: HandbookSr
): Promise<Hsr>;
async function getHandbook(
    baseURL: string,
    type: "gi" | "sr",
    data: HandbookGi | HandbookSr
): Promise<GmhandbookGI[] | Hsr> {
    const url = new URL(endpoints[type], baseURL);

    const res = await axios.post<APIElaXan | Hsr>(url.toString(), data);
    if (type === "gi") {
        return res.data.data as GmhandbookGI[];
    }
    return res.data as Hsr;
}

async function getCategoryList(
    baseURL: string,
    type: "gi" | "sr"
): Promise<Category> {
    const url = new URL(endpoints.category, baseURL);
    const res = await axios.get(url.toString(), {
        params: {
            type,
        },
    });
    return res.data;
}

export default { getHandbook, getCategoryList };
