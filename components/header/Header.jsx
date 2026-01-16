import Header18 from './Header18'

export default function Header({
	textClass,
	bgColor = 'darkGray',
	uppercase = false,
	isArrow = true,
	Linkfs = '',
	showVehicleSearch = true,
}) {
	// Keep legacy props in signature to avoid breaking imports,
	// but render our unified site header everywhere.
	void textClass
	void bgColor
	void uppercase
	void isArrow
	void Linkfs

	return <Header18 showVehicleSearch={showVehicleSearch} />
}
