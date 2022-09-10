import { GitlabIssue } from "./issue";
import { Vault, TFile, TAbstractFile, TFolder } from "obsidian";
import { GitlabIssuesSettings } from "./settings";
import { compile } from "handlebars";
import { GitlabProject, Project } from "./project";
import { Label } from "./label";

export default class Filesystem {
  private vault: Vault;
  private settings: GitlabIssuesSettings;

  constructor(vault: Vault, settings: GitlabIssuesSettings) {
    this.vault = vault;
    this.settings = settings;
  }

  public async createOutputDirectory() {
    try {
      return await this.tryCreateFolder(this.settings.outputDir);
    } catch (e) {
      return console.log("Could not create output directory");
    }
  }

  public async createProjectDirectory(project: Project) {
    try {
      console.log(`${this.settings.outputDir}/${project.name}`);
      return await this.tryCreateFolder(
        `${this.settings.outputDir}/${project.name}`
      );
    } catch (e) {
      return console.log("Could not create output directory");
    }
  }

  public async createLablesDirectory(project: Project) {
    try {
      console.log(`${this.settings.outputDir}/${project.name}`);
      return await this.tryCreateFolder(
        `${this.settings.outputDir}/${project.name}/Lables`
      );
    } catch (e) {
      return console.log("Could not create lables directory");
    }
  }

  private async tryCreateFolder(path: string) {
    try {
      return await this.vault.createFolder(path);
    } catch (e) {
      if (e.toString() == "Error: Folder already exists.") {
        return new Promise<void>((resolve, _) => resolve());
      }
      throw new Error(`Could not create folder ${path}`);
    }
  }

  public purgeExistingIssues(projectName: string): Promise<Error | void> {
    const outputDir = this.vault.getAbstractFileByPath(
      `${this.settings.outputDir}/${projectName}`
    );
    if (outputDir instanceof TFolder) {
      return new Promise<Error | void>((resolve, reject) => {
        Vault.recurseChildren(outputDir, (existingFile: TAbstractFile) => {
          if (existingFile instanceof TFile) {
            this.vault.delete(existingFile).catch((error) => reject(error));
          }
        });
        resolve();
      });
    }
    return new Promise((_, reject) =>
      reject(new Error("outputDir not a folder"))
    );
  }

  public async processIssues(project: GitlabProject, issues: GitlabIssue[]) {
    const rawIssueTemplate = await this.vault.adapter.read(
      this.issueTemplateLocation()
    );
    const issueTemplate = compile(rawIssueTemplate);
    await Promise.all(
      issues.map((issue) => this.writeFile(project, issue, issueTemplate))
    );
  }

  public async processProject(project: GitlabProject) {
    const rawProjectTemplate = await this.vault.adapter.read(
      this.projectTemplateLocation()
    );
    const projectTemplate = compile(rawProjectTemplate);
    this.vault.create(
      `${this.settings.outputDir}/${project.name}/${project.name}.md`,
      projectTemplate({ ...project, basePath: this.basePath(project) })
    );
  }

  public async processLabels(project: GitlabProject, labels: Label[]) {
    const rawLabelTemplate = await this.vault.adapter.read(
      this.labelTemplateLocation()
    );
    const labelTemplate = compile(rawLabelTemplate);
    await Promise.all([
      ...labels.map((label) =>
        this.vault
          .create(
            `${this.basePath(project)}/Lables/${label.name}.md`,
            labelTemplate(label)
          )
          .catch((error) => {
            console.log(error.message);
            console.log(`${this.basePath(project)}/Lables/${label.name}.md`);
          })
      ),
      this.createLabelIndex(project, labels),
    ]);
  }

  private async createLabelIndex(project: GitlabProject, labels: Label[]) {
    const rawLabelIndexTemplate = await this.vault.adapter.read(
      this.labelIndexTemplateLocation()
    );
    const labelIndexTemplate = compile(rawLabelIndexTemplate);
    console.log({
      labels,
      project,
      basePath: this.basePath(project),
    });
    this.vault
      .create(
        `${this.basePath(project)}/Lables/_Lables.md`,
        labelIndexTemplate({
          labels,
          project,
          basePath: this.basePath(project),
        })
      )
      .catch((error) => {
        console.log(error.message);
        console.log(`${this.basePath(project)}/Lables/Lables.md`);
      });
  }

  private async writeFile(
    project: GitlabProject,
    issue: GitlabIssue,
    template: HandlebarsTemplateDelegate
  ): Promise<TFile | void> {
    console.log(this.basePath(project));
    return this.vault
      .create(
        this.fileName(project, issue),
        template({ ...issue, basePath: this.basePath(project) })
      )
      .catch((error) => {
        console.log(error.message);
        console.log(this.fileName(project, issue));
      });
  }

  private issueTemplateLocation(): string {
    const defaultTemplate =
      app.vault.configDir +
      "/plugins/obsidian-gitlab-issues/src/default-issue-template.md.hb";

    if (this.settings.templateFile.length) {
      return this.settings.templateFile;
    }

    return defaultTemplate;
  }

  private projectTemplateLocation(): string {
    const defaultTemplate =
      app.vault.configDir +
      "/plugins/obsidian-gitlab-issues/src/default-project-template.md.hb";

    if (this.settings.templateFile.length) {
      return this.settings.templateFile;
    }

    return defaultTemplate;
  }

  private labelTemplateLocation(): string {
    const defaultTemplate =
      app.vault.configDir +
      "/plugins/obsidian-gitlab-issues/src/default-label-template.md.hb";

    if (this.settings.templateFile.length) {
      return this.settings.templateFile;
    }

    return defaultTemplate;
  }

  private labelIndexTemplateLocation(): string {
    const defaultTemplate =
      app.vault.configDir +
      "/plugins/obsidian-gitlab-issues/src/default-label-index-template.md.hb";

    if (this.settings.templateFile.length) {
      return this.settings.templateFile;
    }

    return defaultTemplate;
  }

  public fileName(
    project: GitlabProject | Project,
    issue: GitlabIssue
  ): string {
    return `${this.basePath(project)}/${issue.iid} ${issue.title}.md`;
  }

  public basePath(project: GitlabProject | Project) {
    return `${this.settings.outputDir}/${project.name}`;
  }
}
