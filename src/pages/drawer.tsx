import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import type React from 'react'
import { useEffect, useState } from 'react'
import { memo } from 'react'
import Updater from './updater'

import '@/i18n'
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	DownloadIcon,
	GlobeIcon,
	HeartIcon,
	MenuIcon,
	MoonIcon,
	PickaxeIcon,
	SearchIcon,
	SunMoonIcon,
	UserIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface DrawerProps {
	children: React.ReactNode
}

const Drawer: React.FC<DrawerProps> = memo(({ children }) => {
	const { t } = useTranslation('default', {
		keyPrefix: 'drawer',
	})
	const { setTheme, theme } = useTheme()
	const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light')
	const [isSidebarOpen, setIsSidebarOpen] = useState(false)
	const [isDesktopSidebarMinimized, setIsDesktopSidebarMinimized] = useState(false)

	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

		const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light')
		mediaQuery.addEventListener('change', handler)

		return () => mediaQuery.removeEventListener('change', handler)
	}, [])

	const currentTheme = theme === 'system' ? systemTheme : theme

	const navItems = [
		{ href: '/', icon: SearchIcon, label: 'search_id' },
		{ href: '/settings', icon: UserIcon, label: 'player_settings' },
		{ href: '/generate', icon: PickaxeIcon, label: 'generate' },
		{ href: '/download', icon: DownloadIcon, label: 'download' },
		{ href: '/donation', icon: HeartIcon, label: 'donation' },
		{
			href: '#',
			icon: GlobeIcon,
			label: 'language',
			onClick: () => setIsDesktopSidebarMinimized(false),
			isLanguageSwitcher: true,
		},
	]

	return (
		<div className='flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300'>
			<div className='fixed top-0 left-0 right-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-b-muted bg-background px-4 sm:px-6'>
				<Button
					variant='ghost'
					size='icon'
					onClick={() => setIsSidebarOpen((prev) => !prev)}
					className='lg:hidden'
				>
					<MenuIcon className='h-6 w-6' />
					<span className='sr-only'>Toggle sidebar</span>
				</Button>
				<a href='/' className='flex items-center gap-2 font-bold'>
					<img src='/logo.png' alt='Handbook Finder' className='h-6 w-6' />
					<span>Handbook Finder</span>
				</a>
				<Button
					variant='ghost'
					size='icon'
					onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
				>
					<div className='relative w-6 h-6'>
						<SunMoonIcon
							className={`h-6 w-6 absolute transition-all duration-300 ${
								currentTheme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
							}`}
						/>
						<MoonIcon
							className={`h-6 w-6 absolute transition-all duration-300 ${
								currentTheme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
							}`}
						/>
					</div>
					<span className='sr-only'>Toggle theme</span>
				</Button>
			</div>
			<div className='flex flex-1 relative'>
				<nav
					className={`fixed top-16 left-0 h-[calc(100vh-4rem)] z-50 flex flex-col border-r border-r-muted transition-all duration-300 ease-in-out lg:fixed lg:top-16 lg:z-30 lg:translate-x-0 ${
						isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
					} ${isDesktopSidebarMinimized ? 'lg:w-20' : 'lg:w-64'} w-64 sm:w-72 bg-background`}
				>
					<div className='relative h-full flex flex-col'>
						<Button
							variant='ghost'
							size='icon'
							onClick={() => setIsDesktopSidebarMinimized((prev) => !prev)}
							className='absolute top-2 -right-12 hidden lg:flex hover:bg-muted/80 dark:hover:bg-[#2d3748] transition-colors rounded-full shadow-md'
						>
							{isDesktopSidebarMinimized ? (
								<ChevronRightIcon className='h-5 w-5' />
							) : (
								<ChevronLeftIcon className='h-5 w-5' />
							)}
							<span className='sr-only'>Toggle sidebar</span>
						</Button>
						<ul className='flex-grow overflow-y-auto px-3 py-4 space-y-2'>
							{navItems.map(({ href, icon: Icon, label, onClick, isLanguageSwitcher }) => (
								<li key={href}>
									{isLanguageSwitcher && !isDesktopSidebarMinimized ? (
										<div className='px-3 py-2'>
											<LanguageSwitcher />
										</div>
									) : (
										<a
											href={href}
											onClick={onClick}
											className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
												window.location.pathname === href
													? 'bg-primary text-primary-foreground'
													: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
											} ${isDesktopSidebarMinimized ? 'lg:justify-center' : ''}`}
										>
											<Icon className='h-5 w-5 flex-shrink-0' />
											<span className={isDesktopSidebarMinimized ? 'lg:hidden' : ''}>
												{t(label)}
											</span>
										</a>
									)}
								</li>
							))}
						</ul>
						<footer className='mt-auto p-4 text-center text-sm text-muted-foreground'>
							<a
								href='https://github.com/YuukiPS/Handbook'
								target='_blank'
								rel='noreferrer'
								className={isDesktopSidebarMinimized ? 'lg:hidden' : ''}
							>
								Version 0.1.1 (pre-release)
							</a>
						</footer>
					</div>
				</nav>
				<main
					className={`flex-1 overflow-auto w-full pt-16 transition-all duration-300 ${
						isDesktopSidebarMinimized ? 'lg:pl-20' : 'lg:pl-64'
					}`}
				>
					<Updater />
					{children}
				</main>
				{isSidebarOpen && (
					<div
						className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
						onClick={() => setIsSidebarOpen(false)}
						onKeyDown={(e) => {
							if (e.key === 'Escape') setIsSidebarOpen(false)
						}}
						role='button'
						tabIndex={0}
					/>
				)}
			</div>
		</div>
	)
})

export default Drawer
