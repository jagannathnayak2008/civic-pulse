"""
Unit Tests for Incident & AI Orchestration Service
"""

import unittest
from backend.app.services.incident_service import IncidentService
from backend.app.services.ai_client import ai_client

class TestIncidentService(unittest.TestCase):
    def setUp(self):
        self.service = IncidentService()

    def test_initial_incidents_loaded(self):
        incidents = self.service.get_all_incidents()
        self.assertGreaterEqual(len(incidents), 1)

    def test_kpi_summary_strict_constraints(self):
        kpi = self.service.get_kpi()
        self.assertIn("total_reports", kpi)
        self.assertIn("verified_incidents", kpi)
        self.assertIn("resolved_incidents", kpi)
        # Strict negative constraints check: NO average resolution time!
        self.assertNotIn("average_resolution_time", kpi)
        self.assertNotIn("avg_resolution_time", kpi)

    def test_workflow_execution(self):
        result = ai_client.execute_workflow(
            raw_text="Severe pothole crater on road",
            latitude=20.2961,
            longitude=85.8245,
            active_incidents=self.service.get_all_incidents()
        )
        self.assertIn("action", result)
        self.assertIn("is_duplicate", result)

if __name__ == "__main__":
    unittest.main()

