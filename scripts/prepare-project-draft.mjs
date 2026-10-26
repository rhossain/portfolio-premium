// Node >=22.22.3. Local content preparation only; no network requests.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PROJECTS } from '../src/app/content.ts';

export async function prepareProjectDraft(title, input, output) {
  if (!title || !input || !output) throw new Error('Provide a project title, a fresh CMS export and a new output path.');
  if (resolve(input) === resolve(output)) throw new Error('Choose a separate output file to preserve the original export.');
  const story = PROJECTS.find(project => project.title === title);
  if (!story?.caseStudy.problem || !story.caseStudy.decisions?.length || !story.caseStudy.result) throw new Error('Choose a project with an authored problem, decisions and result.');
  const draft = JSON.parse(await readFile(input, 'utf8'));
  if (!draft.profile || !Array.isArray(draft.projects)) throw new Error('Input must be a complete portfolio export from CMS Settings.');
  const normalizedUrl = value => {
    try {
      const url = new URL(value);
      url.hostname = url.hostname.replace(/^www\./, '');
      return url.href.replace(/\/+$/, '');
    } catch { return ''; }
  };
  const matches = draft.projects.filter(project => project.title === title || (story.url && normalizedUrl(project.url) === normalizedUrl(story.url)));
  if (matches.length !== 1) throw new Error(`Expected exactly one ${title} project; no file was written.`);
  const project = matches[0];
  project.description = story.description;
  project.stack = [...story.stack];
  project.caseStudy = { ...project.caseStudy, ...structuredClone(story.caseStudy) };
  // Retain ordering, media, URLs, slugs, styling and every unrelated section.
  await writeFile(output, JSON.stringify(draft, null, 2) + '\n', { flag: 'wx' });
  return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [title, input, output, ...extra] = process.argv.slice(2);
  try {
    if (extra.length) throw new Error('Too many arguments.');
    await prepareProjectDraft(title, input, output);
    console.log(`Prepared ${output}. Import in CMS Settings, preview, then save the draft.`);
  } catch (error) {
    console.error(error.message);
    console.error('Usage: node scripts/prepare-project-draft.mjs "Project title" <fresh-cms-export.json> <new-draft.json>');
    process.exitCode = 1;
  }
}
