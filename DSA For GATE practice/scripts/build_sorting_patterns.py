#!/usr/bin/env python3
"""Build the five PDFs from prose sources and the tested reference functions."""
from pathlib import Path
import re
import sys
import zipfile

import build_module_pdf as pdf
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Spacer
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate

ROOT = Path(__file__).resolve().parents[1] / "month-01"
pdf.STYLES["body"].allowWidows = 0
pdf.STYLES["body"].allowOrphans = 0
pdf.STYLES["code"].fontSize = 8.2
pdf.STYLES["code"].leading = 10.6

# The shared renderer's body-colored Paragraphs override table header color.
original_table = pdf.parse_table
def readable_table(lines):
    table = original_table(lines)
    header = ParagraphStyle("SprintTableHeader", parent=pdf.STYLES["small"],
                            textColor=pdf.colors.white, fontName=pdf.BOLD_FONT)
    for index, cell in enumerate(table._cellvalues[0]):
        table._cellvalues[0][index] = Paragraph(cell.text, header)
    return table
pdf.parse_table = readable_table


def build(day):
    source = ROOT / f"sorting-patterns-day-{day:02}.md"
    prose = source.read_text()
    for suffix, label in [("py", "Python 3"), ("c", "C11")]:
        code = (ROOT / "sorting-patterns-code" / f"day{day:02}.{suffix}").read_text()
        prose += f"\n\n## {label} reference functions\n\n"
        # Separate top-level functions keep code blocks within one page.
        blocks = re.split(r"\n\n+(?=\S)", code.strip())
        for block in blocks:
            prose += f"```{suffix}\n{block}\n```\n\n"
    output = source.with_suffix(".pdf")
    pdf.MODULE_FOOTER = f"Aleph | Priyanka Platinum | Sorting & Patterns | Day {day}"
    doc = BaseDocTemplate(
        str(output), pagesize=pdf.A4,
        title=f"Sorting and Patterns - Day {day}", author="Aleph",
        leftMargin=pdf.MARGIN_X, rightMargin=pdf.MARGIN_X,
        topMargin=pdf.MARGIN_TOP, bottomMargin=pdf.MARGIN_BOTTOM,
    )
    frame = Frame(pdf.MARGIN_X, pdf.MARGIN_BOTTOM,
                  pdf.PAGE_W - 2 * pdf.MARGIN_X,
                  pdf.PAGE_H - pdf.MARGIN_TOP - pdf.MARGIN_BOTTOM, id="main")
    doc.addPageTemplates([PageTemplate(id="module", frames=[frame],
                                      onPage=pdf.decorate_page)])
    # Paragraph styles already supply spacing. Extra blank-line spacers can
    # strand headings or a final line on an otherwise empty page.
    story = [item for item in pdf.markdown_story(prose)
             if not (isinstance(item, Spacer) and item.height <= 3)]
    doc.build(story)
    print(output)


if __name__ == "__main__":
    for number in map(int, sys.argv[1:] or range(1, 6)):
        build(number)
    with zipfile.ZipFile(ROOT / "sorting-patterns-code.zip", "w",
                         compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted((ROOT / "sorting-patterns-code").iterdir()):
            if path.suffix in {".py", ".c", ".md"}:
                archive.write(path, f"sorting-patterns-code/{path.name}")
