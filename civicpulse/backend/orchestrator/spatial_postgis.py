"""
Spatial PostGIS, DBSCAN Clustering & Zone Routing Engine
"""

import math
from typing import Dict, Any, List, Optional, Tuple

# Municipal Zones 1-5 definitions with bounding polygons
MUNICIPAL_ZONES: List[Dict[str, Any]] = [
    {
        "zone_id": 1,
        "zone_code": "ZONE-01-HERITAGE",
        "zone_name": "Municipal Zone 1 — Old City & Heritage Corridor",
        "boundary_polygon": [
            [20.2800, 85.8100], [20.2920, 85.8100], [20.2920, 85.8220], [20.2800, 85.8220]
        ],
        "responsible_department": "Public Works & Heritage Conservation",
        "ward_officer": "Er. Rajesh Mohapatra",
        "contact_phone": "+91 94370 11001"
    },
    {
        "zone_id": 2,
        "zone_code": "ZONE-02-RESIDENTIAL",
        "zone_name": "Municipal Zone 2 — Saheed Nagar Residential Sector",
        "boundary_polygon": [
            [20.2920, 85.8220], [20.3050, 85.8220], [20.3050, 85.8350], [20.2920, 85.8350]
        ],
        "responsible_department": "Urban Amenities & Civil Infrastructure",
        "ward_officer": "Er. Sunita Patnaik",
        "contact_phone": "+91 94370 22002"
    },
    {
        "zone_id": 3,
        "zone_code": "ZONE-03-METRO",
        "zone_name": "Municipal Zone 3 — Central Tech Corridor & Metro Boulevard",
        "boundary_polygon": [
            [20.2900, 85.8200], [20.3100, 85.8200], [20.3100, 85.8450], [20.2900, 85.8450]
        ],
        "responsible_department": "Road Maintenance Department",
        "ward_officer": "Er. Alok Das (Chief Zonal Engineer)",
        "contact_phone": "+91 94370 33003"
    },
    {
        "zone_id": 4,
        "zone_code": "ZONE-04-INDUSTRIAL",
        "zone_name": "Municipal Zone 4 — Mancheswar Logistics & Industrial Hub",
        "boundary_polygon": [
            [20.3100, 85.8350], [20.3300, 85.8350], [20.3300, 85.8600], [20.3100, 85.8600]
        ],
        "responsible_department": "Heavy Infrastructure & Industrial Drainage",
        "ward_officer": "Er. Priyadarshi Nayak",
        "contact_phone": "+91 94370 44004"
    },
    {
        "zone_id": 5,
        "zone_code": "ZONE-05-COMMERCIAL",
        "zone_name": "Municipal Zone 5 — Master Canteen Commercial Plaza",
        "boundary_polygon": [
            [20.2700, 85.8250], [20.2900, 85.8250], [20.2900, 85.8400], [20.2700, 85.8400]
        ],
        "responsible_department": "Sanitation & Commercial Lighting Division",
        "ward_officer": "Er. Smita Rout",
        "contact_phone": "+91 94370 55005"
    }
]

# Sensitive Locations (Schools, Hospitals) for Risk Multiplier
SENSITIVE_INSTITUTIONS: List[Dict[str, Any]] = [
    {
        "name": "City General Hospital & Trauma Care",
        "category": "HOSPITAL",
        "lat": 20.2968,
        "lon": 85.8248,
        "buffer_radius_m": 200.0
    },
    {
        "name": "St. Xavier Model High School",
        "category": "SCHOOL",
        "lat": 20.2958,
        "lon": 85.8242,
        "buffer_radius_m": 200.0
    },
    {
        "name": "Capital Central Pediatric Center",
        "category": "HOSPITAL",
        "lat": 20.3020,
        "lon": 85.8310,
        "buffer_radius_m": 200.0
    }
]

DEPARTMENT_MAP: Dict[str, str] = {
    "POTHOLE_ROAD_DAMAGE": "Road Maintenance Department",
    "GARBAGE_OVERFLOW": "Sanitation & Solid Waste Management",
    "PUBLIC_TOILET_ISSUES": "Public Health & Sanitation Division",
    "WATERLOGGING": "Stormwater Management & Flood Unit",
    "DRAINAGE_WATER_LEAKAGE": "Water Supply & Sewerage Board",
    "BROKEN_STREETLIGHT": "Electrical & Street Lighting Division",
    "OPEN_MANHOLE_HAZARDS": "Emergency Civil Infrastructure Unit",
    "OTHERS": "General Municipal Grievance & Civil Cell"
}

class SpatialPostGISEngine:
    def __init__(self):
        self.zones = MUNICIPAL_ZONES
        self.sensitive = SENSITIVE_INSTITUTIONS

    def calculate_distance_meters(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Haversine/Cartesian approximation in meters."""
        return math.hypot((lat1 - lat2) * 111000.0, (lon1 - lon2) * 111000.0)

    def locate_municipal_zone(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Simulates PostGIS ST_Contains(zone.boundary, ST_SetSRID(ST_Point(lon, lat), 4326)).
        """
        for zone in self.zones:
            poly = zone["boundary_polygon"]
            min_lat = min(p[0] for p in poly)
            max_lat = max(p[0] for p in poly)
            min_lon = min(p[1] for p in poly)
            max_lon = max(p[1] for p in poly)
            if min_lat <= lat <= max_lat and min_lon <= lon <= max_lon:
                return zone
        
        # Default to Zone 3 if on boundary
        return self.zones[2]

    def check_sensitive_proximity(self, lat: float, lon: float) -> Tuple[bool, Optional[str], float]:
        """
        Simulates PostGIS ST_DWithin(institution.geom, incident.geom, 200.0).
        Returns: (is_within_buffer, institution_name, distance_meters)
        """
        for inst in self.sensitive:
            dist = self.calculate_distance_meters(lat, lon, inst["lat"], inst["lon"])
            if dist <= inst["buffer_radius_m"]:
                return True, inst["name"], round(dist, 1)
        return False, None, 999.0

    def check_spatial_duplicate(
        self,
        new_lat: float,
        new_lon: float,
        category: str,
        active_incidents: List[Dict[str, Any]],
        radius_threshold_m: float = 35.0
    ) -> Optional[Dict[str, Any]]:
        """
        DBSCAN spatial clustering: matches existing active incidents of the same
        category within a 35-meter radius.
        """
        for inc in active_incidents:
            if inc["category"] == category and inc["status"] not in ["RESOLVED", "CLOSED"]:
                dist = self.calculate_distance_meters(new_lat, new_lon, inc["latitude"], inc["longitude"])
                if dist <= radius_threshold_m:
                    return {
                        "master_incident_id": inc["id"],
                        "tracking_number": inc["tracking_number"],
                        "distance_meters": round(dist, 1),
                        "match_confidence": round(max(90.0, 99.0 - (dist * 0.25)), 1) # e.g. 96%
                    }
        return None

    def route_department(self, category: str) -> str:
        """Deterministic mapping from incident category to responsible municipal department."""
        return DEPARTMENT_MAP.get(category, "Public Works Department")

spatial_engine = SpatialPostGISEngine()

