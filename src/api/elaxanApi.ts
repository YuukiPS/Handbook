import axios from 'axios'
import type { GmhandbookGI } from '@/types/gm'
import type { Hsr } from '@/types/hsr'
import type { Category } from '@/types/category'

interface HandbookGi {
	search: string
	limit: number
	category?: string
	language?: string
	command?: boolean
	image?: boolean
}

interface HandbookSr {
	search: string
	limit: number
	category?: string
	language?: string
}

const baseUrl = 'https://api.elaxan.com'

const endpoints = {
	gi: '/v3/gm',
	sr: '/v1/sr',
	category: '/v2/category',
}

const instance = axios.create({
	timeout: 10_000,
	baseURL: baseUrl,
})

function getHandbook(type: 'gi', data: HandbookGi): Promise<GmhandbookGI>
function getHandbook(type: 'sr', data: HandbookSr): Promise<Hsr>
async function getHandbook(type: 'gi' | 'sr', data: HandbookGi | HandbookSr): Promise<GmhandbookGI | Hsr> {
	const endpoint = endpoints[type]
	const payload = type === 'sr' ? { type: 1, ...data } : data

	const res = await instance.post<GmhandbookGI | Hsr>(endpoint, payload)
	return res.data
}

async function getCategoryList(type: 'gi' | 'sr'): Promise<Category> {
	const res = await instance
		.get(endpoints.category, {
			params: {
				type,
			},
		})
	return res.data
}

export default { getHandbook, getCategoryList }
