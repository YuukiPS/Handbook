import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App'
import Drawer from '../drawer'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import '@/styles/index.css'
import { Suspense } from 'react'

ReactDOM.createRoot(document.getElementById('root') ?? document.createElement('div')).render(
	<Router>
		<Suspense>
			<ThemeProvider>
				<Drawer>
					<App />
				</Drawer>
				<Toaster />
			</ThemeProvider>
		</Suspense>
	</Router>
)
