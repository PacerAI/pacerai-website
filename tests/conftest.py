"""Shared fixtures for the website's tests.

The page list is read out of scripts/validate.py rather than written again here. That file already
declares which pages are live and redeployable, and a second hand-written copy would drift the first
time a page is retired (first_principles.md §4: derive the input list from the thing that declares it).
"""
import importlib.util
import pathlib

import pytest

REPO = pathlib.Path(__file__).resolve().parent.parent


def _validator():
    spec = importlib.util.spec_from_file_location("website_validate", REPO / "scripts" / "validate.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture(scope="session")
def repo():
    """The repository root, whether the suite runs here or in a job's worktree."""
    return REPO


@pytest.fixture(scope="session")
def live_pages():
    """The live, redeployable pages as validate.py declares them: {relative path: HTML text}."""
    found = {}
    for relative in _validator().DEFAULT_FILES:
        path = REPO / relative
        if path.is_file():
            found[relative] = path.read_text(encoding="utf-8")
    return found
