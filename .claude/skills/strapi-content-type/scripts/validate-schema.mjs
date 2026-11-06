#!/usr/bin/env node
// Static validator for Strapi 5 schemas. No dependencies.
// Usage: node validate-schema.mjs [projectRoot]
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.argv[2] || process.cwd();
const apiDir = join(root, 'src', 'api');
const compDir = join(root, 'src', 'components');

const TYPES = new Set([
  'string', 'text', 'richtext', 'blocks', 'email', 'password', 'date', 'time',
  'datetime', 'timestamp', 'integer', 'biginteger', 'float', 'decimal', 'json',
  'boolean', 'enumeration', 'uid', 'media', 'relation', 'component', 'dynamiczone',
]);
const RELATIONS = new Set([
  'oneToOne', 'oneToMany', 'manyToOne', 'manyToMany',
  'morphToOne', 'morphToMany', 'morphOne', 'morphMany',
]);
const INVERSE = {
  oneToOne: ['oneToOne'],
  manyToOne: ['oneToMany'],
  oneToMany: ['manyToOne'],
  manyToMany: ['manyToMany'],
};
const RESERVED = new Set([
  'id', 'documentId', 'createdAt', 'updatedAt', 'publishedAt', 'createdBy',
  'updatedBy', 'locale', 'localizations',
]);
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const errors = [];
const warnings = [];
const rel = (p) => relative(root, p).split(sep).join('/');
const err = (file, msg) => errors.push(`${rel(file)}: ${msg}`);
const warn = (file, msg) => warnings.push(`${rel(file)}: ${msg}`);

const isDir = (p) => existsSync(p) && statSync(p).isDirectory();
const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    err(file, `invalid JSON (${e.message})`);
    return null;
  }
};

// ---- Collect content types ----
const types = new Map(); // uid -> { file, schema }
if (isDir(apiDir)) {
  for (const api of readdirSync(apiDir)) {
    const ctDir = join(apiDir, api, 'content-types');
    if (!isDir(ctDir)) continue;
    for (const ct of readdirSync(ctDir)) {
      const file = join(ctDir, ct, 'schema.json');
      if (!existsSync(file)) continue;
      const schema = readJson(file);
      if (!schema) continue;
      const singular = schema.info?.singularName;
      if (!singular) {
        err(file, 'missing info.singularName');
        continue;
      }
      if (ct !== singular) warn(file, `folder "${ct}" differs from singularName "${singular}"`);
      if (api !== singular) warn(file, `api folder "${api}" differs from singularName "${singular}"`);
      types.set(`api::${api}.${singular}`, { file, schema, api });
    }
  }
}

// ---- Collect components ----
const components = new Map(); // uid -> { file, schema }
if (isDir(compDir)) {
  for (const cat of readdirSync(compDir)) {
    const catDir = join(compDir, cat);
    if (!isDir(catDir)) continue;
    for (const f of readdirSync(catDir)) {
      if (!f.endsWith('.json')) continue;
      const file = join(catDir, f);
      const schema = readJson(file);
      if (!schema) continue;
      components.set(`${cat}.${f.slice(0, -5)}`, { file, schema });
    }
  }
}

const externalOk = (uid) => uid.startsWith('plugin::') || uid.startsWith('admin::');

// ---- Validate content types ----
const pluralSeen = new Map();
for (const [uid, { file, schema }] of types) {
  const { kind, collectionName, info = {} } = schema;
  if (kind !== 'collectionType' && kind !== 'singleType') err(file, `kind must be collectionType or singleType (got "${kind}")`);
  if (!collectionName) err(file, 'missing collectionName');
  if (!info.pluralName) err(file, 'missing info.pluralName');
  if (!info.displayName) err(file, 'missing info.displayName');
  if (info.singularName && !KEBAB.test(info.singularName)) err(file, `singularName "${info.singularName}" must be kebab-case`);
  if (info.pluralName && !KEBAB.test(info.pluralName)) err(file, `pluralName "${info.pluralName}" must be kebab-case`);
  if (info.singularName && info.singularName === info.pluralName) err(file, 'singularName and pluralName must differ');
  if (info.pluralName) {
    if (pluralSeen.has(info.pluralName)) err(file, `pluralName "${info.pluralName}" also used by ${rel(pluralSeen.get(info.pluralName))}`);
    pluralSeen.set(info.pluralName, file);
  }
  if (!schema.attributes || typeof schema.attributes !== 'object') err(file, 'missing attributes object');
  validateAttributes(file, uid, schema.attributes || {});
}

