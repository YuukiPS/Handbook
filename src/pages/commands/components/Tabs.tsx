import type { Dispatch, SetStateAction } from 'react'

interface TabsProps {
	activeTab: number
	setActiveTab: Dispatch<SetStateAction<number>>
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
	const listTabs = ['GC', 'GIO', 'LC']

	return (
		<div className='flex flex-wrap sm:flex-nowrap border-b border-gray-200 dark:border-gray-700'>
			{listTabs.map((tab, index) => (
				<button
					type='button'
					onClick={() => setActiveTab(index)}
					key={`tab-${tab}`}
					className={`${
						activeTab === index
							? 'border-blue-500 text-blue-600 dark:text-blue-400'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
					}
						flex-1 sm:flex-none px-4 py-2 text-sm font-medium 
						border-b-2 transition-colors duration-200
						focus:outline-none whitespace-nowrap
					`}
				>
					{tab}
				</button>
			))}
		</div>
	)
}
export default Tabs
