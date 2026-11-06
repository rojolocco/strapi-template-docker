# Components and dynamic zones

## Component file

Path: `src/components/<category>/<name>.json` → uid `<category>.<name>`.

```json
{
  "collectionName": "components_shared_seos",
  "info": { "displayName": "Seo", "icon": "search", "description": "" },
  "options": {},
  "attributes": {
    "metaTitle": { "type": "string", "required": true },
    "metaDescription": { "type": "text" }
  }
}
```

- `collectionName`: `components_<category>_<plural name>` in snake_case.
- Category and name: kebab-case file/folder names (`shared`, `seo`).
- Components have no controller, service or router and no `kind`/`singularName`.
- Components can nest other components but keep it shallow.

## Using a component

```json
"seo": { "type": "component", "component": "shared.seo", "repeatable": false },
"links": { "type": "component", "component": "shared.link", "repeatable": true }
```

## Dynamic zone

```json
"blocks": {
  "type": "dynamiczone",
  "components": ["shared.rich-text", "shared.media", "shared.seo"]
}
```

Every listed uid must exist. Dynamic zones cannot be `required` combined with `min`/`max` incorrectly; set `"required": true` and optionally `"min"`/`"max"`.

## When to choose what

- Reused group of fields → component.
- Ordered, mixed content blocks → dynamic zone.
- Independent entity with its own lifecycle/permissions → collection type + relation.
