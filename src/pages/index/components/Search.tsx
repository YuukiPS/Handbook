import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ToggleIcon } from '@/components/ui/toggle-icon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/components/ui/use-toast'
import { invoke, isTauri } from '@tauri-apps/api/core'
import { type OpenDialogOptions, open } from '@tauri-apps/plugin-dialog'
import { platform } from '@tauri-apps/plugin-os'
import debounce from 'lodash/debounce'
import { FolderIcon } from 'lucide-react'
import type React from 'react'
import { memo } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Trans, useTranslation } from 'react-i18next'
import { GiHamburgerMenu } from 'react-icons/gi'
import { IoMdClose, IoMdSearch } from 'react-icons/io'
import type { State } from './types'
import { Spinner } from '@/components/ui/spinner'
import { useCookies } from 'react-cookie'
import expiresInAMonth from './cookieExpires'
import { MultiSelect } from '@/components/ui/multi-select'

interface SearchProps {
	currentLanguage: string
	loadGI: () => Promise<void>
	loadSR: () => Promise<void>
	state: State
	setState: React.Dispatch<React.SetStateAction<State>>
	isHandbookLoading: boolean
}

interface StoragePermissionResponse {
	status: 'Granted' | 'Cancelled' | 'Denied'
}

interface SelectHandbookPathProps {
	pathHandbook: string
	forceUpdatePath: boolean
	setForceUpdatePath: React.Dispatch<React.SetStateAction<boolean>>
	selectHandbook: () => Promise<void>
}

const SelectHandbookPath = memo<SelectHandbookPathProps>(
	({ pathHandbook, forceUpdatePath, setForceUpdatePath, selectHandbook }) => (
		<div className='m-2 flex flex-col space-y-2'>
			<Label className='text-sm font-medium text-gray-700 dark:text-gray-300'>GM Handbook Path</Label>
			<div className='relative w-full'>
				<Input
					type='text'
					placeholder='Select path...'
					value={pathHandbook}
					className='w-full pl-3 pr-[6.4rem] py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-all duration-300 ease-in-out'
					readOnly
				/>
				<div className='absolute inset-y-0 right-0 flex items-center'>
					<div className='flex items-center mr-1'>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className='flex items-center'>
										<Checkbox
											id='force-update'
											checked={forceUpdatePath}
											onCheckedChange={() => setForceUpdatePath(!forceUpdatePath)}
										/>
										<label htmlFor='force-update' className='text-xs ml-1'>
											Force
										</label>
									</div>
								</TooltipTrigger>
								<TooltipContent>Force update the handbook path even if it's the same</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant='ghost'
									className='h-full px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg transition-colors duration-300'
									onClick={selectHandbook}
								>
									<FolderIcon className='h-5 w-5 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-300' />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Select handbook path</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>
		</div>
	)
)

