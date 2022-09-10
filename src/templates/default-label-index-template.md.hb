---
project_id: {{project.id}}
---
### Lables for {{project.name}}

| Label |
|---|
{{#each labels}}
| [{{this.name}}](<{{../basePath}}/Lables/{{this.name}}.md>) |
{{/each}}
