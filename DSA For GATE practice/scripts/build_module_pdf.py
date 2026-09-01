#!/usr/bin/env python3
from pathlib import Path
import re
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, PageBreak,
    KeepTogether, Preformatted, Table, TableStyle, HRFlowable
)

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "month-01" / "day-01-searching-sorting.md"

PAGE_W, PAGE_H = A4
MARGIN_X = 17 * mm
MARGIN_TOP = 16 * mm
MARGIN_BOTTOM = 17 * mm

INK = colors.HexColor("#172033")
MUTED = colors.HexColor("#596579")
NAVY = colors.HexColor("#183B66")
BLUE = colors.HexColor("#2563A6")
PALE_BLUE = colors.HexColor("#EAF3FB")
PALE_GOLD = colors.HexColor("#FFF6D9")
GOLD = colors.HexColor("#E1A928")
GRID = colors.HexColor("#CBD5E1")
CODE_BG = colors.HexColor("#F3F6F9")
MODULE_FOOTER = "DSA For GATE Practice"


def register_fonts():
    candidates = [
        ("Body", "/System/Library/Fonts/Supplemental/Arial.ttf"),
        ("Body-Bold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
        ("Mono", "/System/Library/Fonts/Menlo.ttc"),
    ]
    for name, path in candidates:
        try:
            pdfmetrics.registerFont(TTFont(name, path))
        except Exception:
            pass


register_fonts()
BODY_FONT = "Body" if "Body" in pdfmetrics.getRegisteredFontNames() else "Helvetica"
BOLD_FONT = "Body-Bold" if "Body-Bold" in pdfmetrics.getRegisteredFontNames() else "Helvetica-Bold"
MONO_FONT = "Courier"


styles = getSampleStyleSheet()
STYLES = {
    "title": ParagraphStyle("TitleCustom", fontName=BOLD_FONT, fontSize=25, leading=29, textColor=NAVY, alignment=TA_CENTER, spaceAfter=8),
    "subtitle": ParagraphStyle("Subtitle", fontName=BODY_FONT, fontSize=11, leading=15, textColor=MUTED, alignment=TA_CENTER, spaceAfter=15),
    "h1": ParagraphStyle("H1Custom", fontName=BOLD_FONT, fontSize=18, leading=22, textColor=NAVY, spaceBefore=13, spaceAfter=7, keepWithNext=True),
    "h2": ParagraphStyle("H2Custom", fontName=BOLD_FONT, fontSize=14, leading=18, textColor=BLUE, spaceBefore=10, spaceAfter=5, keepWithNext=True),
    "h3": ParagraphStyle("H3Custom", fontName=BOLD_FONT, fontSize=11.5, leading=15, textColor=INK, spaceBefore=7, spaceAfter=4, keepWithNext=True),
    "body": ParagraphStyle("BodyCustom", fontName=BODY_FONT, fontSize=9.4, leading=13.2, textColor=INK, spaceAfter=5),
    "bullet": ParagraphStyle("BulletCustom", fontName=BODY_FONT, fontSize=9.2, leading=12.8, leftIndent=12, firstLineIndent=-7, bulletIndent=4, textColor=INK, spaceAfter=2.5),
    "quote": ParagraphStyle("QuoteCustom", fontName=BOLD_FONT, fontSize=10, leading=14, leftIndent=10, rightIndent=8, borderColor=GOLD, borderWidth=0, borderPadding=7, backColor=PALE_GOLD, textColor=INK, spaceBefore=5, spaceAfter=8),
    "code": ParagraphStyle("CodeCustom", fontName=MONO_FONT, fontSize=7.25, leading=9.4, leftIndent=5, rightIndent=5, borderPadding=7, backColor=CODE_BG, textColor=colors.HexColor("#14213D"), spaceBefore=4, spaceAfter=7),
    "small": ParagraphStyle("Small", fontName=BODY_FONT, fontSize=7.7, leading=10.2, textColor=MUTED),
}


def inline(text):
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"`([^`]+)`", r'<font name="Courier" backColor="#F1F5F9">\1</font>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"\*([^*]+)\*", r"<i>\1</i>", text)
    return text


def parse_table(lines):
    rows = []
    for line in lines:
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if all(re.fullmatch(r":?-{3,}:?", cell.replace(" ", "")) for cell in cells):
            continue
        rows.append([Paragraph(inline(cell), STYLES["small"]) for cell in cells])
    if not rows:
        return Spacer(1, 1)
    col_width = (PAGE_W - 2 * MARGIN_X) / len(rows[0])
    table = Table(rows, colWidths=[col_width] * len(rows[0]), repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), BOLD_FONT),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.35, GRID),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return table


