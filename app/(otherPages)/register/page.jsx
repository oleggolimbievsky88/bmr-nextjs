import Footer1 from '@/components/footer/Footer'
import Header18 from '@/components/header/Header18'
import PageHeader from '@/components/header/PageHeader'
import Topbar4 from '@/components/header/Topbar4'
import Register from '@/components/othersPages/Register'

export const metadata = {
	title:
		'Register | BMR Suspension - Performance Racing Suspension & Chassis Parts',
	description: 'BMR Suspension - Performance Racing Suspension & Chassis Parts',
}

export default function page () {
	return (
		<>
			<Topbar4 />
			<Header18 showVehicleSearch={false} />
			<PageHeader title="REGISTER" />
			<Register />
			<Footer1 />
		</>
	)
}
