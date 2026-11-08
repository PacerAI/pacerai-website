"""The factory's own configuration for this repo.

These guard the registration itself. A deliver.yml that names a file which has since been renamed, or a
protected path that no longer exists, protects nothing and says nothing — and the failure would only show
up at the end of a job, at the merge gate, after everything else had been paid for.
"""
import os
import pathlib

import pytest
import yaml

REPO = pathlib.Path(__file__).resolve().parent.parent
CONFIG = REPO / "factory" / "deliver.yml"


@pytest.fixture(scope="module")
def config():
    assert CONFIG.is_file(), f"{CONFIG} is missing; the factory refuses a repo without it."
    return yaml.safe_load(CONFIG.read_text(encoding="utf-8"))


# job.py's load_config() refuses the repo outright if any of these is absent or empty.
@pytest.mark.parametrize("key", ["product", "owner", "checks", "tests", "review_rules"])
def test_required_key_is_set(config, key):
    assert config.get(key), f"factory/deliver.yml has no `{key}`."


def test_review_rules_file_exists(config):
    path = REPO / config["review_rules"]
    assert path.is_file(), f"review_rules points at {path}, which is not there."


def test_checks_script_is_executable(config):
    # `checks:` is a shell command, not a path, so take the last word that looks like a file in this repo.
    scripts = [word for word in config["checks"].split() if (REPO / word).is_file()]
    assert scripts, f"`checks: {config['checks']}` names no file in this repo."
    for script in scripts:
        assert os.access(REPO / script, os.X_OK), f"{script} is not executable."


def test_test_prefixes_exist(config):
    for prefix in config["tests"]:
        assert (REPO / prefix).exists(), (
            f"`tests:` names {prefix}, which is not there. A job's spec step has to commit something "
            f"under one of these paths, so a wrong prefix stops every job at its second step."
        )


def test_protected_paths_all_exist(config):
    absent = [path for path in config.get("protected_paths") or [] if not (REPO / path).exists()]
    assert not absent, (
        f"protected_paths names paths that are not in this repo: {absent}. A protected path is matched "
        f"against the files a diff touches, so one that cannot be touched guards nothing."
    )


def test_auto_merge_and_protected_paths_travel_together(config):
    # job.py's merge_blocked() treats auto_merge on with nothing protected as "not set up yet", because
    # such a repo could merge away its own checks. Catch it here rather than at the end of a job.
    if config.get("auto_merge", True):
        assert config.get("protected_paths"), (
            "auto_merge is on and protected_paths is empty, so nothing holds the checks in place."
        )
