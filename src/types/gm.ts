// export type CommandCategory =
//     | 'Avatars'
//     | 'Artifacts'
//     | 'Monsters'
//     | 'Materials'
//     | 'Achievements'
//     | 'Quests'
//     | 'Scenes'
//     | 'Dungeons'
//     | 'Weapons';

export interface GmhandbookGI {
	id: number
	name: Description | string
	description?: Description
	image?: string
	category: Category
	rarity?: number
	commands: Commands
	icon?: string
	type?: Type
}

export enum Category {
	Artifacts = 'Artifacts',
	Characters = 'Characters',
	Dungeons = 'Dungeons',
	Materials = 'Materials',
	Monsters = 'Monsters',
	Quests = 'Quests',
	Scenes = 'Scenes',
	Weapons = 'Weapons',
}

export interface Commands {
	gc: GcCommand
	gio: GioCommand
}

export interface GcCommand {
	command_1: Command
	command_2?: Command
	command_3?: Command
	command_4?: Command
	command_5?: Command
}

export interface GioCommand {
	command_1: Command
	command_2?: Command
	command_3?: Command
}

export interface Command {
	name: NameEnum
	command: string
}

export enum NameEnum {
	AddQuest = 'Add Quest',
	Normal = 'Normal',
	RemoveQuest = 'Remove Quest',
	StartQuest = 'Start Quest',
	WithAmount = 'With Amount',
	WithConstellation = 'With Constellation',
	WithCustomHP = 'With Custom HP',
	WithCustomHPLevelAndAmount = 'With Custom HP, Level, and Amount',
	WithCustomLevel = 'With Custom Level',
	WithLevel = 'With Level',
	WithLevelConstellationAndSkillLevel = 'With Level, Constellation, and Skill Level',
	WithLevelRefinementAndAmount = 'With Level, Refinement, and Amount',
	WithRefinement = 'With Refinement',
	WithSkillLevel = 'With Skill Level',
	NotAvailable = 'Not Available',
	AcceptQuest = 'Accept Quest',
	FinishQuest = 'Finish Quest',
}

export interface Description {
	TH: string
	JP: string
	CHS: string
	EN: string
	FR: string
	RU: string
	ID: string
	CHT: string
}

export enum Type {
	SceneDungeon = 'SCENE_DUNGEON',
	SceneHomeRoom = 'SCENE_HOME_ROOM',
	SceneHomeWorld = 'SCENE_HOME_WORLD',
	SceneRoom = 'SCENE_ROOM',
	SceneWorld = 'SCENE_WORLD',
}
