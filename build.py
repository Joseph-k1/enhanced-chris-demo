#!/usr/bin/env python3
"""Place the Vite build where GitHub Pages can serve it, next to index.html."""
import shutil
from pathlib import Path

root = Path(__file__).parent
dist = root / "app" / "dist-single"
assets = root / "assets"
if assets.exists():
    shutil.rmtree(assets)
shutil.copytree(dist / "assets", assets)
html = (dist / "index.html").read_text()
html = html.replace('lang="<!-- figma:lang -->"', 'lang="en"').replace("<title><!-- figma:title --></title>", "<title>KneesUp Tavern booking</title>")
for c in ["<!-- figma:head-start -->", "<!-- figma:head-end -->", "<!-- figma:body-start -->", "<!-- figma:body-end -->"]:
    html = html.replace(c, "")
(root / "app.html").write_text(html)
print("wrote app.html and assets/")
