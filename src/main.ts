import { Notice, Plugin, addIcon } from "obsidian";
import {
  DEFAULT_SETTINGS,
  GitlabIssuesSettings,
  GitlabIssuesSettingTab,
} from "./settings";
import Filesystem from "./filesystem";
import GitlabLoader from "./gitlab-loader";
import gitlabIcon from "./assets/gitlab-icon.svg";
import { GitlabProject, ProjectIssue } from "./model/project";

export default class GitlabIssuesPlugin extends Plugin {
  settings: GitlabIssuesSettings;

  async onload() {
    console.log("Starting Gitlab Issues plugin");

    await this.loadSettings();
    this.addSettingTab(new GitlabIssuesSettingTab(this.app, this));

    if (this.settings.gitlabToken) {
      this.createOutputFolder();
      this.addIconToLeftRibbon();
      this.addCommandToPalette();
      this.refreshIssuesAtStartup();
      this.scheduleAutomaticRefresh();
    }
  }

  private addIconToLeftRibbon() {
    if (this.settings.showIcon) {
      addIcon("gitlab", gitlabIcon);
      this.addRibbonIcon("gitlab", "Gitlab Issues", (evt: MouseEvent) => {
        this.fetchFromGitlab();
      });
    }
  }

  private addCommandToPalette() {
    this.addCommand({
      id: "import-gitlab-issues",
      name: "Import Gitlab Issues",
      callback: () => {
        this.fetchFromGitlab();
      },
    });
  }

  private refreshIssuesAtStartup() {
    this.registerInterval(
      window.setTimeout(() => {
        this.fetchFromGitlab();
      }, 5 * 1000)
    ); // after 5 seconds
  }

  private scheduleAutomaticRefresh() {
    this.registerInterval(
      window.setInterval(() => {
        this.fetchFromGitlab();
      }, 15 * 60 * 1000)
    ); // every 15 minutes
  }

  private createOutputFolder() {
    const fs = new Filesystem(app.vault, this.settings);
    fs.createOutputDirectory();
  }

  private async fetchFromGitlab() {
    new Notice("Updating issues from Gitlab");
    const loader = new GitlabLoader(this.app, this.settings);
    const projectRaw = await loader.loadProject(this.settings.projectId);
    const labels = await loader.loadLabels(projectRaw.id);
    const issues = await loader.loadIssues(projectRaw.id);
    const fs = new Filesystem(this.app.vault, this.settings);

    await fs.createProjectDirectory(projectRaw);
    await fs.createLablesDirectory(projectRaw);
    await fs.purgeExistingIssues(projectRaw.name);

    const project = new GitlabProject(
      projectRaw,
      issues.map(
        (x) =>
          new ProjectIssue({
            iid: x.iid,
            title: x.title,
            path: fs.fileName(projectRaw, x),
          })
      )
    );

    await fs.processProject(project);
    await fs.processLabels(project, labels);
    await fs.processIssues(project, issues);
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
