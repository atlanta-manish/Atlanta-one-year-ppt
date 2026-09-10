#!/bin/sh
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
if command -v open >/dev/null 2>&1; then
  open "$SCRIPT_DIR/OPEN_PRESENTATION.html"
else
  xdg-open "$SCRIPT_DIR/OPEN_PRESENTATION.html"
fi
