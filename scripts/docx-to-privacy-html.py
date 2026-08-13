#!/usr/bin/env python3
import re
import zipfile
import xml.etree.ElementTree as ET
from html import escape
from pathlib import Path

DOCX = Path("/Users/shubhamsingh/Downloads/Signet_Employment_Hub_Privacy_Policy_Final.docx")
OUT = Path(__file__).resolve().parents[1] / "src/content/privacyPolicy.html"
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def para_text(p):
    return "".join(t.text or "" for t in p.iter(f"{W}t")).strip()


def main():
    with zipfile.ZipFile(DOCX) as z:
        root = ET.fromstring(z.read("word/document.xml"))

    lines = [para_text(p) for p in root.findall(f".//{W}p")]
    lines = [l for l in lines if l and l != "━" * 34]

    section_re = re.compile(r"^(\d+)\.\s+(.+)$")
    subsection_re = re.compile(r"^(\d+\.\d+)\s+(.+)$")

    contents_end = next(
        i for i, line in enumerate(lines) if line == "1. About this Privacy Policy" and i > 40
    )

    label_set = {
        "Legal entity",
        "Registered business name",
        "Business name",
        "ABN",
        "Principal place of business",
        "Website",
        "Privacy email",
        "Support email",
        "Privacy contact",
        "Privacy Officer",
        "Address",
        "Account deletion",
    }

    html = []
    in_ul = False
    contents_done = False

    def close_ul():
        nonlocal in_ul
        if in_ul:
            html.append("</ul>")
            in_ul = False

    def add_block(tag, text, attrs=""):
        close_ul()
        html.append(f"<{tag}{attrs}>{escape(text)}</{tag}>")

    def add_li(text):
        nonlocal in_ul
        if not in_ul:
            html.append("<ul>")
            in_ul = True
        html.append(f"<li>{escape(text)}</li>")

    i = 0
    while i < len(lines):
        line = lines[i]

        if line == "SIGNET EMPLOYMENT HUB":
            add_block("h1", line)
            i += 1
            continue
        if line == "Privacy Policy":
            add_block("h2", line)
            i += 1
            continue
        if i == 2:
            close_ul()
            html.append(f"<p><em>{escape(line)}</em></p>")
            i += 1
            continue

        if line == "Contents" and not contents_done:
            contents_done = True
            toc = []
            i += 1
            while i < contents_end and section_re.match(lines[i]):
                toc.append(section_re.match(lines[i]))
                i += 1
            toc.sort(key=lambda m: int(m.group(1)))
            html.append("<h3>Contents</h3><ol>")
            for m in toc:
                html.append(f"<li>{escape(m.group(2))}</li>")
            html.append("</ol>")
            continue

        if i < contents_end:
            if line.startswith("Effective date:") or line == "Version 1.0":
                add_block("p", line)
                i += 1
                continue
            if line.startswith("Prepared for publication"):
                add_block("p", line)
                i += 1
                continue
            if line in label_set and i + 1 < len(lines):
                nxt = lines[i + 1]
                if nxt not in label_set and not section_re.match(nxt):
                    close_ul()
                    html.append(f"<p><strong>{escape(line)}</strong><br>{escape(nxt)}</p>")
                    i += 2
                    continue

        sub = subsection_re.match(line)
        if sub:
            add_block("h4", f"{sub.group(1)} {sub.group(2)}")
            i += 1
            continue

        sec = section_re.match(line)
        if sec and i >= contents_end:
            add_block("h3", f"{sec.group(1)}. {sec.group(2)}")
            i += 1
            continue

        if line in label_set and i + 1 < len(lines):
            nxt = lines[i + 1]
            if nxt not in label_set and not section_re.match(nxt) and not subsection_re.match(nxt):
                close_ul()
                html.append(f"<p><strong>{escape(line)}</strong><br>{escape(nxt)}</p>")
                i += 2
                continue

        if line.endswith(";"):
            add_li(line.rstrip(";"))
            i += 1
            continue

        if line == "END OF PRIVACY POLICY":
            close_ul()
            html.append(f"<p><em>{escape(line)}</em></p>")
            i += 1
            continue

        add_block("p", line)
        i += 1

    close_ul()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n".join(html), encoding="utf-8")
    print(f"Wrote {OUT} ({len(html)} blocks)")


if __name__ == "__main__":
    main()
