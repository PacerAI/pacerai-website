"""Public pages may show Price Book v2.0 seats and services, and nothing else."""
import importlib.util
import pathlib

REPO = pathlib.Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("validate", REPO / "scripts" / "validate.py")
validate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validate)


def _foundation(html):
    return [m for m in validate.validate_foundation(html) if m.startswith("FOUNDATION:")]


def test_pricing_page_matches_the_price_book():
    page = (REPO / "src/pricing/pricing-build.html").read_text(encoding="utf-8")
    assert _foundation(page) == []
    assert "Purchase" in page
    for hidden in ("Startup", "Advisor", "small team rate", "pilot program", "bulk rate"):
        assert hidden not in page


def test_homepage_pricing_band_is_checked_even_without_a_rate_suffix():
    html = '<section data-section="pricing"><p>Rep pacing at $100</p></section>'
    assert _foundation(html) == []
    drifted = '<section data-section="pricing"><p>Rep pacing at $123</p></section>'
    assert any("not in" in m for m in _foundation(drifted))


def test_a_hidden_package_is_a_failure_even_when_its_price_is_in_the_book():
    html = "<p>Startup at $600/mo</p>"
    failures = _foundation(html)
    assert any("Startup" in m for m in failures)
    assert not any("not in" in m for m in failures)
