import React from 'react';
import { FaGitlab, FaGithub, FaDiscord } from 'react-icons/fa6';
import { SiBuymeacoffee } from 'react-icons/si';
import { FiExternalLink } from 'react-icons/fi';

type LinkProps = {
    href: string;
    icon: JSX.Element;
    label: string;
};

const FooterLink: React.FC<LinkProps> = ({ href, icon, label }) => (
    <a className='link-hover link' href={href}>
        {React.cloneElement(icon, { className: '-mt-1 mr-1 inline-block' })}
        {label}
        <FiExternalLink className='-mt-1 ml-1 inline-block' />
    </a>
);

const Footer: React.FC = () => {
    return (
        <footer className='mt-auto w-full bg-gray-800 px-6 py-4 text-white'>
            <div className='footer'>
                <nav>
                    <header className='footer-title'>ElaXan</header>
                    <FooterLink
                        href='https://discord.com/users/506212044152897546'
                        icon={<FaDiscord />}
                        label='Discord'
                    />
                    <FooterLink
                        href='https://github.com/ElaXan'
                        icon={<FaGithub />}
                        label='GitHub'
                    />
                    <FooterLink
                        href='https://gitlab.com/ElaXan'
                        icon={<FaGitlab />}
                        label='GitLab'
                    />
                </nav>
                <nav>
                    <header className='footer-title'>Handbook Finder</header>
                    <FooterLink
                        href='https://gitlab.com/YuukiPS/handbook'
                        icon={<FaGitlab />}
                        label='GitLab'
                    />
                </nav>
                <nav>
                    <header className='footer-title'>Donations</header>
                    <FooterLink
                        href='https://buymeacoffee.com/elashxander'
                        icon={<SiBuymeacoffee />}
                        label='BuyMeaCoffee'
                    />
                    <FooterLink
                        href='https://saweria.co/ElaXan'
                        icon={<div />}
                        label='Saweria'
                    />
                </nav>
            </div>
            <aside className='flex justify-center'>
                <p>Copyright © 2023-{new Date().getFullYear()} ElaXan</p>
            </aside>
        </footer>
    );
};

export default Footer;
