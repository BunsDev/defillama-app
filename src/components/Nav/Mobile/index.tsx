import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/future/image'
import dynamic from 'next/dynamic'
import Logo from '~/assets/logo_white_long.png'
import { Menu } from './Menu'
import { Settings } from './Settings'

const MobileSearch = dynamic(() => import('~/components/Search/Base/Mobile'), {
	ssr: false,
	loading: () => <></>
}) as React.FC

export function MobileNav() {
	const router = useRouter()

	return (
		<nav className="flex items-center z-10 gap-2 py-3 px-4 bg-[linear-gradient(168deg,#344179_3.98%,#445ed0_100%)] lg:hidden">
			<Link href="/" passHref>
				<a className="flex-shrink-0 mr-auto">
					<span className="sr-only">Navigate to Home Page</span>
					<Image
						src={Logo}
						alt="Navigate to Home Page"
						priority
						className="h-9 object-contain object-left w-min hover:-rotate-6 transition-transform duration-300 mr-auto"
					/>
				</a>
			</Link>
			{!router.pathname.startsWith('/yield') && !router.pathname.startsWith('/raises') ? <MobileSearch /> : null}
			<Settings />
			<Menu />
		</nav>
	)
}
