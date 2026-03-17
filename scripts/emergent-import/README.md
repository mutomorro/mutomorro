# EMERGENT Framework Content Import

Last updated: 14 March 2026, 21:30 GMT

## What this does

Imports the remaining 30 EMERGENT Framework wiki articles into Sanity. The wiki content gets split from a single Google Doc export into 30 individual markdown files, converted to Portable Text, and patched into the existing dimensionArticle documents.

Resonant Purpose and Embedded Strategy are skipped - they already have content in Sanity.

## What you need

- The Google Doc "3b. EMERGENT Framework - Wiki Content"
- A Sanity API token with editor access
- Python 3 (for the splitter)
- Node.js (for the import)

## Steps

### 1. Copy this folder into your project

```bash
cp -r emergent-import ~/Projects/mutomorro/scripts/emergent-import
cd ~/Projects/mutomorro/scripts/emergent-import
```

### 2. Get the wiki content as a text file

The splitter needs the content with markdown formatting (# headings, **bold**, * bullets). Try this first:

- Open "3b. EMERGENT Framework - Wiki Content" in Google Docs
- File > Download > Plain Text (.txt)
- Move the downloaded file into this folder and rename it:

```bash
mv ~/Downloads/*.txt wiki-source.txt
```

Then open wiki-source.txt in a text editor. If you can see `# **Resonant Purpose**` style headings, you're good. If the headings are just plain text with no # or ** markers, the Google Doc uses native formatting instead of literal markdown. In that case, try File > Download > Web Page (.html) and let me know - I can adjust the splitter to handle HTML instead.

### 3. Run the splitter

```bash
python3 split-wiki.py
```

This creates 30 markdown files (5 per dimension, 6 dimensions) in the content/ directories. Check the output - it should show word counts for each file and no warnings.

### 4. Get a Sanity API token

- Go to https://www.sanity.io/manage/project/c6pg4t4h/api#tokens
- Create a new token with Editor access
- Copy it

### 5. Run the import

```bash
export SANITY_TOKEN=your_token_here
node import-emergent-content.js
```

To test with a single dimension first:

```bash
node import-emergent-content.js momentum-through-work
```

### 6. Review in Sanity Studio

All content is patched as drafts. Open Sanity Studio, check the articles look right, then publish.

## Files

- `split-wiki.py` - Splits the Google Doc export into individual markdown files
- `md-to-portable-text.js` - Converts markdown to Sanity Portable Text format
- `import-emergent-content.js` - Reads markdown files, converts them, and patches Sanity
- `package.json` - ES module config (no dependencies needed)
- `content/` - Markdown files per dimension (created by the splitter)

## Formatting rules the splitter handles

- H1 headings (`# **Name**`) identify dimensions
- H2 headings (`## **Section**`) identify the 5 sections per dimension
- Smart quotes, en dashes, em dashes are converted to straight equivalents
- Google Docs escaped dashes (`\-`) are cleaned up

## Troubleshooting

**Splitter finds no content:** Check that the Google Doc export has headings formatted as `# **Dimension Name**` and `## **Section Name**`. If Google Docs strips the markdown formatting on export, the splitter may need adjusting.

**Import skips articles:** If an article already has body content in Sanity, it gets skipped. This is intentional - it won't overwrite existing content.

**Wrong dimension articles patched:** The script matches by dimension slug + section type, not by document ID. If the Sanity data has unexpected structure, check the article map output.
