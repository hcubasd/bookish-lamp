import type { Deal, Industry, PipelineStage } from "../types";

export interface AggregationRowData {
	id: string;
	title: string;
	amount: number;
}

function openForPipeline(deals: Deal[], pipelineId: string): Deal[] {
	return deals.filter(
		(deal) =>
			deal.status === "ongoing" && deal.stage.pipeline.id === pipelineId,
	);
}

function stagesForPipeline(deals: Deal[], pipelineId: string): PipelineStage[] {
	const stages = new Map<string, PipelineStage>();

	for (const deal of deals) {
		if (deal.stage.pipeline.id === pipelineId) {
			stages.set(deal.stage.id, deal.stage);
		}
	}

	return [...stages.values()].sort((left, right) => {
		return left.display_order - right.display_order;
	});
}

export function rowsByStage(
	deals: Deal[],
	pipelineId: string,
): AggregationRowData[] {
	const openDeals = openForPipeline(deals, pipelineId);

	return stagesForPipeline(deals, pipelineId).map((stage) => ({
		id: stage.id,
		title: stage.title,
		amount: openDeals
			.filter((deal) => deal.stage.id === stage.id)
			.reduce((sum, deal) => sum + (deal.amount ?? 0), 0),
	}));
}

function rowsFromMap<T extends { id: string }>(
	items: Map<string, T>,
	pipelineId: string,
	getTitle: (item: T) => string,
	getAmount: (item: T) => number,
): AggregationRowData[] {
	return [...items.values()]
		.map((item) => ({
			id: `${pipelineId}:${item.id}`,
			title: getTitle(item),
			amount: getAmount(item),
		}))
		.sort((left, right) => right.amount - left.amount);
}

export function rowsByOwner(
	deals: Deal[],
	pipelineId: string,
): AggregationRowData[] {
	const openDeals = openForPipeline(deals, pipelineId);
	const owners = new Map<string, NonNullable<Deal["owner"]>>();

	for (const deal of openDeals) {
		if (deal.owner) {
			owners.set(deal.owner.id, deal.owner);
		}
	}

	return rowsFromMap(
		owners,
		pipelineId,
		(owner) => owner.full_name,
		(owner) =>
			openDeals
				.filter((deal) => deal.owner?.id === owner.id)
				.reduce((sum, deal) => sum + (deal.amount ?? 0), 0),
	);
}

export function rowsByOrganization(
	deals: Deal[],
	pipelineId: string,
): AggregationRowData[] {
	const openDeals = openForPipeline(deals, pipelineId);
	const organizations = new Map<string, NonNullable<Deal["organization"]>>();

	for (const deal of openDeals) {
		if (deal.organization) {
			organizations.set(deal.organization.id, deal.organization);
		}
	}

	return rowsFromMap(
		organizations,
		pipelineId,
		(organization) => organization.title,
		(organization) =>
			openDeals
				.filter((deal) => deal.organization?.id === organization.id)
				.reduce((sum, deal) => sum + (deal.amount ?? 0), 0),
	);
}

export function rowsByContact(
	deals: Deal[],
	pipelineId: string,
): AggregationRowData[] {
	const openDeals = openForPipeline(deals, pipelineId);
	const contacts = new Map<string, Deal["contacts"][number]>();

	for (const deal of openDeals) {
		for (const contact of deal.contacts) {
			contacts.set(contact.id, contact);
		}
	}

	return rowsFromMap(
		contacts,
		pipelineId,
		(contact) => contact.full_name,
		(contact) =>
			openDeals
				.filter((deal) => deal.contacts.some((item) => item.id === contact.id))
				.reduce((sum, deal) => sum + (deal.amount ?? 0), 0),
	);
}

export function rowsByProduct(
	deals: Deal[],
	pipelineId: string,
): AggregationRowData[] {
	const openDeals = openForPipeline(deals, pipelineId);
	const products = new Map<string, Deal["products"][number]>();

	for (const deal of openDeals) {
		for (const product of deal.products) {
			products.set(product.id, product);
		}
	}

	return rowsFromMap(
		products,
		pipelineId,
		(product) => product.title,
		(product) =>
			openDeals
				.filter((deal) => deal.products.some((item) => item.id === product.id))
				.reduce((sum, deal) => sum + (deal.amount ?? 0), 0),
	);
}

export function rowsByCampaign(
	deals: Deal[],
	pipelineId: string,
): AggregationRowData[] {
	const openDeals = openForPipeline(deals, pipelineId);
	const campaigns = new Map<string, NonNullable<Deal["campaign"]>>();

	for (const deal of openDeals) {
		if (deal.campaign) {
			campaigns.set(deal.campaign.id, deal.campaign);
		}
	}

	return rowsFromMap(
		campaigns,
		pipelineId,
		(campaign) => campaign.title,
		(campaign) =>
			openDeals
				.filter((deal) => deal.campaign?.id === campaign.id)
				.reduce((sum, deal) => sum + (deal.amount ?? 0), 0),
	);
}

export function rowsBySource(
	deals: Deal[],
	pipelineId: string,
): AggregationRowData[] {
	const openDeals = openForPipeline(deals, pipelineId);
	const sources = new Map<string, NonNullable<Deal["source"]>>();

	for (const deal of openDeals) {
		if (deal.source) {
			sources.set(deal.source.id, deal.source);
		}
	}

	return rowsFromMap(
		sources,
		pipelineId,
		(source) => source.title,
		(source) =>
			openDeals
				.filter((deal) => deal.source?.id === source.id)
				.reduce((sum, deal) => sum + (deal.amount ?? 0), 0),
	);
}

export function rowsByTeam(
	deals: Deal[],
	pipelineId: string,
): AggregationRowData[] {
	const openDeals = openForPipeline(deals, pipelineId);
	const teams = new Map<
		string,
		NonNullable<NonNullable<Deal["owner"]>["team"]>
	>();

	for (const deal of openDeals) {
		if (deal.owner?.team) {
			teams.set(deal.owner.team.id, deal.owner.team);
		}
	}

	return rowsFromMap(
		teams,
		pipelineId,
		(team) => team.title,
		(team) =>
			openDeals
				.filter((deal) => deal.owner?.team?.id === team.id)
				.reduce((sum, deal) => sum + (deal.amount ?? 0), 0),
	);
}

export function rowsByIndustry(
	deals: Deal[],
	pipelineId: string,
): AggregationRowData[] {
	const openDeals = openForPipeline(deals, pipelineId);
	const industries = new Map<string, Industry>();

	for (const deal of openDeals) {
		for (const industry of deal.organization?.industries ?? []) {
			industries.set(industry.id, industry);
		}
	}

	return rowsFromMap(
		industries,
		pipelineId,
		(industry) => industry.title,
		(industry) =>
			openDeals
				.filter((deal) =>
					deal.organization?.industries.some((item) => item.id === industry.id),
				)
				.reduce((sum, deal) => sum + (deal.amount ?? 0), 0),
	);
}
