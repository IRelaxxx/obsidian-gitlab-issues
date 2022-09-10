---
iid: {{iid}}
title: {{title}}
dueDate: {{due_date}}
webUrl: {{web_url}}
state: {{state}}
project_id: {{project_id}}
labels: {{{labels}}}
---
{{basePath}}
### {{title}}
{{#if due_date}}
##### Due on {{due_date}}
{{/if}}
{{#if state}}
##### State: {{state}}
{{/if}}
{{#if labels_raw}}
##### Labels
{{#each labels_raw}}
- [{{this}}](<{{../basePath}}/Lables/{{this}}.md>)
{{/each}}
{{/if}}

{{{description}}}

[View On Gitlab]({{web_url}})
