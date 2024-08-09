import type { PlayerElement } from '@/types/yuukipsAccount'
import type { Server } from '@/types/yuukipsServer'

export interface Output {
	text: string
	color: 'green' | 'red'
}

export interface State {
	output: Output[]
	successCheckPlayer: boolean
	listServer: PlayerElement[]
	listServerAvailable: Server | undefined
	uid: string
	uidAccount: string
	code: string
	loading: boolean
	isFailedCheckAccount: boolean
}