const Search: React.FC<SearchProps> = ({ loadGI, loadSR, currentLanguage, state, setState, isHandbookLoading }) => {
	const { t } = useTranslation('translation', { keyPrefix: 'search' })
	const { toast } = useToast()
	const [sliderValue, setSliderValue] = useState<number[]>([state.limitsResult || 30])
	const [pathHandbook, setPathHandbook] = useLocalStorage<string>('handbookPath', '')
	const [forceUpdatePath, setForceUpdatePath] = useState<boolean>(false)

	const [isOpen, setIsOpen] = useState(false)

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setState((prevState) => ({
			...prevState,
			searchTerm: e.target.value.split(',').map((e) => e.trim()),
		}))
	}

	const handleSearch = useCallback(
		(e: string) => {
			setState((prevState) => ({
				...prevState,
				searchTerm: e.split(',').map((e) => e.trim()),
				searchInputValue: e,
				error: false,
			}))
		},
		[setState]
	)

	const handleSearchTrigger = useCallback(() => {
		if (state.searchTerm.length === 0 || isHandbookLoading) return
		setState((prevState) => ({
			...prevState,
			loading: true,
		}))
		handleSearch(state.searchTerm.join(','))
		state.currentType === 'Genshin Impact' ? loadGI() : loadSR()
	}, [state.searchTerm, state.currentType, handleSearch, loadGI, loadSR, setState, isHandbookLoading])

	const debouncedSetSliderValue = useCallback(
		debounce((value: number[]) => {
			setState((prevState) => ({
				...prevState,
				limitsResult: value[0],
			}))
		}, 1000),
		[]
	)

	const [, setCookie] = useCookies(['language', 'type'])

	const setCurrentLanguage = useCallback(
		(value: string) => {
			setCookie('language', value, {
				expires: expiresInAMonth(),
			})
		},
		[setCookie]
	)

	useEffect(() => {
		debouncedSetSliderValue(sliderValue)
	}, [sliderValue, debouncedSetSliderValue])

	const toggleMenu = useCallback(() => {
		setIsOpen((prevIsOpen) => !prevIsOpen)
	}, [])
	useEffect(() => {
		const getPath = async () => {
			if (isTauri()) {
				try {
					const getPath = await invoke<string>('get_path_handbook')
					await invoke<string>('update_path_handbook', {
						path: getPath,
						force: true,
					})
					setPathHandbook(getPath)
				} catch (error) {
					toast({
						title: 'Error',
						description: `Error while getting path: ${error}`,
						variant: 'destructive',
					})
				}
			}
		}
		getPath()
	}, [setPathHandbook, toast])

	const selectHandbook = useCallback(async () => {
		if (!isTauri()) {
			toast({
				title: 'Error',
				description:
					'This feature is only available on desktop and mobile applications. It is not supported in web browsers.',
				variant: 'destructive',
			})
			return
		}
		const currentPlatform = platform()
		if (currentPlatform === 'android') {
			try {
				const checkPermissions = await invoke<StoragePermissionResponse>(
					'plugin:handbook-finder|checkPermissions'
				)
				if (checkPermissions.status === 'Denied') {
					const result = await invoke<StoragePermissionResponse>(
						'plugin:handbook-finder|requestStoragePermission'
					)
					if (result.status === 'Cancelled') {
						// Re-check permissions may return 'Cancelled' even when granted
						const recheck = await invoke<StoragePermissionResponse>(
							'plugin:handbook-finder|checkPermissions'
						)
						if (recheck.status === 'Denied') {
							toast({
								title: 'Storage permission denied',
								description: 'Storage permission is required to read the handbook file',
							})
							return
						}
					}
				}
			} catch (e) {
				toast({
					title: 'Error',
					description: `Error requesting storage permission: ${JSON.stringify(e)}`,
					variant: 'destructive',
				})
				return
			}
		}

		const options = (): OpenDialogOptions => {
			const currentPlatform = platform()
			return {
				directory: false,
				title: 'Select GM Handbook path',
				filters:
					currentPlatform === 'windows' ? [{ name: 'GM Handbook', extensions: ['json', 'txt'] }] : undefined,
			}
		}

		const path = await open(options())
		if (!path) {
			toast({
				title: 'No path selected',
				description: 'Please select a path',
				variant: 'destructive',
			})
			return
		}

		try {
			setState((prevState) => ({
				...prevState,
				isHandbookLoading: true,
			}))
			toast({
				title: 'Updating path',
				description: `Path: ${path.path}`,
			})
			await invoke('update_path_handbook', {
				path: path.path,
				force: forceUpdatePath,
			})
			const newPath = await invoke<string>('get_path_handbook')
			setPathHandbook(newPath)
			const listCategory = await invoke<string[]>('get_category')
			setState((prev) => ({
				...prev,
				listCategory: listCategory.map((item) => ({
					label: item,
					value: item,
				})),
			}))
			toast({
				title: 'Path updated',
				description: 'Path updated successfully',
			})
			setPathHandbook(newPath)
		} catch (error) {
			toast({
				title: 'Error',
				description: `Error while selecting path: ${error}`,
				variant: 'destructive',
			})
		} finally {
			setState((prevState) => ({
				...prevState,
				isHandbookLoading: false,
			}))
		}
	}, [forceUpdatePath, toast, setState, setPathHandbook])

	const handleTypeChange = useCallback(
		(e: string) => {
			const newType = e as 'Genshin Impact' | 'Star Rail'
			setState((prevState) => ({
				...prevState,
				currentType: newType,
				selectedCategory: [],
				searchTerm: [],
			}))
			setCookie('type', newType, {
				path: '/',
				expires: expiresInAMonth(),
			})
			handleSearch('')
		},
		[handleSearch, setState, setCookie]
	)

	const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			if (state.searchTerm.length === 0) {
				return
			}
			handleSearch(state.searchTerm.join(', '))
			state.currentType === 'Genshin Impact' ? loadGI() : loadSR()
		} else if (e.key === 'Escape') {
			handleSearch('')
			setState((prevState) => ({
				...prevState,
				searchTerm: [],
			}))
		}
	}

	const setShowCommandsMapping = useMemo(
		() => ({
			'Genshin Impact': () =>
				setState((prevState) => ({
					...prevState,
					showCommands: !prevState.showCommands,
				})),
			'Star Rail': () =>
				setState((prevState) => ({
					...prevState,
					showCommandsSR: !prevState.showCommandsSR,
				})),
		}),
		[setState]
	)

	return (
		<div className='mt-5 flex justify-center'>
			<div
				className={
					'relative flex w-full flex-col items-center justify-between rounded-lg border border-gray-600 shadow-lg md:w-3/4 lg:w-3/5'
				}
			>
				<h2 className='select-none text-gray-600 dark:text-gray-400 mt-2 font-bold'>{state.currentType}</h2>
				<div className='form-control w-full items-center justify-between px-4'>
					<Label className='my-2 flex justify-center'>
						<span className='label-text select-none'>
							<Trans i18nKey={'kbd.enter'} t={t} components={[<Kbd key={'search-kbd-enter'} />]} />
						</span>
						<span className='label-text ml-3 select-none'>
							<Trans i18nKey={'kbd.escape'} t={t} components={[<Kbd key={'search-kbd-escape'} />]} />
						</span>
					</Label>
					<div className='flex w-full items-center'>
						<Input
							type='text'
							placeholder={t('input_placeholder')}
							className='w-full rounded-l-lg rounded-r-none border-2 border-gray-500 bg-transparent px-4 py-2 outline-none'
							value={state.searchTerm}
							onChange={handleInputChange}
							onKeyDown={handleSearchInputKeyDown}
							disabled={isHandbookLoading}
						/>
						<Button
							onClick={handleSearchTrigger}
							disabled={isHandbookLoading}
							className='rounded-lg rounded-l-none bg-slate-300 p-2 dark:bg-slate-700'
						>
							{isHandbookLoading ? <Spinner size='sm' /> : <Icon icon={IoMdSearch} size={24} />}
						</Button>
					</div>
					<div className='mt-2 flex justify-center'>
						<TooltipProvider delayDuration={500}>
							<Tooltip>
								<TooltipTrigger asChild>
									<ToggleIcon
										originalIcon={GiHamburgerMenu}
										toggledIcon={IoMdClose}
										onClick={toggleMenu}
										className='rounded-lg bg-gray-300 p-3 dark:bg-gray-800'
									/>
								</TooltipTrigger>
								<TooltipContent>
									{isOpen ? t('tooltip_menu.close') : t('tooltip_menu.open')}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>
				<div
					className={`flex w-full flex-col overflow-hidden duration-300 py-2 ${
						isOpen ? 'max-h-[400px]' : 'max-h-0'
					}`}
				>
					<Label className='flex justify-center mt-3'>{t('label.api_settings')}</Label>
					{isTauri() && (
						<SelectHandbookPath
							forceUpdatePath={forceUpdatePath}
							pathHandbook={pathHandbook}
							selectHandbook={selectHandbook}
							setForceUpdatePath={setForceUpdatePath}
						/>
					)}

					<div className='m-2 space-y-1'>
						<Select
							value={state.currentType}
							onValueChange={(e) => handleTypeChange(e)}
							disabled={isHandbookLoading}
						>
							<SelectTrigger>
								<SelectValue placeholder='Select a games' />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>{t('label.games')}</SelectLabel>
									<SelectItem value='Genshin Impact'>Genshin Impact</SelectItem>
									<SelectItem value='Star Rail'>Honkai: Star Rail</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
						<MultiSelect
							options={state.listCategory}
							onValueChange={(e) => {
								setState((prevState) => ({
									...prevState,
									selectedCategory: e,
								}))
							}}
							defaultValue={[]}
						/>
						{/* <Select
							value={state.selectedCategory}
							onValueChange={(e) =>
								setState((prevState) => ({
									...prevState,
									selectedCategory: e,
								}))
							}
							defaultValue='Select a category'
							disabled={isHandbookLoading}
						>
							<SelectTrigger>
								<SelectValue placeholder='Select a category' />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>{t('label.category')}</SelectLabel>
									<SelectItem value='category' defaultChecked>
										{t('label.category_all')}
									</SelectItem>
									{state.listCategory.map((category) => (
										<SelectItem key={`${category.replace(/ /, '')}`} value={category}>
											{category}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select> */}
						<Select
							value={currentLanguage}
							onValueChange={(e) => {
								setCurrentLanguage(e)
							}}
							disabled={isHandbookLoading}
						>
							<SelectTrigger>
								<SelectValue placeholder='Select Language' />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>{t('label.language')}</SelectLabel>
									<SelectItem value='EN'>English</SelectItem>
									<SelectItem value='ID'>Indonesian</SelectItem>
									<SelectItem value='JP'>Japanese</SelectItem>
									<SelectItem value='CHS'>Simplified Chinese (Mainland China)</SelectItem>
									<SelectItem value='CHT'>Traditional Chinese (Hong Kong)</SelectItem>
									<SelectItem value='TH'>Thai</SelectItem>
									<SelectItem value='RU'>Russian</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div className='mx-12 max-sm:mx-6'>
						<div className='mb-2 flex items-center'>
							<label htmlFor='results-input' className='mr-2 select-none'>
								{t('label.results')}
							</label>
							<Input
								id='results-input'
								type='number'
								value={sliderValue[0]}
								onChange={(e) => {
									const value = Number.parseInt(e.target.value, 10)
									setSliderValue([Math.min(Math.max(value, 1), 500)])
								}}
								className='w-16'
								min={1}
								max={500}
							/>
						</div>
						<Slider
							defaultValue={[30]}
							min={1}
							max={500}
							step={1}
							value={sliderValue}
							onValueChange={setSliderValue}
							aria-label='Number of results'
						/>
					</div>
					<div className='flex items-center justify-center'>
						<div className='flex items-center justify-center p-4'>
							<Label
								htmlFor='show-image'
								className='label-text mr-1 select-none opacity-80 hover:cursor-pointer'
							>
								{t('checkbox.image')}
							</Label>
							<Checkbox
								id='show-image'
								checked={state.showImage}
								onClick={() => {
									setState((prevState) => ({
										...prevState,
										showImage: !prevState.showImage,
									}))
								}}
							/>
						</div>
						<div className='flex items-center justify-center'>
							<Label
								htmlFor='show-commands'
								className='label-text mr-1 select-none opacity-80 hover:cursor-pointer'
							>
								{t('checkbox.commands')}
							</Label>
							<Checkbox
								id='show-commands'
								checked={
									state.currentType === 'Genshin Impact' ? state.showCommands : state.showCommandsSR
								}
								onClick={() => setShowCommandsMapping[state.currentType]()}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Search
