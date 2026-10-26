// Retain the original command while sharing the safe project merge workflow.
import { prepareProjectDraft } from './prepare-project-draft.mjs';
const [input, output, ...extra] = process.argv.slice(2);
try {
  if (extra.length) throw new Error('Too many arguments.');
  await prepareProjectDraft('Styloviz', input, output);
  console.log(`Prepared ${output}. Import in CMS Settings, preview, then save the draft.`);
} catch (error) {
  console.error(error.message);
  console.error('Usage: node scripts/prepare-styloviz-draft.mjs <fresh-cms-export.json> <new-draft.json>');
  process.exitCode = 1;
}
