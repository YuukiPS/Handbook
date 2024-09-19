import YuukiPS from '@/api/yuukips'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type { Server } from '@/types/yuukipsServer'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { Trans, useTranslation } from 'react-i18next'
import { CiWarning } from 'react-icons/ci'
import expiresInAMonth from '../index/components/cookieExpires'
import ListServerAvailable from './components/ListServerAvailable'
import SelectAccount from './components/SelectAccount'
import Output from './components/output'
import type { State } from './components/types'

const Settings: React.FC = () => {
	const { t } = useTranslation()
	const [state, setState] = useState<State>({
		output: [],
		successCheckPlayer: false,
		listServer: [],
		listServerAvailable: undefined,
		uid: '',
		uidAccount: '',
		code: '',
		loading: false,
		isFailedCheckAccount: false,
	})
	const [cookies, setCookie] = useCookies(['uid', 'uidAccount', 'code', 'server'])

	useEffect(() => {
		const fetchServer = async () => {
			try {
				const res = await fetch('https://ps.yuuki.me/api/server')
				const data: Server = await res.json()
				setState((prevState) => ({
					...prevState,
					listServerAvailable: data,
				}))
			} catch (error) {
				console.error(error)
			}
		}
		fetchServer()
	}, [])

	useEffect(() => {
		const uidCookie = cookies.uidAccount
		if (!uidCookie) return
		const getInputUid = document.getElementById('player-set-uid') as HTMLInputElement
		getInputUid.value = uidCookie
	}, [cookies.uidAccount])

	const setOutputText = useCallback((text: string, color: 'green' | 'red') => {
		setState((prevState) => ({
			...prevState,
			output: [...prevState.output, { text, color }],
		}))
	}, [])

	const handleCheck = async () => {
		const uid = (document.getElementById('player-set-uid') as HTMLInputElement)?.value
		const code = (document.getElementById('player-set-code') as HTMLInputElement)?.value
		if (!uid || !code) {
			setOutputText(t('output.uid_code_empty'), 'red')
			return
		}
		if (uid.length < 5) {
			setOutputText(t('output.uid_must_be_5_digits'), 'red')
			return
		}

		if (code.length < 4) {
			setOutputText(t('output.code_must_be_4_digits'), 'red')
			return
		}
		try {
			setState((prevState) => ({
				...prevState,
				loading: true,
			}))
			const res = await YuukiPS.checkAccount(uid, code)
			if (res.length === 0) {
				setOutputText(t('output.no_account_registered'), 'red')
				setState((prevState) => ({
					...prevState,
					isFailedCheckAccount: false,
					code: code,
					uidAccount: uid,
					successCheckPlayer: true,
				}))
				return
			}
			setState((prevState) => ({
				...prevState,
				successCheckPlayer: true,
				listServer: res,
				code: code,
				uidAccount: uid,
				isFailedCheckAccount: false,
			}))
			setOutputText(
				t('output.successfully_checked_account', {
					uid: uid,
					list_total: res.length,
				}),
				'green'
			)
		} catch (reason) {
			setOutputText(t('output.error_occurred', { error: reason }), 'red')
			setState((prevState) => ({
				...prevState,
				successCheckPlayer: false,
				loading: false,
				isFailedCheckAccount: true,
			}))
		} finally {
			setState((prevState) => ({
				...prevState,
				loading: false,
			}))
		}
	}

	const handleSelectAccount = useCallback(
		(value: string) => {
			const [name, id, uid] = value.split('|')
			if (!name || !id || !uid) {
				setOutputText(
					t('output.input_unexpected_error', {
						error: [!name && 'name', !id && 'id', !uid && 'uid'].filter(Boolean).join(', '),
					}),
					'red'
				)
				return
			}
			setCookie('server', id, {
				path: '/',
				expires: expiresInAMonth(),
			})
			setCookie('uid', uid, {
				path: '/',
				expires: expiresInAMonth(),
			})
			setCookie('uidAccount', state.uidAccount, {
				path: '/',
				expires: expiresInAMonth(),
			})
			setOutputText(t('output.successfully_selected_account', { name: name }), 'green')
		},
		[setCookie, setOutputText, state.uidAccount, t]
	)

	const handleSaveAccount = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault()

		if (!state.code || !state.uidAccount) {
			setOutputText(
				t('output.input_unexpected_error', {
					error: [!state.uid && 'uid', !state.code && 'code', !state.uidAccount && 'uidAccount']
						.filter(Boolean)
						.join(', '),
				}),
				'red'
			)
			return
		}

		setState((prevState) => ({
			...prevState,
			successCheckPlayer: false,
		}))
		setCookie('code', state.code, {
			path: '/',
			expires: expiresInAMonth(),
		})
		setCookie('uidAccount', state.uidAccount, {
			path: '/',
			expires: expiresInAMonth(),
		})
		setOutputText(t('output.uid_code_saved'), 'green')
	}

	return (
		<div className='min-w-screen container mx-auto min-h-screen px-4 py-8'>
			<Card className='mx-auto max-w-2xl'>
				<CardHeader>
					<CardTitle className='text-center text-2xl font-bold dark:text-white'>{t('title')}</CardTitle>
				</CardHeader>
				<CardContent>
					{state.isFailedCheckAccount && (
						<Alert variant='destructive' className='mb-6'>
							<CiWarning className='h-4 w-4' />
							<AlertTitle>{t('failed_check_account_title')}</AlertTitle>
							<AlertDescription>
								<Trans
									i18nKey={'failed_check_account_description'}
									components={[
										// biome-ignore lint/a11y/useAnchorContent: It will add a content to the link
										<a
											href={'https://ps.yuuki.me'}
											className={'underline text-blue-500'}
											key={'settings-page-alert-link'}
											target='_blank'
											rel='noreferrer'
										/>,
									]}
								/>
							</AlertDescription>
						</Alert>
					)}

					<div className='space-y-4'>
						<div className='space-y-6'>
							<Input
								type='number'
								id='player-set-uid'
								label={t('uid_account')}
								className='w-full dark:bg-gray-800 dark:text-white'
								required
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										;(document.getElementById('player-set-code') as HTMLInputElement).focus()
									}
								}}
							/>
							<Input
								type='password'
								id='player-set-code'
								label={t('uid_code')}
								required
								className='w-full dark:bg-gray-800 dark:text-white'
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										;(document.getElementById('player-set-check') as HTMLButtonElement).click()
									}
								}}
							/>
						</div>

						<div className='text-left'>
							<a
								href='https://ps.yuuki.me/account/code'
								target='_blank'
								rel='noreferrer'
								className='text-blue-600 hover:underline dark:text-blue-400'
							>
								{t('get_uid_and_code')}
							</a>
						</div>

						<Button
							id='player-set-check'
							className='w-full'
							disabled={state.successCheckPlayer || state.loading}
							onClick={handleCheck}
							loading={state.loading}
							loadingMessage={t('check_account_button_checking')}
						>
							{t('check_account_button')}
						</Button>

						{state.successCheckPlayer && state.listServer.length > 0 && (
							<div className='mt-6'>
								<Separator className='my-4' />
								<SelectAccount
									listServer={state.listServer}
									handleSelectAccount={handleSelectAccount}
								/>
							</div>
						)}

						{!state.isFailedCheckAccount && state.successCheckPlayer && state.listServerAvailable && (
							<div className='mt-6'>
								<Separator className='my-4' />
								<ListServerAvailable
									handleSelectAccount={handleSelectAccount}
									listServerAvailable={state.listServerAvailable}
								/>
							</div>
						)}

						{state.output.length > 0 && (
							<div className='mt-6'>
								<Separator className='my-4' />
								<Output state={state} setState={setState} />
							</div>
						)}

						{state.successCheckPlayer && (
							<div className='mt-6 flex justify-end space-x-4'>
								<Button onClick={handleSaveAccount}>{t('save_account_button')}</Button>
								<Button
									variant='destructive'
									onClick={(e) => {
										e.preventDefault()
										setState((prevState) => ({
											...prevState,
											successCheckPlayer: false,
										}))
										setOutputText('Canceled.', 'green')
									}}
								>
									{t('cancel_button')}
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default Settings
