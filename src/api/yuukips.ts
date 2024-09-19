import { Message, type PlayerElement, type YuukiPSAccount } from '@/types/yuukipsAccount'
import type { Response as ResponseCommand, ResponseWithTicket, Ticket, TicketNotFound } from '@/types/yuukipsCommand'
import axios, { type AxiosError } from 'axios'
import io, { type Socket } from 'socket.io-client'

export interface AccountInfo {
	id: number
	nickname: string
	serverId: string
	serverName: string
}

const timeoutInSeconds = 30

const removeLeadingSymbol = (input: string): string => {
	const symbolRegex = /^[^A-Za-z0-9]+/
	const match = input.match(symbolRegex)

	if (match && match.index === 0) {
		return input.slice(match[0].length)
	}

	return input
}

const generateErrorMessage = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// biome-ignore lint/suspicious/noExplicitAny: We need to use 'any' here to handle various error types
	error: any,
	isAxiosError: boolean
): { message: string; retcode: number } => {
	if (isAxiosError) {
		const { response } = error as AxiosError
		const errorMessage = response
			? `There was an error while sending a request command to <https://ps.yuuki.me/command> ${response.statusText}`
			: `There was an Axios error: ${error.message}`
		return { message: errorMessage, retcode: response?.status || 502 }
	}

	return { message: `There was an error\n${error}`, retcode: 500 }
}

export default class YuukiPS {
	public static baseUrl = 'https://ps.yuuki.me/'

	public static apiAccountEndpoint = '/api/v2/account'

	public static apiCommandEndpoint = '/api/v2/server/:server/command'

	public static apiQueueEndpoint = '/api/v2/command/queue'

	private socket: Socket | null = null

	/**
	 * Create a new instance of YuukiPS.
	 *
	 * @param {string} [baseUrl] - The base URL of the server to connect to.
	 * @example
	 * // Get response command from YuukiPS
	 * const yuukiPS = new YuukiPS();
	 * yuukiPS.getResponseCommand((response) => {
	 *     console.log(response);
	 * });
	 * // With custom base URL
	 * const yuukiPS = new YuukiPS('https://example.yuuki.me/');
	 * yuukiPS.getResponseCommand((response) => {
	 *     console.log(response);
	 * });
	 * @example
	 * // Send a command to YuukiPS
	 * const yuukiPS = new YuukiPS();
	 * yuukiPS.sendCommand('uid', 'code', 'server', 'command');
	 * // With custom base URL
	 * const yuukiPS = new YuukiPS('https://example.yuuki.me/');
	 * yuukiPS.sendCommand('uid', 'code', 'server', 'command');
	 */
	constructor(baseUrl?: string) {
		if (!this.socket) {
			this.socket = io(baseUrl || YuukiPS.baseUrl, {
				transports: ['websocket'],
				query: {
					url: `${YuukiPS.baseUrl}/command`,
				},
			})
		}
	}

	/**
	 * Get the current socket connection.
	 *
	 * @returns {Socket | null} The current socket connection, or null if not connected.
	 */
	public getSocket(): Socket | null {
		return this.socket
	}

	// public static apiUrlCommand = '/api/v2/server/:server/command';

	private static instance = axios.create({
		baseURL: YuukiPS.baseUrl,
		timeout: timeoutInSeconds * 1000,
	})

	/**
	 * Apply command to YuukiPS API
	 *
	 * @param {string} uid - UID of the player
	 * @param {string | number} code - Code of the player
	 * @param {string} server - Server of the player
	 * @param {string} command - Command to apply
	 * @deprecated Use constructor to create a new instance of YuukiPS and use sendCommand instead
	 * @returns {Promise<ResponseCommand>} Result of the command
	 */
	public static async applyCommand(
		uid: string,
		code: string | number,
		server: string,
		command: string
	): Promise<ResponseWithTicket | { message: string; retcode: number }> {
		if (!uid || !code || !server || !command) {
			return { message: 'Invalid input parameters', retcode: 400 }
		}

		const sanitizedCommand = removeLeadingSymbol(command)
		const apiUrl = YuukiPS.apiCommandEndpoint.replace(':server', server)
		const params = { uid, code, cmd: sanitizedCommand }

		try {
			const response = await YuukiPS.instance.get<ResponseWithTicket>(apiUrl, {
				params,
				timeout: timeoutInSeconds * 1000,
			})
			return (
				response.data || {
					message: "Can't Access the server",
					retcode: 404,
				}
			)
		} catch (error) {
			return generateErrorMessage(error, axios.isAxiosError(error))
		}
	}

