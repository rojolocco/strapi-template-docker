# Relations

```json
"author": {
  "type": "relation",
  "relation": "manyToOne",
  "target": "api::author.author",
  "inversedBy": "articles"
}
```

`target` is a content-type uid (`api::<singular>.<singular>`, or `plugin::users-permissions.user`).

## Cardinality and inverse

| Owning side | Inverse side | Owning side key | Inverse side key |
|---|---|---|---|
| `oneToOne` | `oneToOne` | `inversedBy` | `mappedBy` |
| `manyToOne` | `oneToMany` | `inversedBy` | `mappedBy` |
| `manyToMany` | `manyToMany` | `inversedBy` | `mappedBy` |
| `oneToMany` (unidirectional) | — | none | — |
| `oneToOne`/`manyToOne`/`manyToMany` unidirectional | — | none | — |

The owning side holds `inversedBy: "<attr on target>"`; the inverse side holds `mappedBy: "<attr on owner>"`. Both names must match the attribute names on the other schema.

## Example: Author 1:N Article

`article/schema.json`
```json
"author": { "type": "relation", "relation": "manyToOne", "target": "api::author.author", "inversedBy": "articles" }
```
`author/schema.json`
```json
"articles": { "type": "relation", "relation": "oneToMany", "target": "api::article.article", "mappedBy": "author" }
```

## Example: Article N:N Category

`article`: `"categories": { "type":"relation","relation":"manyToMany","target":"api::category.category","inversedBy":"articles" }`
`category`: `"articles": { "type":"relation","relation":"manyToMany","target":"api::article.article","mappedBy":"categories" }`

## Polymorphic

`morphToOne`, `morphToMany`, `morphOne`, `morphMany` exist but are rarely needed; prefer components or dynamic zones.

## Notes

- Draft & publish must match sensibly across related types; relations to a published-only type from a draft type work but can surprise users.
- Deleting a type requires removing relations that target it.
