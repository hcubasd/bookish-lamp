import type { Deal, Industry, PipelineStage } from "../types";

export type AggRow = {
	id: string;
	title: string;
	amount: number;
	source: Record<string, unknown>;
};

export function formatTooltip(obj: Record<string, unknown>): string {
	return Object.entries(obj)
		.filter(([k, v]) => {
			if (k === "id" || k.endsWith("_id")) return false;
			if (v === null || v === undefined) return false;
			if (Array.isArray(v)) return v.length > 0 && typeof v[0] !== "object";
			if (typeof v === "object") return false;
			return true;
		})
		.map(([k, v]) =>
			Array.isArray(v) ? `${k}: ${(v as unknown[]).join(", ")}` : `${k}: ${v}`,
		)
		.join("\n");
}

function openForPipeline(deals: Deal[], pipelineId: string): Deal[] {
	return deals.filter(
		(d) => d.status === "ongoing" && d.stage.pipeline.id === pipelineId,
	);
}

function stagesForPipeline(deals: Deal[], pipelineId: string): PipelineStage[] {
	const map = new Map<string, PipelineStage>();
	deals
		.filter((d) => d.stage.pipeline.id === pipelineId)
		.forEach((d) => {
			map.set(d.stage.id, d.stage);
		});
	return [...map.values()].sort((a, b) => a.display_order - b.display_order);
}

export function rowsByStage(deals: Deal[], pipelineId: string): AggRow[] {
	const open = openForPipeline(deals, pipelineId);
	return stagesForPipeline(deals, pipelineId).map((stage) => ({
		id: stage.id,
		title: stage.title,
		amount: open
			.filter((d) => d.stage.id === stage.id)
			.reduce((s, d) => s + (d.amount ?? 0), 0),
		source: stage as unknown as Record<string, unknown>,
	}));
}

export function rowsByOwner(deals: Deal[], pipelineId: string): AggRow[] {
	const open = openForPipeline(deals, pipelineId);
	const owners = new Map<string, NonNullable<Deal["owner"]>>();
	open.forEach((d) => {
		if (d.owner) owners.set(d.owner.id, d.owner);
	});
	return [...owners.values()]
		.map((owner) => ({
			id: `${pipelineId}:${owner.id}`,
			title: owner.full_name,
			amount: open
				.filter((d) => d.owner?.id === owner.id)
				.reduce((s, d) => s + (d.amount ?? 0), 0),
			source: owner as unknown as Record<string, unknown>,
		}))
		.sort((a, b) => b.amount - a.amount);
}

export function rowsByOrganization(
	deals: Deal[],
	pipelineId: string,
): AggRow[] {
	const open = openForPipeline(deals, pipelineId);
	const orgs = new Map<string, NonNullable<Deal["organization"]>>();
	open.forEach((d) => {
		if (d.organization) orgs.set(d.organization.id, d.organization);
	});
	return [...orgs.values()]
		.map((org) => ({
			id: `${pipelineId}:${org.id}`,
			title: org.title,
			amount: open
				.filter((d) => d.organization?.id === org.id)
				.reduce((s, d) => s + (d.amount ?? 0), 0),
			source: org as unknown as Record<string, unknown>,
		}))
		.sort((a, b) => b.amount - a.amount);
}

export function rowsByContact(deals: Deal[], pipelineId: string): AggRow[] {
	const open = openForPipeline(deals, pipelineId);
	const contacts = new Map<string, Deal["contacts"][number]>();
	open.forEach((d) => {
		d.contacts.forEach((c) => {
			contacts.set(c.id, c);
		});
	});
	return [...contacts.values()]
		.map((contact) => ({
			id: `${pipelineId}:${contact.id}`,
			title: contact.full_name,
			amount: open
				.filter((d) => d.contacts.some((c) => c.id === contact.id))
				.reduce((s, d) => s + (d.amount ?? 0), 0),
			source: contact as unknown as Record<string, unknown>,
		}))
		.sort((a, b) => b.amount - a.amount);
}

export function rowsByProduct(deals: Deal[], pipelineId: string): AggRow[] {
	const open = openForPipeline(deals, pipelineId);
	const products = new Map<string, Deal["products"][number]>();
	open.forEach((d) => {
		d.products.forEach((p) => {
			products.set(p.id, p);
		});
	});
	return [...products.values()]
		.map((product) => ({
			id: `${pipelineId}:${product.id}`,
			title: product.title,
			amount: open
				.filter((d) => d.products.some((p) => p.id === product.id))
				.reduce((s, d) => s + (d.amount ?? 0), 0),
			source: product as unknown as Record<string, unknown>,
		}))
		.sort((a, b) => b.amount - a.amount);
}

export function rowsByCampaign(deals: Deal[], pipelineId: string): AggRow[] {
	const open = openForPipeline(deals, pipelineId);
	const campaigns = new Map<string, NonNullable<Deal["campaign"]>>();
	open.forEach((d) => {
		if (d.campaign) campaigns.set(d.campaign.id, d.campaign);
	});
	return [...campaigns.values()]
		.map((campaign) => ({
			id: `${pipelineId}:${campaign.id}`,
			title: campaign.title,
			amount: open
				.filter((d) => d.campaign?.id === campaign.id)
				.reduce((s, d) => s + (d.amount ?? 0), 0),
			source: campaign as unknown as Record<string, unknown>,
		}))
		.sort((a, b) => b.amount - a.amount);
}

export function rowsBySource(deals: Deal[], pipelineId: string): AggRow[] {
	const open = openForPipeline(deals, pipelineId);
	const sources = new Map<string, NonNullable<Deal["source"]>>();
	open.forEach((d) => {
		if (d.source) sources.set(d.source.id, d.source);
	});
	return [...sources.values()]
		.map((source) => ({
			id: `${pipelineId}:${source.id}`,
			title: source.title,
			amount: open
				.filter((d) => d.source?.id === source.id)
				.reduce((s, d) => s + (d.amount ?? 0), 0),
			source: source as unknown as Record<string, unknown>,
		}))
		.sort((a, b) => b.amount - a.amount);
}

export function rowsByTeam(deals: Deal[], pipelineId: string): AggRow[] {
	const open = openForPipeline(deals, pipelineId);
	const teams = new Map<
		string,
		NonNullable<NonNullable<Deal["owner"]>["team"]>
	>();
	open.forEach((d) => {
		if (d.owner?.team) teams.set(d.owner.team.id, d.owner.team);
	});
	return [...teams.values()]
		.map((team) => ({
			id: `${pipelineId}:${team.id}`,
			title: team.title,
			amount: open
				.filter((d) => d.owner?.team?.id === team.id)
				.reduce((s, d) => s + (d.amount ?? 0), 0),
			source: team as unknown as Record<string, unknown>,
		}))
		.sort((a, b) => b.amount - a.amount);
}

export function rowsByIndustry(deals: Deal[], pipelineId: string): AggRow[] {
	const open = openForPipeline(deals, pipelineId);
	const industries = new Map<string, Industry>();
	open.forEach((d) => {
		if (d.organization)
			d.organization.industries.forEach((i) => {
				industries.set(i.id, i);
			});
	});
	return [...industries.values()]
		.map((industry) => ({
			id: `${pipelineId}:${industry.id}`,
			title: industry.title,
			amount: open
				.filter((d) =>
					d.organization?.industries.some((i) => i.id === industry.id),
				)
				.reduce((s, d) => s + (d.amount ?? 0), 0),
			source: industry as unknown as Record<string, unknown>,
		}))
		.sort((a, b) => b.amount - a.amount);
}
