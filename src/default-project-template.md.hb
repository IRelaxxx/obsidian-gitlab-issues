---
id: {{id}}
name: {{name}}
issues_enabled: {{issues_enabled}}
webUrl: {{web_url}}
---

### {{name}}

{{{description}}}

[Lables](<{{this.basePath}}/Lables/_Lables.md>)

Issues:

| Id | Issue |
|---|---|
{{#each issues}}
| {{this.iid}} | [{{this.title}}](<{{this.path}}>) |
{{/each}}

[View On Gitlab]({{web_url}})
