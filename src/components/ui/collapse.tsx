import React, { useEffect, useRef, useState } from 'react'

interface CollapseProps extends React.HTMLAttributes<HTMLDivElement> {
	title: string
	children: React.ReactNode
}

const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(({ children, title, ...props }, ref) => {
	const [isOpen, setIsOpen] = useState(false)
	const [height, setHeight] = useState<number | undefined>(undefined)
	const contentRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (isOpen) {
			const contentEl = contentRef.current
			if (contentEl) {
				setHeight(contentEl.scrollHeight)
			}
		} else {
			setHeight(0)
		}
	}, [isOpen])

	const handleToggle = () => {
		setIsOpen(!isOpen)
	}

	return (
		<div {...props} ref={ref}>
			<div className='flex justify-center'>
				<button type='button' className='mt-2 rounded-md px-4 py-2' onClick={handleToggle}>
					{title}
				</button>
			</div>
			<div
				className='overflow-hidden transition-all duration-300'
				style={{ height: height !== undefined ? `${height}px` : 'auto' }}
			>
				<div ref={contentRef} className='overflow-hidden rounded-md border'>
					{children}
				</div>
			</div>
		</div>
	)
})

export default Collapse
