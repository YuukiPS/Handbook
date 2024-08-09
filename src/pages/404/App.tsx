import { useTranslation } from 'react-i18next';

const Page404: React.FC = () => {
    const { t } = useTranslation('default', {
        keyPrefix: 'page_not_found',
    });
    return (
        <div className='flex min-h-screen flex-col items-center justify-center bg-background text-foreground'>
            <h1 className='text-9xl font-bold'>404</h1>
            <p className='mt-4 text-2xl'>{t('title')}</p>
            <p className='mt-2 text-lg text-muted-foreground'>
                {t('description')}
            </p>
            <a
                href='/'
                className='mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary-foreground hover:text-primary'
            >
                {t('button')}
            </a>
        </div>
    );
};

export default Page404;
