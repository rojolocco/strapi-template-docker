# Attribute types (Strapi 5)

| Type | Notes / options |
|---|---|
| `string` | short text. `minLength`, `maxLength`, `regex`, `default` |
| `text` | long plain text. `minLength`, `maxLength` |
| `richtext` | legacy Markdown rich text |
| `blocks` | JSON-based rich text (recommended) |
| `email` | validated email |
| `password` | hashed, never returned by the API (`private` implied) |
| `integer`, `biginteger`, `float`, `decimal` | `min`, `max`, `default` |
| `boolean` | `default` |
| `date`, `time`, `datetime`, `timestamp` | ISO values |
| `json` | arbitrary JSON |
| `enumeration` | `"enum": ["a", "b"]`, optional `default` |
| `uid` | `"targetField": "title"`, optional `options.separator` |
| `media` | `"multiple": false`, `"allowedTypes": ["images","files","videos","audios"]` |
| `relation` | see `relations.md` |
| `component` | `"component": "category.name"`, `"repeatable": true/false` |
| `dynamiczone` | `"components": ["category.name", ...]` |

## Common options (any scalar)

```json
{ "type": "string", "required": true, "unique": true, "private": false,
  "configurable": true, "default": "x",
  "pluginOptions": { "i18n": { "localized": true } } }
```

- `required`: field must be set (when publishing, if draftAndPublish is on).
- `unique`: DB-level unique; avoid on localized fields.
- `private`: omitted from API responses.

## Reserved names

`id`, `documentId`, `createdAt`, `updatedAt`, `publishedAt`, `createdBy`, `updatedBy`, `locale`, `localizations`, `strapi_stage`, `strapi_assignee`.

## i18n

Enable per type with `"pluginOptions": { "i18n": { "localized": true } }` at the root, then per attribute as above. Only when the user asks for it.
