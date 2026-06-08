import type { Deal } from "../types";
import { mockDeals } from "../mocks";

export async function getDeals(): Promise<Deal[]> {
	if (import.meta.env.DEV) {
		return mockDeals;
	}
	const res = await fetch("https://dashboard-api.mlclogistica.app/deals", { credentials: "include" });
	if (!res.ok) throw new Error(`fetch /deals: ${res.status}`);
	return res.json();
}
