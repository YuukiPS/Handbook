import type { Category } from '@/types/category'
import type { APIElaXan, GmhandbookGI } from '@/types/gm'
import type { Hsr } from '@/types/hsr'
import axios from 'axios'

interface HandbookGi {
	search: string[]
	limit: number
	category?: string[]
	language?: string
	command?: boolean
	image?: boolean
}

interface HandbookSr {
	search: string[]
	limit: number
	category?: string[]
	language?: string
}

const baseUrl = 'https://api.elaxan.xyz'

const endpoints = {
	gi: '/v4/gm',
	sr: '/v3/sr',
	category: '/v2/category',
}

const instance = axios.create({
	timeout: 10_000,
	baseURL: baseUrl,
})

function getHandbook(type: 'gi', data: HandbookGi): Promise<GmhandbookGI[]>
function getHandbook(type: 'sr', data: HandbookSr): Promise<Hsr>
async function getHandbook(type: 'gi' | 'sr', data: HandbookGi | HandbookSr): Promise<GmhandbookGI[] | Hsr> {
	const endpoint = endpoints[type]
	// const payload = type === "sr" ? { type: 1, ...data } : data;

	const res = await instance.post<APIElaXan | Hsr>(endpoint, data)
	if (type === 'gi') {
		return res.data.data as GmhandbookGI[]
	}
	return res.data as Hsr
}

async function getCategoryList(type: 'gi' | 'sr'): Promise<Category> {
	const res = await instance.get(endpoints.category, {
		params: {
			type,
		},
	})
	return res.data
}

export default { getHandbook, getCategoryList }
