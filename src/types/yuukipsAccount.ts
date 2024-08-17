export interface YuukiPSAccount {
	data: AccountData
	message: string
	retcode: number
}

export interface AccountData {
	account: Account
	player: PlayerElement[]
}

export interface Account {
	name: string
	uid: string
	locale: string
	code: string
}

export interface PlayerElement {
	player: PlayerPlayer
	server: Server
}

export interface PlayerPlayer {
	message: Message
	retcode: number
	data?: PlayerData
}

export interface PlayerData {
	uid: number
	accountId: string
	nickname: string
	signature: string
}

export enum Message {
	APIDBPlayerFound = 'api_db_player_found',
	APIDBPlayerNofound = 'api_db_player_nofound',
	APIDBPlayerProcess = 'api_db_player_process',
}

export interface Server {
	id: string
	title: string
	api_game: number
	type_game: number
}
