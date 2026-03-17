#!/usr/bin/env python3
"""
Splits the EMERGENT Framework wiki text file into individual markdown files.

Usage:
  1. Export Google Doc as Plain Text (.txt)
  2. Save as wiki-source.txt in this directory
  3. Run: python3 split-wiki.py
"""

import os
import re
import sys

DIMENSION_SLUGS = {
    'Resonant Purpose': 'resonant-purpose',
    'Embedded Strategy': 'embedded-strategy',
    'Momentum through Work': 'momentum-through-work',
    'Evolving Service': 'evolving-service',
    'Generative Capacity': 'generative-capacity',
    'Enacted Culture': 'enacted-culture',
    'Narrative Connections': 'narrative-connections',
    'Tuned to Change': 'tuned-to-change',
}

SKIP_DIMENSIONS = {'resonant-purpose', 'embedded-strategy'}

SECTION_SLUGS = {
    'What it means': 'what-it-means',
    'Recognising patterns': 'recognising-patterns',
    'The wider effect': 'the-wider-effect',
    'Cultivating conditions': 'cultivating-conditions',
    'Explore it yourself': 'explore-it-yourself',
}

def clean_text(text):
    text = text.replace('\\-', '-')
    text = text.replace('\u2013', '-')
    text = text.replace('\u2014', '-')
    text = text.replace('\u2018', "'")
    text = text.replace('\u2019', "'")
    text = text.replace('\u201c', '"')
    text = text.replace('\u201d', '"')
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    return text

def split_wiki(text, include_all=False):
    text = clean_text(text)
    results = {}

    dim_pattern = re.compile(r'^# \*{0,2}(.+?)\*{0,2}\s*$', re.MULTILINE)
    dim_matches = list(dim_pattern.finditer(text))

    for i, match in enumerate(dim_matches):
        dim_name = match.group(1).strip()
        dim_slug = None
        for name, slug in DIMENSION_SLUGS.items():
            if name.lower() == dim_name.lower():
                dim_slug = slug
                break
        if not dim_slug:
            continue
        if not include_all and dim_slug in SKIP_DIMENSIONS:
            continue

        start = match.end()
        end = dim_matches[i + 1].start() if i + 1 < len(dim_matches) else len(text)
        dim_text = text[start:end]

        sec_pattern = re.compile(r'^## \*{0,2}(.+?)\*{0,2}\s*$', re.MULTILINE)
        sec_matches = list(sec_pattern.finditer(dim_text))

        sections = {}
        for j, sec_match in enumerate(sec_matches):
            sec_name = sec_match.group(1).strip()
            sec_slug = None
            for name, slug in SECTION_SLUGS.items():
                if name.lower() == sec_name.lower():
                    sec_slug = slug
                    break
            if not sec_slug:
                continue

            sec_start = sec_match.end()
            sec_end = sec_matches[j + 1].start() if j + 1 < len(sec_matches) else len(dim_text)
            content = dim_text[sec_start:sec_end].strip()
            content = re.sub(r'\n---+\s*$', '', content).strip()
            if content:
                sections[sec_slug] = content

        if sections:
            results[dim_slug] = sections
    return results

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    wiki_file = os.path.join(script_dir, 'wiki-source.txt')
    content_dir = os.path.join(script_dir, 'content')
    include_all = '--all' in sys.argv

    if not os.path.exists(wiki_file):
        print('Error: wiki-source.txt not found.')
        print('')
        print('To create it:')
        print('  1. Open Google Doc "3b. EMERGENT Framework - Wiki Content"')
        print('  2. File > Download > Plain Text (.txt)')
        print('  3. Save as wiki-source.txt in this directory')
        sys.exit(1)

    with open(wiki_file, 'r', encoding='utf-8') as f:
        text = f.read()

    print(f'Read wiki source: {len(text):,} characters')
    print('')

    results = split_wiki(text, include_all=include_all)
    if not results:
        print('No dimension content found. Check the file format.')
        sys.exit(1)

    total = 0
    for dim_slug in sorted(results.keys()):
        sections = results[dim_slug]
        dim_dir = os.path.join(content_dir, dim_slug)
        os.makedirs(dim_dir, exist_ok=True)
        print(f'{dim_slug}:')
        for sec_slug in ['what-it-means', 'recognising-patterns', 'the-wider-effect',
                         'cultivating-conditions', 'explore-it-yourself']:
            if sec_slug not in sections:
                print(f'  WARNING: {sec_slug} not found!')
                continue
            filepath = os.path.join(dim_dir, f'{sec_slug}.md')
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(sections[sec_slug] + '\n')
            words = len(sections[sec_slug].split())
            print(f'  {sec_slug}.md - {words} words')
            total += 1
        print('')

    print(f'Created {total} content files')
    if not include_all:
        print('(Skipped Resonant Purpose and Embedded Strategy - already in Sanity)')

if __name__ == '__main__':
    main()
