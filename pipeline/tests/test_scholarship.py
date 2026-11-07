"""Approval failures must stop the new renderer; failed QA must propagate."""
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import _dasar  # noqa: F401
import scholarship
import video
from sistem import GagalPipeline, SEMENTARA


class ScholarshipGate(unittest.TestCase):
    def test_changed_props_are_rejected_before_rendering(self):
        with tempfile.TemporaryDirectory(dir=SEMENTARA) as tmp:
            directory = Path(tmp)
            (directory / "split.json").write_text(json.dumps({"props": "production.json"}))
            (directory / "production.json").write_text('{"changed":true}')
            project = SimpleNamespace(dir=directory, manifest={"persetujuan": {
                "scholarship_props_sha": hashlib.sha256(b"approved content").hexdigest()}})
            with self.assertRaisesRegex(GagalPipeline, "belum disetujui atau sudah berubah"):
                scholarship.approved_props(project)

    def test_failed_qa_propagates_and_legacy_renderer_is_not_used(self):
        project = SimpleNamespace(dir=Path("proyek/uji"))
        with patch("video.baca_json", return_value={"renderer": "scholarship"}), \
                patch("scholarship.render") as render, patch("scholarship.qa", return_value=False), \
                patch("split.render") as old, patch("thumbnail.generate") as cover:
            self.assertEqual(video.split_satu_pintu(project, "semua"), 1)
        render.assert_called_once_with(project)
        old.assert_not_called()
        cover.assert_called_once_with(project)


if __name__ == "__main__":
    unittest.main()
