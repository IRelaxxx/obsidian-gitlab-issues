export interface Label {
  id: number;
  name: string;
  description: string;
  description_html: string;
  color: string;
}

export class GitlabLabel {
  id: number;
  name: string;
  description: string;
  description_html: string;
  color: string;

  constructor(issue: Label) {
    this.id = issue.id;
    this.name = issue.name;
    this.description = issue.description;
    this.description_html = issue.description_html;
    this.color = issue.color;
  }
}
