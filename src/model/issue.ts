export interface Issue {
  id: number;
  iid: number;
  title: string;
  description: string;
  due_date: string;
  web_url: string;
  state: "open" | "closed";
  project_id: number;
  labels: string[];
}

export class GitlabIssue {
  id: number;
  iid: number;
  title: string;
  description: string;
  due_date: string;
  web_url: string;
  state: "open" | "closed";
  project_id: number;
  labels: string;
  labels_raw: string[];

  constructor(issue: Issue) {
    this.id = issue.id;
    this.iid = issue.iid;
    this.title = issue.title;
    this.description = issue.description;
    this.due_date = issue.due_date;
    this.web_url = issue.web_url;
    this.state = issue.state;
    this.project_id = issue.project_id;
    this.labels = JSON.stringify(issue.labels);
    this.labels_raw = issue.labels;
  }
}
