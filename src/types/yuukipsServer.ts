export interface Server {
	data: Datum[]
	message: string
	retcode: number
	cache: number
}

export interface Datum {
	name: string
	id: string
	server: Server
	scen: number
}

export interface Server {
	online: boolean
	disable: boolean
	maintenance: string
	game: number
	version: string[]
	privacy: number
	engine: number
	monitor: Monitor
	connected: Connected
	cpu: CPU
	ram: RAM
	stats: Stats
	startup: number
	timezone: Timezone
	commit: string
}

export interface Connected {
	ip: string
	port: number
}

export interface CPU {
	usage: number
	core: Core
	usage_raw: number
}

export interface Core {
	limit: number
	total: number
}

export interface Monitor {
	name: string
	service: Service
	type: number
	focusUseDocker: boolean
	max: Max
}

export interface Max {
	autorestart: boolean
	ram: number
	cpu: number
}

export enum Service {
	Empty = '',
	Gameserver1 = 'gameserver1',
	Java = 'java',
}

export interface RAM {
	currently: number
	total: number
	usage: number
	limit: number
}

export interface Stats {
	player: number
	platform: { [key: string]: number }
	sub?: { [key: string]: number }
	extract: string
}

export enum Timezone {
	AsiaMakassar = 'Asia/Makassar',
	Empty = '',
}
