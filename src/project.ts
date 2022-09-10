export interface Project {
	id: number;
	name: string;
	issues_enabled: boolean;
	web_url: string;
	description: string | null;
}

export class ProjectIssue {
	iid: number;
	title: string;
	path: string;

	constructor({
		iid,
		title,
		path,
	}: {
		iid: number;
		title: string;
		path: string;
	}) {
		this.iid = iid;
		this.title = title;
		this.path = path;
	}
}

export class GitlabProject implements Project {
	id: number;
	name: string;
	issues_enabled: boolean;
	web_url: string;
	description: string | null;
	issues: ProjectIssue[];

	constructor(project: Project, issues: ProjectIssue[]) {
		this.id = project.id;
		this.name = project.name;
		this.issues_enabled = project.issues_enabled;
		this.web_url = project.web_url;
		this.description = project.description;
		this.issues = issues;
	}
}