def markdown_story(text):
    lines = text.splitlines()
    story = []
    i = 0
    first_h1 = True
    while i < len(lines):
        raw = lines[i]
        line = raw.rstrip()
        if line.startswith("```"):
            language = line[3:].strip()
            i += 1
            code = []
            while i < len(lines) and not lines[i].startswith("```"):
                code.append(lines[i].rstrip())
                i += 1
            label = f"{language.upper()}" if language else "EXAMPLE"
            block = [Paragraph(label, STYLES["small"]), Preformatted("\n".join(code), STYLES["code"], maxLineLength=105)]
            story.append(KeepTogether(block))
        elif line.startswith("| ") and "|" in line[2:]:
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                table_lines.append(lines[i])
                i += 1
            story.append(parse_table(table_lines))
            story.append(Spacer(1, 6))
            continue
        elif line == "---":
            story.append(Spacer(1, 4))
            story.append(HRFlowable(width="100%", thickness=0.7, color=GRID, spaceBefore=3, spaceAfter=6))
        elif line.startswith("# "):
            title = line[2:].strip()
            if first_h1:
                story.append(Spacer(1, 12 * mm))
                story.append(Paragraph(inline(title), STYLES["title"]))
                first_h1 = False
            elif title == "Solution appendix":
                story.append(PageBreak())
                story.append(Paragraph(inline(title), STYLES["h1"]))
            else:
                story.append(Paragraph(inline(title), STYLES["h1"]))
        elif line.startswith("## "):
            title = line[3:].strip()
            if len(story) < 3:
                story.append(Paragraph(inline(title), STYLES["title"]))
            else:
                story.append(Paragraph(inline(title), STYLES["h2"]))
        elif line.startswith("### "):
            story.append(Paragraph(inline(line[4:].strip()), STYLES["h3"]))
        elif line.startswith("> "):
            story.append(Paragraph(inline(line[2:].strip()), STYLES["quote"]))
        elif re.match(r"^\d+\. ", line):
            number, content = line.split(". ", 1)
            story.append(Paragraph(inline(content), STYLES["bullet"], bulletText=f"{number}."))
        elif line.startswith("- "):
            story.append(Paragraph(inline(line[2:]), STYLES["bullet"], bulletText="•"))
        elif not line.strip():
            story.append(Spacer(1, 2.5))
        else:
            story.append(Paragraph(inline(line), STYLES["body"]))
        i += 1
    return story


def decorate_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, PAGE_H - 7 * mm, PAGE_W, 7 * mm, fill=1, stroke=0)
    canvas.setStrokeColor(GRID)
    canvas.line(MARGIN_X, 12 * mm, PAGE_W - MARGIN_X, 12 * mm)
    canvas.setFont(BODY_FONT, 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN_X, 8 * mm, MODULE_FOOTER)
    canvas.drawRightString(PAGE_W - MARGIN_X, 8 * mm, f"Page {doc.page}")
    canvas.restoreState()


def build():
    global MODULE_FOOTER
    source = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_SOURCE
    output = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else source.with_suffix(".pdf")
    if not source.exists():
        raise SystemExit(f"Missing source: {source}")
    output.parent.mkdir(parents=True, exist_ok=True)
    source_text = source.read_text(encoding="utf-8")
    headings = [line.lstrip("# ").strip() for line in source_text.splitlines() if line.startswith("#")][:2]
    module_identity = headings[0] if headings else source.stem
    module_title = " — ".join(headings) if headings else source.stem
    MODULE_FOOTER = f"DSA For GATE Practice · {module_identity}"
    doc = BaseDocTemplate(
        str(output), pagesize=A4,
        leftMargin=MARGIN_X, rightMargin=MARGIN_X,
        topMargin=MARGIN_TOP, bottomMargin=MARGIN_BOTTOM,
        title=module_title,
        author="DSA For GATE Practice",
        subject=f"{module_identity} instructional module"
    )
    frame = Frame(MARGIN_X, MARGIN_BOTTOM, PAGE_W - 2 * MARGIN_X, PAGE_H - MARGIN_TOP - MARGIN_BOTTOM, id="main")
    doc.addPageTemplates([PageTemplate(id="module", frames=[frame], onPage=decorate_page)])
    doc.build(markdown_story(source_text))
    print(output)


if __name__ == "__main__":
    build()
