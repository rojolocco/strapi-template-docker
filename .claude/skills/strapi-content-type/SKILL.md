---
name: strapi-content-type
description: Create, modify or delete Strapi 5 content types (collection types, single types) and components by writing schema.json, controller, service and router files directly. Use when the user asks for a content type, collection type, single type, component, dynamic zone, model, field/attribute or relation in Strapi, or edits any schema.json under src/api or src/components.
---

# Strapi 5 content types

Write the files by hand from the templates. Do **not** use `strapi generate` (interactive) and do not rely on the admin Content-Type Builder.

Project rules (see CLAUDE.md): code and comments in English; never edit `types/generated/`, `dist/`, `.strapi/`; never read `.env*`; keep the template generic (add examples only if asked, clearly marked).

## Workflow

1. **Gather requirements.** Name, kind (collection / single / component), fields, relations, `draftAndPublish` (default `true`), i18n (default off). Ask only about what is truly ambiguous (e.g. relation cardinality); use defaults for the rest and state them.
2. **Inspect what exists.** List `src/api/*/content-types/*/schema.json` and `src/components/**/*.json`. Avoid name/uid collisions and reuse existing types as relation targets.
3. **Derive names** (see `reference/naming.md`): `singularName` kebab-case, `pluralName`, `collectionName` snake_case plural, uid `api::<singular>.<singular>`.
4. **Generate files** from `templates/`:
   - `src/api/<name>/content-types/<name>/schema.json`
   - `src/api/<name>/controllers/<name>.ts`
   - `src/api/<name>/services/<name>.ts`
   - `src/api/<name>/routes/<name>.ts`
   - Components: `src/components/<category>/<name>.json` (no controller/service/router).
5. **Relations are two-sided.** If you write `inversedBy` on one schema, edit the target schema to add the matching `mappedBy` attribute (`reference/relations.md`). Unidirectional relations omit both.
6. **Validate**: `node .claude/skills/strapi-content-type/scripts/validate-schema.mjs`, then `npm run build`.
7. **Regenerate types**: `npm run develop` (or `npx strapi ts:generate-types`) updates `types/generated/`. Review the diff, do not hand-edit it.
8. **Report**: what was created/changed and the manual follow-ups:
   - Roles & permissions: Settings → Users & Permissions (Public/Authenticated) must be enabled per action. Do not automate this unless asked.
   - Restart the dev server so the admin picks up the changes.

## Modifying or deleting (destructive)

Strapi syncs the DB schema from `schema.json` on boot.
- **Rename** a field/type = drop + create: data is lost. Warn the user first and propose a SQL migration in `database/migrations/` to copy the data.
- **Remove** a field/type/component drops its column/table on next boot. Confirm with the user before doing it.
- Changing an attribute `type` or making a field `required` on a table with rows can fail or lose data; say so.
- When deleting a type, also remove relations pointing to it from other schemas, and the whole `src/api/<name>/` folder.

## Quick reference

- Attributes, options and validators: `reference/attributes.md`
- Relations: `reference/relations.md`
- Components and dynamic zones: `reference/components.md`
- Naming and uids: `reference/naming.md`

## Common mistakes

- Missing `mappedBy`/`inversedBy` counterpart, or wrong cardinality on the inverse side (inverse of `manyToOne` is `oneToMany`).
- `pluralName` equal to `singularName`, or camelCase/underscore in names (use kebab-case).
- Reserved attribute names (`id`, `documentId`, `createdAt`, `updatedAt`, `publishedAt`, `locale`, ...).
- `uid` field without `targetField`, or pointing at a non-existent field.
- `enumeration` values with spaces/hyphens-leading digits; values must be valid identifiers.
- Component `component` uid written as path instead of `<category>.<name>`.
