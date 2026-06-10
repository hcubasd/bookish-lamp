export interface RollingMonth {
	key: string;
	label: string;
	monthIndex: number;
	monthStart: Date;
	year: number;
}

function formatMonthLabel(monthStart: Date): string {
	const shortMonth = monthStart.toLocaleString(undefined, { month: 'short', year: '2-digit' });
	return shortMonth;
}

export default function getRollingMonths(
	referenceDate: Date = new Date(),
): RollingMonth[] {
	const currentMonthStart = new Date(
		referenceDate.getFullYear(),
		referenceDate.getMonth(),
		1,
	);

	return Array.from({ length: 12 }, (_, index) => {
		const monthStart = new Date(
			currentMonthStart.getFullYear(),
			currentMonthStart.getMonth() - 11 + index,
			1,
		);

		return {
			key: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`,
			label: formatMonthLabel(monthStart),
			monthIndex: monthStart.getMonth(),
			monthStart,
			year: monthStart.getFullYear(),
		};
	});
}
