export interface Response {
	message: string
	retcode: number
}

export interface ResponseWithTicket extends Response {
	ticket: string
}

export interface Ticket {
	ticket: string
	status: string
	data: TicketData
}

export interface TicketNotFound {
	message: string
	retcode: string
}

export interface TicketData {
	message: string
	retcode: number
}
