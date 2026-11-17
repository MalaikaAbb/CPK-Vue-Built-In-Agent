"""
[harness] Builds the code-block catalog that write-doc-files.py reads.

For every page in ../doc-snapshot/pages/ (the .md exports /doc-sync stores):
  1. extract each fenced block, dedent it, strip `[!code highlight]` markers
     (the rendered page strips them too);
  2. fetch the RENDERED page and flag each block `rendered` if its code
     appears there (whitespace-insensitive). For the built-in agent, the
     rendered Vue pages drop every Python block the .md still carries.

Usage: python3 -I scripts/build-doc-catalog.py <out.json>
"""
import glob, html, json, os, re, sys, textwrap, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
PAGES = os.path.join(HERE, "..", "..", "doc-snapshot", "pages")

def norm(s):
    return re.sub(r"\s+", "", s)

def rendered_text(url):
    req = urllib.request.Request(url, headers={"user-agent": "copilotkit-harness-doc-catalog"})
    page = urllib.request.urlopen(req, timeout=20).read().decode("utf-8")
    out = []
    for block in re.findall(r"<pre[^>]*>(.*?)</pre>", page, re.S):
        out.append(html.unescape(re.sub(r"<[^>]+>", "", block)))
    return norm("\n".join(out))

catalog = {}
for md in sorted(glob.glob(os.path.join(PAGES, "*.md"))):
    slug = os.path.basename(md)[:-3]                      # vue__shared-state__streaming
    key = "index" if slug == "vue" else slug.removeprefix("vue__")
    url = "https://docs.copilotkit.ai/" + slug.replace("__", "/")
    rendered = rendered_text(url)
    lines = open(md).read().split("\n")
    blocks, i = [], 0
    while i < len(lines):
        m = re.match(r"^(\s*)(`{3,}|~{3,})(\S*)\s*(.*)$", lines[i])   # backtick AND tilde fences
        if m:
            _, fence, lang, meta = m.groups()
            title = re.search(r'title="([^"]*)"', meta)
            body = []
            i += 1
            while i < len(lines) and not re.match(r"^\s*" + fence + r"\s*$", lines[i]):
                body.append(lines[i])
                i += 1
            code = textwrap.dedent("\n".join(body))
            code = re.sub(r"[ \t]*<!-- \[!code [^\]]*\] -->\n", "", code)
            code = re.sub(r"[ \t]*// \[!code [^\]]*\]", "", code)
            code = re.sub(r"[ \t]*\{/\* \[!code [^\]]*\] \*/\}", "", code)
            blocks.append({"lang": lang, "title": title.group(1) if title else None,
                           "code": code, "rendered": norm(code) in rendered})
        i += 1
    catalog[key] = blocks
    print(f"{key}: {len(blocks)} blocks, {sum(not b['rendered'] for b in blocks)} not on the rendered page")

json.dump(catalog, open(sys.argv[1], "w"), indent=1)
