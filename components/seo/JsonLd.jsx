import { SITE_URL } from '@/lib/site-url'

const organization = {
	'@context': 'https://schema.org',
	'@type': 'Organization',
	name: 'BMR Suspension',
	url: SITE_URL,
	logo: 'https://www.bmrsuspension.com/siteart/logo/bmr-logo-white.png',
	contactPoint: {
		'@type': 'ContactPoint',
		email: 'sales@bmrsuspension.com',
		contactType: 'customer service',
		url: `${SITE_URL}/contact`,
	},
	sameAs: [
		'https://www.instagram.com/bmrsuspension/',
		'https://www.tiktok.com/@bmrsuspension',
	],
}

const website = {
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	name: 'BMR Suspension',
	url: SITE_URL,
	description:
		'High-performance suspension and chassis parts for Mustang, Camaro, GM, Mopar.',
	potentialAction: {
		'@type': 'SearchAction',
		target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/homes/home-search?q={search_term_string}` },
		'query-input': 'required name=search_term_string',
	},
}

export default function JsonLd() {
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(organization),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(website),
				}}
			/>
		</>
	)
}
