import GitlabApi from "./gitlab-api";
import { GitlabIssue, Issue } from "./model/issue";
import { App } from "obsidian";
import { GitlabIssuesSettings } from "./settings";
import { Project } from "./model/project";
import { Label } from "./model/label";

export default class GitlabLoader {
  private settings: GitlabIssuesSettings;

  constructor(app: App, settings: GitlabIssuesSettings) {
    this.settings = settings;
  }

  async loadProject(project: number) {
    const urlParts: string[] = [
      `${this.settings.gitlabApiUrl}/projects/${project}`,
    ];
    try {
      return await GitlabApi.load<Project>(
        urlParts.join(""),
        this.settings.gitlabToken
      );
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  async loadLabels(project: number) {
    const urlParts: string[] = [
      `${this.settings.gitlabApiUrl}/projects/${project}/labels`,
    ];
    try {
      return await GitlabApi.load<Label[]>(
        urlParts.join(""),
        this.settings.gitlabToken
      );
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  async loadIssues(project: number) {
    const urlParts: string[] = [
      `${this.settings.gitlabApiUrl}/projects/${project}/issues?` +
        this.settings.filter,
    ];

    try {
      const rawIssues = await GitlabApi.load<Issue[]>(
        urlParts.join(""),
        this.settings.gitlabToken
      );
      return rawIssues.map((rawIssue: Issue) => new GitlabIssue(rawIssue));
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
}
