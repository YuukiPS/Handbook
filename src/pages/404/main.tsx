import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App'
import '@/styles/index.css'
import { ThemeProvider } from '@/components/theme-provider'
import Drawer from '../drawer'

ReactDOM.createRoot(document.getElementById('root') ?? document.createElement('div')).render(
	<Router>
		<ThemeProvider>
			<Drawer>
				<App />
			</Drawer>
		</ThemeProvider>
	</Router>
)