for (const [uid, { file, schema }] of components) {
  if (!schema.collectionName) err(file, 'missing collectionName');
  if (!schema.info?.displayName) err(file, 'missing info.displayName');
  validateAttributes(file, uid, schema.attributes || {});
}

function validateAttributes(file, ownerUid, attrs) {
  for (const [name, attr] of Object.entries(attrs)) {
    const at = `${ownerUid}.${name}`;
    if (RESERVED.has(name)) err(file, `${at}: reserved attribute name`);
    if (!attr || typeof attr !== 'object') {
      err(file, `${at}: attribute must be an object`);
      continue;
    }
    if (!TYPES.has(attr.type)) {
      err(file, `${at}: unknown type "${attr.type}"`);
      continue;
    }
    switch (attr.type) {
      case 'enumeration':
        if (!Array.isArray(attr.enum) || attr.enum.length === 0) err(file, `${at}: enumeration needs a non-empty "enum" array`);
        else if (attr.default !== undefined && !attr.enum.includes(attr.default)) err(file, `${at}: default not in enum`);
        break;
      case 'uid':
        if (attr.targetField && !(attrs[attr.targetField])) err(file, `${at}: targetField "${attr.targetField}" does not exist`);
        if (!attr.targetField) warn(file, `${at}: uid without targetField`);
        break;
      case 'component':
        if (!attr.component) err(file, `${at}: missing "component"`);
        else if (!components.has(attr.component)) err(file, `${at}: component "${attr.component}" not found`);
        break;
      case 'dynamiczone':
        if (!Array.isArray(attr.components) || attr.components.length === 0) err(file, `${at}: dynamiczone needs "components" array`);
        else for (const c of attr.components) if (!components.has(c)) err(file, `${at}: component "${c}" not found`);
        break;
      case 'relation':
        validateRelation(file, ownerUid, name, attr);
        break;
    }
  }
}

function validateRelation(file, ownerUid, name, attr) {
  const at = `${ownerUid}.${name}`;
  if (!RELATIONS.has(attr.relation)) {
    err(file, `${at}: invalid relation "${attr.relation}"`);
    return;
  }
  if (attr.relation.startsWith('morph')) return;
  if (!attr.target) {
    err(file, `${at}: missing target`);
    return;
  }
  const target = types.get(attr.target);
  if (!target) {
    if (!externalOk(attr.target)) err(file, `${at}: target "${attr.target}" not found`);
    return;
  }
  if (attr.inversedBy && attr.mappedBy) err(file, `${at}: use only one of inversedBy / mappedBy`);
  const key = attr.inversedBy ? 'inversedBy' : attr.mappedBy ? 'mappedBy' : null;
  if (!key) return;
  const other = target.schema.attributes?.[attr[key]];
  if (!other) {
    err(file, `${at}: ${key} "${attr[key]}" does not exist on ${attr.target}`);
    return;
  }
  if (other.type !== 'relation') {
    err(file, `${at}: ${attr.target}.${attr[key]} is not a relation`);
    return;
  }
  if (other.target !== ownerUid) err(file, `${at}: counterpart ${attr.target}.${attr[key]} targets "${other.target}", expected "${ownerUid}"`);
  const backKey = key === 'inversedBy' ? 'mappedBy' : 'inversedBy';
  if (other[backKey] !== name) err(file, `${at}: counterpart must set ${backKey}: "${name}"`);
  const expected = INVERSE[attr.relation];
  if (expected && !expected.includes(other.relation)) {
    err(file, `${at}: ${attr.relation} must pair with ${expected.join('/')} (counterpart is ${other.relation})`);
  }
}

// ---- Report ----
for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
const relCount = [...types.values()].reduce(
  (n, { schema }) => n + Object.values(schema.attributes || {}).filter((a) => a?.type === 'relation').length, 0);
console.log(
  `${errors.length ? 'FAIL' : 'OK'}: ${types.size} content types, ${components.size} components, ${relCount} relations, ${errors.length} errors, ${warnings.length} warnings`,
);
process.exit(errors.length ? 1 : 0);
