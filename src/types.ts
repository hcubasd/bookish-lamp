export interface Team {
	id: string;
	title: string;
	created_at: string;
	updated_at: string;
}

export interface User {
	id: string;
	full_name: string;
	email: string | null;
	phone: string | null;
	team: Team | null;
	created_at: string;
	updated_at: string;
}

export interface Industry {
	id: string;
	title: string;
	created_at: string;
	updated_at: string;
}

export interface Source {
	id: string;
	title: string;
	description: string | null;
	created_at: string;
	updated_at: string;
}

export interface Campaign {
	id: string;
	title: string;
	description: string | null;
	created_at: string;
	updated_at: string;
}

export interface LossReason {
	id: string;
	reason: string;
	created_at: string;
	updated_at: string;
}

export interface Product {
	id: string;
	title: string;
	description: string | null;
	price: number;
	created_at: string;
	updated_at: string;
}

export interface Pipeline {
	id: string;
	title: string;
	display_order: number;
	created_at: string;
	updated_at: string;
}

export interface PipelineStage {
	id: string;
	title: string;
	description: string | null;
	objective: string | null;
	display_order: number;
	pipeline: Pipeline;
	created_at: string;
	updated_at: string;
}

export interface Contact {
	id: string;
	full_name: string;
	job_title: string | null;
	emails: object;
	phones: object;
	social_profiles: object;
	created_at: string;
	updated_at: string;
}

export interface Organization {
	id: string;
	title: string;
	description: string | null;
	website: string | null;
	address: object;
	owner: User | null;
	industries: Industry[];
	followers: User[];
	contacts: Contact[];
	created_at: string;
	updated_at: string;
}

export interface Task {
	id: string;
	title: string;
	description: string | null;
	task_type: string;
	status: string;
	due_date: string | null;
	completed_at: string | null;
	created_by: User;
	completed_by: User | null;
	assignees: User[];
	created_at: string;
	updated_at: string;
}

export interface Deal {
	id: string;
	title: string;
	stage: PipelineStage;
	owner: User | null;
	source: Source | null;
	campaign: Campaign | null;
	loss_reason: LossReason | null;
	organization: Organization | null;
	amount: number | null;
	expected_close_date: string | null;
	rating: number | null;
	status: "won" | "lost" | "ongoing";
	closed_at: string | null;
	contacts: Contact[];
	products: Product[];
	tasks: Task[];
	created_at: string;
	updated_at: string;
}
