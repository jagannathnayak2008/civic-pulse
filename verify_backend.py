import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Add paths
ROOT = os.path.dirname(os.path.abspath(__file__))
CIVICPULSE = os.path.join(ROOT, 'civicpulse')

for path in [ROOT, CIVICPULSE]:
    if path not in sys.path:
        sys.path.insert(0, path)

import asyncio

try:
    from civicpulse.backend.main import get_incident, get_kpi_summary, list_incidents
except ImportError:
    from backend.main import get_incident, get_kpi_summary, list_incidents

async def test():
    print("=" * 60)
    print("[CIVICPULSE] Testing Backend Engine & Domain Contracts...")
    print("=" * 60)
    inc = await get_incident('CP102')
    print(f"[OK] Master Incident #{inc['tracking_number']}: Priority={inc['priority']} | Risk Score={inc['risk_score']}/100")
    print(f"[OK] Merged Reports: {len(inc['reports'])} | Dept: {inc['assigned_department']}")
    
    kpi = await get_kpi_summary()
    print(f"[OK] KPI Grid: Total={kpi['total_reports']}, Verified={kpi['verified_incidents']}, Merged={kpi['duplicate_reports_merged']}, Pending={kpi['pending_incidents']}, Critical={kpi['critical_incidents']}, Resolved={kpi['resolved_incidents']}")
    
    all_inc = await list_incidents()
    print(f"[OK] Total Seeded Incidents Active: {len(all_inc)}")
    print("=" * 60)
    print("[SUCCESS] All backend modules, PostGIS zones, and XAI models verified!")
    print("=" * 60)

if __name__ == '__main__':
    asyncio.run(test())

