# Naming and uids

Given a display name like "Blog Post":

| Item | Value | Rule |
|---|---|---|
| `singularName` | `blog-post` | kebab-case, lowercase |
| `pluralName` | `blog-posts` | kebab-case plural, must differ from singular |
| `collectionName` | `blog_posts` | snake_case plural (DB table) |
| `displayName` | `Blog Post` | free text for the admin |
| uid | `api::blog-post.blog-post` | `api::<singular>.<singular>` |
| folder | `src/api/blog-post/` | = singularName |
| REST path | `/api/blog-posts` | collection: pluralName; single type: singularName |
| Attribute names | `camelCase` | avoid reserved names |

- Single types: `"kind": "singleType"`, `collectionName` is the singular snake_case (`home_pages`-style plural is also accepted; be consistent).
- Irregular plurals: set `pluralName` explicitly (`category` → `categories`, `person` → `people`).
- Components: uid `<category>.<name>`, table `components_<category>_<names>`.
- Never reuse an existing uid or table name.
