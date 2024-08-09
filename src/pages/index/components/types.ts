import type { GmhandbookGI } from '@/types/gm'
import type { Datum } from '@/types/hsr'
import type YuukiPS from '@/api/yuukips'

export type CurrentType = 'Genshin Impact' | 'Star Rail'

export interface State {
	mainData: GmhandbookGI[]
	mainDataSR: Datum[]
	searchTerm: string
	searchInputValue: string
	loading: boolean
	error: boolean
	errorMessage: string
	listCategory: string[]
	currentType: CurrentType
	selectedCategory: string
	showImage: boolean
	showCommands: boolean
	showCommandsSR: boolean
	currentLimit: number
	yuukips: YuukiPS | null
	output: string[]
}