	/**
	 * Check account information
	 *
	 * @param {string} uid - UID of the player
	 * @param {string | number} code - Code of the player
	 * @returns {Promise<PlayerElement[]>} Array of player data
	 */
	public static async checkAccount(uid: string, code: string): Promise<PlayerElement[]> {
		const response = await YuukiPS.instance
			.post<YuukiPSAccount>(YuukiPS.apiAccountEndpoint, {
				uid,
				code,
			})
			.then((res) => res.data)

		if (!response.data) {
			throw new Error(`Failed to get account information [${response.message}]`)
		}

		const data = response.data.player.filter((player) => player.player.message === Message.APIDBPlayerFound)

		return data
	}

	/**
	 * Retrieves queue information for a specific ID.
	 *
	 * @param {number} id - The ID of the queue to retrieve information for.
	 * @return {Ticket | TicketNotFound} The retrieved queue information or a message indicating the queue was not found.
	 * @deprecated Use constructor to create a new instance of YuukiPS to check queue
	 */
	public static async checkQueue(id: number): Promise<Ticket | TicketNotFound> {
		const response = await YuukiPS.instance.get<Ticket | TicketNotFound>(YuukiPS.apiQueueEndpoint, {
			params: {
				id,
			},
		})

		return response.data
	}

	/**
	 * Get account information for a specific game UID.
	 *
	 * @param {string} uid - UID of the player.
	 * @param {string} code - Code of the player.
	 * @param {string} gameUid - Game UID of the player.
	 * @returns {Promise<AccountInfo[] | { message: string; retcode: number }>}
	 *          A promise that resolves to an array of account information or an error message with a retcode.
	 */
	public static async getAccount(
		uid: string,
		code: string,
		gameUid: string
	): Promise<AccountInfo[] | { message: string; retcode: number }> {
		if (!uid || !code || !gameUid) {
			return { message: 'Invalid input parameters', retcode: 400 }
		}

		try {
			const accountData = await YuukiPS.checkAccount(uid, code)
			return accountData
				.filter((player) => player.player.data !== undefined && player.player.data !== null)
				.map((player) => ({
					id: player.player.data?.uid ?? 0,
					nickname: player.player.data?.nickname ?? '',
					serverId: player.server.id,
					serverName: player.server.title,
				}))
		} catch (error) {
			return generateErrorMessage(error, axios.isAxiosError(error))
		}
	}

	/**
	 * Get response command from YuukiPS
	 * @param {(...args: (ResponseCommand | ResponseWithTicket)[]) => void} listener - Listener function
	 * @returns {void}
	 */
	public getResponseCommand(listener: (...args: (ResponseCommand | ResponseWithTicket)[]) => void): void {
		if (!this.socket) {
			throw new Error('Socket is not connected')
		}
		this.socket.on('cmdRsp', listener)
	}

	/**
	 * Send a command to YuukiPS
	 * @param {string} uid - UID of the player
	 * @param {string} code - Code of the player
	 * @param {string} server - Server of the player
	 * @param {string} command - Command to apply
	 * @returns {void}
	 */
	public sendCommand(uid: string, code: string, server: string, command: string): void {
		if (!this.socket) {
			throw new Error('Socket is not connected')
		}
		const input = removeLeadingSymbol(command)
		const params = {
			input,
			id_player: uid,
			id_server: server,
			code,
		}
		this.socket.emit('cmdReq', params)
	}

	/**
	 * Extract formatted placeholders
	 * @param {string} command - Command to apply
	 * @returns {string[]} Array of formatted placeholders
	 */
	public static extractFormattedPlaceholders(command: string): string[] {
		const placeholders = command.match(/<[^>]+>/g) || []
		return placeholders.map((ph) => {
			const rawPlaceholder = ph.slice(1, -1)
			return rawPlaceholder.replace(/([A-Z])/g, ' $1').trim()
		})
	}

	/**
	 * Generate result command
	 * @param {string} command - Command to apply
	 * @param {object} replacements - Values to replace
	 * @returns {string} Result of the command
	 */
	public static generateResultCommand(command: string, replacements: { [key: string]: string }): string {
		return (command.match(/<[^>]+>/g) || [])
			.reduce((result, placeholder) => {
				const key = placeholder.slice(1, -1).replace(/ /g, '')
				const value = replacements[key] ?? ''
				return result.replace(new RegExp(`[a-zA-Z]*${placeholder}`, 'g'), value)
			}, command)
			.trim()
	}
}
