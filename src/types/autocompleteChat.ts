export interface Autocomplete {
	title: string
	data: List[]
}

export interface List {
	command: string
	type: ('gc' | 'gio' | 'lc')[]
	description: string
}
