import { describe, expect, it } from "vitest";
import getRollingMonths from "./getRollingMonths";

describe("getRollingMonths", () => {
	it("returns the last 11 months plus the current month", () => {
		const months = getRollingMonths(new Date(2026, 5, 8));

		expect(months).toHaveLength(12);
		expect(months[0]?.key).toBe("2025-07");
		expect(months[11]?.key).toBe("2026-06");
	});

	it("returns month/year labels for each month", () => {
		const months = getRollingMonths(new Date(2026, 0, 15));

		expect(months[0]?.label).toContain("/");
		expect(months[11]?.label).toContain("2026");
	});

	it("keeps the current month as the last entry", () => {
		const referenceDate = new Date(2026, 11, 31);
		const months = getRollingMonths(referenceDate);
		const lastMonth = months.at(-1);

		expect(lastMonth?.monthIndex).toBe(referenceDate.getMonth());
		expect(lastMonth?.year).toBe(referenceDate.getFullYear());
	});
});
