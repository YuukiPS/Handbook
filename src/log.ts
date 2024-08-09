import { invoke } from '@tauri-apps/api/core'

export function error(message: string) {
	invoke('log_error', { message })
}

export function warn(message: string) {
	invoke('log_warn', { message })
}

export function info(message: string) {
	invoke('log_info', { message })
}
