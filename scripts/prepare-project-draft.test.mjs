import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { prepareProjectDraft } from './prepare-project-draft.mjs';

async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'portfolio-story-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const input = join(dir, 'export.json'), output = join(dir, 'draft.json');
  const content = {
    profile: { name: 'Unsaved profile edit' },
    navLinks: [{ label: 'Custom label', target: '#work' }],
    projects: [
      { title: 'Different project', caseStudy: { overview: 'Keep this edit' } },
      { title: 'Custom storefront title', url: 'https://ngcommerce.rshossain.me/', slug: 'stable-shop-link', index: '09', images: [{ src: '/custom.webp', alt: 'Custom caption' }], palette: { base: '#123456' }, caseStudy: { role: 'Existing', customNote: 'Retain extension' } },
      { title: 'Renamed library', url: 'https://www.styloviz.dev/', images: [], caseStudy: { role: 'Existing' } },
    ],
    editorMetadata: { keep: true },
  };
  await writeFile(input, JSON.stringify(content));
  return { content, input, output };
}

test('merges the selected story by stable URL while preserving unpublished edits and media', async t => {
  const { content, input, output } = await fixture(t);
  await prepareProjectDraft('ngCommerce', input, output);
  const merged = JSON.parse(await readFile(output, 'utf8'));
  assert.equal(merged.projects[1].title, 'Custom storefront title');
  assert(merged.projects[1].caseStudy.problem);
  assert(merged.projects[1].caseStudy.result);
  assert.equal(merged.projects[1].caseStudy.customNote, 'Retain extension');
  for (const key of ['images', 'slug', 'url', 'index', 'palette']) assert.deepEqual(merged.projects[1][key], content.projects[1][key]);
  for (const key of ['profile', 'navLinks', 'editorMetadata']) assert.deepEqual(merged[key], content[key]);
  assert.deepEqual(merged.projects[0], content.projects[0]);
  assert.deepEqual(merged.projects[2], content.projects[2]);
  assert.deepEqual(JSON.parse(await readFile(input, 'utf8')), content);
});

test('rejects ambiguous project matches without writing output', async t => {
  const { content, input, output } = await fixture(t);
  content.projects.push({ title: 'ngCommerce' });
  await writeFile(input, JSON.stringify(content));
  await assert.rejects(prepareProjectDraft('ngCommerce', input, output), /exactly one/);
  await assert.rejects(readFile(output), { code: 'ENOENT' });
});

test('refuses to overwrite an existing output or the input export', async t => {
  const { input, output } = await fixture(t);
  await writeFile(output, 'keep existing output');
  const before = await readFile(input, 'utf8');
  await assert.rejects(prepareProjectDraft('ngCommerce', input, output), { code: 'EEXIST' });
  await assert.rejects(prepareProjectDraft('ngCommerce', input, input), /separate output/);
  assert.equal(await readFile(output, 'utf8'), 'keep existing output');
  assert.equal(await readFile(input, 'utf8'), before);
});

test('rejects unavailable project stories and invalid exports', async t => {
  const { input, output } = await fixture(t);
  await assert.rejects(prepareProjectDraft('Unknown portfolio project', input, output), /authored/);
  await writeFile(input, '{"projects":[]}');
  await assert.rejects(prepareProjectDraft('ngCommerce', input, output), /complete portfolio export/);
  await assert.rejects(readFile(output), { code: 'ENOENT' });
});

test('retains the original Styloviz CLI command', async t => {
  const { content, input, output } = await fixture(t);
  await promisify(execFile)(process.execPath, [resolve('scripts/prepare-styloviz-draft.mjs'), input, output]);
  const merged = JSON.parse(await readFile(output, 'utf8'));
  assert(merged.projects[2].caseStudy.problem);
  assert.deepEqual(merged.projects[1], content.projects[1]);
});


test('merges an authored project without a live URL by its exact title', async t => {
  const { content, input, output } = await fixture(t);
  const project = { title: 'Nop Kalles', slug: 'my-fashion-project', images: [{ src: '/retained.jpg', alt: 'Owner caption' }], caseStudy: { customNote: 'Owner note' } };
  content.projects.push(project);
  await writeFile(input, JSON.stringify(content));
  await prepareProjectDraft('Nop Kalles', input, output);
  const merged = JSON.parse(await readFile(output, 'utf8'));
  const updated = merged.projects.at(-1);
  assert(updated.caseStudy.problem);
  assert(updated.caseStudy.decisions.length);
  assert(updated.caseStudy.result);
  assert.equal(updated.slug, project.slug);
  assert.deepEqual(updated.images, project.images);
  assert.equal(updated.caseStudy.customNote, 'Owner note');
  assert.deepEqual(merged.projects.slice(0, -1), content.projects.slice(0, -1));
});
