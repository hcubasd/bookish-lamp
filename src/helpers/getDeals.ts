import type { Deal } from "../types";
import { mockDeals } from "../mocks";

export async function getDeals(): Promise<Deal[]> {
	if (import.meta.env.DEV) {
		return mockDeals;
	}
	const res = await fetch("https://api.dashboard.mlclogistica.app/deals");
	if (!res.ok) throw new Error(`fetch /deals: ${res.status}`);
	return res.json();
}
