#!/usr/bin/env python3
"""Verificação estática mínima de segurança para ferramentas DLT Academy."""

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path


REQUIRED_CSP = (
    "default-src 'self'",
    "script-src 'self' https://gc.zgo.at",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
)


class SecurityHTMLParser(HTMLParser):
    def __init__(self, source: Path) -> None:
        super().__init__(convert_charrefs=True)
        self.source = source
        self.errors: list[str] = []
        self.csp: str | None = None
        self.referrer: str | None = None
        self._inline_script = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): value or "" for key, value in attrs}
        if tag == "meta":
            if values.get("http-equiv", "").lower() == "content-security-policy":
                self.csp = values.get("content")
            if values.get("name", "").lower() == "referrer":
                self.referrer = values.get("content")
        if tag == "script" and not values.get("src"):
            self._inline_script = True
            self.errors.append(f"{self.source}: script inline não permitido")
        if tag == "a" and values.get("target") == "_blank":
            rel = set(values.get("rel", "").split())
            missing = {"noopener", "noreferrer"} - rel
            if missing:
                self.errors.append(
                    f"{self.source}: link target=_blank sem {', '.join(sorted(missing))}"
                )
            if values.get("referrerpolicy") != "no-referrer":
                self.errors.append(
                    f"{self.source}: link target=_blank sem referrerpolicy=no-referrer"
                )


def check_html(path: Path) -> list[str]:
    parser = SecurityHTMLParser(path)
    parser.feed(path.read_text(encoding="utf-8"))
    errors = parser.errors
    if not parser.csp:
        errors.append(f"{path}: CSP ausente")
    else:
        for directive in REQUIRED_CSP:
            if directive not in parser.csp:
                errors.append(f"{path}: CSP sem {directive}")
        if "unsafe-inline" in parser.csp or "unsafe-eval" in parser.csp:
            errors.append(f"{path}: CSP contém diretiva insegura")
    if parser.referrer != "no-referrer":
        errors.append(f"{path}: meta referrer deve ser no-referrer")
    return errors


def check_workflows(root: Path) -> list[str]:
    errors: list[str] = []
    for path in (root / ".github" / "workflows").glob("*.yml"):
        for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            match = re.search(r"\buses:\s*[^@\s]+@([^\s#]+)", line)
            if match and not re.fullmatch(r"[0-9a-f]{40}", match.group(1)):
                errors.append(f"{path}:{line_no}: Action não fixada por SHA completo")
    return errors


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    errors: list[str] = []
    for path in sorted(root.glob("*.html")):
        errors.extend(check_html(path))
    errors.extend(check_workflows(root))
    if errors:
        print("Security check falhou:")
        for error in errors:
            print(f"- {error}")
        return 1
    print("Security check: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
