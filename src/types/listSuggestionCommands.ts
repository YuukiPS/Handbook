export interface ListSuggestionCommands {
	name: string
	command: string
	description: string
	type: 'gc' | 'gio' | 'lc'
}
