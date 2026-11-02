import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  MasterIncident,
  MunicipalZone,
  KPIGridSummary,
  CitizenReport,
  AuditLogEntry
} from '../types/civicpulse';
import { User, LoginFormData, RegisterFormData } from '../types/auth';

interface CivicPulseContextType {
  // Authentication
  currentUser: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  logoutModalOpen: boolean;
  setLogoutModalOpen: (open: boolean) => void;
  login: (credentials: LoginFormData) => Promise<{ success: boolean; message?: string }>;
  register: (formData: RegisterFormData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;

  incidents: MasterIncident[];
  selectedIncident: MasterIncident | null;
  setSelectedIncident: (incident: MasterIncident | null) => void;
  selectIncidentByTracking: (trackingNumber: string) => void;
  zones: MunicipalZone[];
  kpi: KPIGridSummary;
  role: 'CITIZEN' | 'OFFICER' | 'DEMO';
  setRole: (role: 'CITIZEN' | 'OFFICER' | 'DEMO') => void;
  citizenTab: 'REPORT' | 'TRACK' | 'CONFIRM';
  setCitizenTab: (tab: 'REPORT' | 'TRACK' | 'CONFIRM') => void;
  officerTab: 'MAP' | 'SLA_BOARD' | 'REVIEW_QUEUE';
  setOfficerTab: (tab: 'MAP' | 'SLA_BOARD' | 'REVIEW_QUEUE') => void;
  wsConnected: boolean;
  notification: string | null;
  clearNotification: () => void;
  
  // Actions
  submitReport: (formData: any) => Promise<{ status: string; trackingNumber: string; isDuplicate: boolean }>;
  confirmIncident: (trackingNumber: string) => Promise<void>;
  updateIncidentStatus: (trackingNumber: string, newStatus: string, notes?: string) => Promise<void>;
  verifyRepair: (trackingNumber: string, afterImageUrl: string, lat: number, lon: number) => Promise<void>;
  submitCitizenFeedback: (trackingNumber: string, action: 'CONFIRM' | 'DISPUTE', reason?: string) => Promise<void>;
  approveReviewItem: (trackingNumber: string) => void;
  
  // Officer Modal
  officerModalOpen: boolean;
  setOfficerModalOpen: (open: boolean) => void;
  repairTargetTracking: string | null;
  setRepairTargetTracking: (tracking: string | null) => void;
  
  // 90-Second Demo Simulator
  demoStep: number;
  demoAutoPlaying: boolean;
  setDemoStep: (step: number) => void;
  toggleDemoAutoPlay: () => void;
  resetDemo: () => Promise<void>;
}

import { API_BASE, WS_URL } from '../services/api';

// Baseline Municipal Zones
const DEFAULT_ZONES: MunicipalZone[] = [
  {
    zone_id: 1,
    zone_code: "ZONE-01-HERITAGE",
    zone_name: "Municipal Zone 1 — Old City & Heritage Corridor",
    boundary_polygon: [
      [20.2800, 85.8100], [20.2920, 85.8100], [20.2920, 85.8220], [20.2800, 85.8220]
    ],
    responsible_department: "Public Works & Heritage Conservation",
    ward_officer: "Er. Rajesh Mohapatra",
    contact_phone: "+91 94370 11001"
  },
  {
    zone_id: 2,
    zone_code: "ZONE-02-RESIDENTIAL",
    zone_name: "Municipal Zone 2 — Saheed Nagar Residential Sector",
    boundary_polygon: [
      [20.2920, 85.8220], [20.3050, 85.8220], [20.3050, 85.8350], [20.2920, 85.8350]
    ],
    responsible_department: "Urban Amenities & Civil Infrastructure",
    ward_officer: "Er. Sunita Patnaik",
    contact_phone: "+91 94370 22002"
  },
  {
    zone_id: 3,
    zone_code: "ZONE-03-METRO",
    zone_name: "Municipal Zone 3 — Central Tech Corridor & Metro Boulevard",
    boundary_polygon: [
      [20.2900, 85.8200], [20.3100, 85.8200], [20.3100, 85.8450], [20.2900, 85.8450]
    ],
    responsible_department: "Road Maintenance Department",
    ward_officer: "Er. Alok Das (Chief Zonal Engineer)",
    contact_phone: "+91 94370 33003"
  },
  {
    zone_id: 4,
    zone_code: "ZONE-04-INDUSTRIAL",
    zone_name: "Municipal Zone 4 — Mancheswar Logistics & Industrial Hub",
    boundary_polygon: [
      [20.3100, 85.8350], [20.3300, 85.8350], [20.3300, 85.8600], [20.3100, 85.8600]
    ],
    responsible_department: "Heavy Infrastructure & Industrial Drainage",
    ward_officer: "Er. Priyadarshi Nayak",
    contact_phone: "+91 94370 44004"
  },
  {
    zone_id: 5,
    zone_code: "ZONE-05-COMMERCIAL",
    zone_name: "Municipal Zone 5 — Master Canteen Commercial Plaza",
    boundary_polygon: [
      [20.2700, 85.8250], [20.2900, 85.8250], [20.2900, 85.8400], [20.2700, 85.8400]
    ],
    responsible_department: "Sanitation & Commercial Lighting Division",
    ward_officer: "Er. Smita Rout",
    contact_phone: "+91 94370 55005"
  }
];

// Baseline Seed Incidents
const DEFAULT_INCIDENTS: MasterIncident[] = [
  {
    id: "cp-102-master-uuid",
    tracking_number: "CP102",
    title: "Severe Road Crater & Waterlogging near St. Xavier Model High School",
    category: "POTHOLE_ROAD_DAMAGE",
    priority: "P1_CRITICAL",
    risk_score: 92,
    status: "IN_PROGRESS",
    latitude: 20.2961,
    longitude: 85.8245,
    address_display: "Opposite St. Xavier Model High School, Metro Boulevard, Zone 3",
    zone_id: 3,
    zone_name: "Municipal Zone 3 — Central Tech Corridor & Metro Boulevard",
    assigned_department: "Road Maintenance Department",
    sla_hours: 4,
    sla_deadline: "2026-10-31 14:15:00 UTC",
    sla_breached: false,
    created_at: "2026-10-31 10:00:15 UTC",
    updated_at: "2026-10-31 10:20:45 UTC",
    report_count: 2,
    community_upvotes: 14,
    duplicate_match_confidence: 96.0,
    reports: [
      {
        id: "rep-001",
        reporter_alias: "Citizen A (Priyanka M.)",
        phone_masked: "+91 98*** **321",
        submitted_at: "10:00 AM",
        latitude: 20.2961,
        longitude: 85.8245,
        media_url: "/images/road_pothole_before.jpg",
        media_type: "VIDEO",
        extracted_frames: [
          {
            frame_index: 1,
            timestamp_offset_sec: 0.0,
            image_url: "/images/road_pothole_before.jpg",
            blur_score: 142.5,
            detections: [
              {
                label: "Deep Road Crater / Pothole",
                confidence: 0.94,
                x: 22.5,
                y: 38.0,
                width: 55.0,
                height: 42.0,
                severity_note: "Severe subsurface void detected, approximate area 1.8m x 1.2m"
              }
            ]
          },
          {
            frame_index: 2,
            timestamp_offset_sec: 1.2,
            image_url: "/images/road_pothole_before.jpg",
            blur_score: 168.0,
            detections: [
              {
                label: "Deep Road Crater / Pothole",
                confidence: 0.94,
                x: 24.0,
                y: 36.0,
                width: 52.0,
                height: 40.0,
                severity_note: "Deep void with sharp exposed aggregate, immediate vehicle wheel damage risk"
              }
            ]
          },
          {
            frame_index: 3,
            timestamp_offset_sec: 2.5,
            image_url: "/images/road_pothole_before.jpg",
            blur_score: 155.2,
            detections: [
              {
                label: "Waterlogged Subsurface",
                confidence: 0.91,
                x: 28.0,
                y: 40.0,
                width: 48.0,
                height: 35.0,
                severity_note: "Submerged water accumulation obscuring true crater depth"
              }
            ]
          },
          {
            frame_index: 4,
            timestamp_offset_sec: 3.8,
            image_url: "/images/road_pothole_before.jpg",
            blur_score: 139.8,
            detections: [
              {
                label: "Edge Fracture Line",
                confidence: 0.88,
                x: 18.0,
                y: 30.0,
                width: 60.0,
                height: 50.0,
                severity_note: "Crack propagating into adjacent vehicle lane"
              }
            ]
          }
        ],
        original_audio_script: "ରାସ୍ତାରେ ଏକ ବଡ଼ ଗାତ ହୋଇଛି, ପାଣି ଜମି ରହିଛି ଏବଂ ସ୍କୁଲ ପାଖରେ ଗାଡ଼ି ଚଳାଚଳରେ ବିପଦ ସୃଷ୍ଟି ହେଉଛି।",
        detected_language: "or",
        translated_english_text: "There is a deep crater pothole on the road with stagnant water, creating severe hazard for school transit.",
        extracted_urgency_keywords: ["ବଡ଼ ଗାତ (large crater)", "ପାଣି ଜମି (waterlogged)", "ସ୍କୁଲ ପାଖରେ (near school)", "ବିପଦ (severe hazard)"],
        phash: "3f8a9c1e7b2d5a40",
        evidence_confidence: 96.0,
        evidence_tier: "HIGH",
        location_consistency: "HIGH",
        image_quality: "GOOD",
        flagged_for_human_review: false,
        review_reason: null
      },
      {
        id: "rep-002",
        reporter_alias: "Citizen B (Debashis R.)",
        phone_masked: "+91 97*** **842",
        submitted_at: "10:20 AM",
        latitude: 20.2962,
        longitude: 85.8246,
        media_url: "/images/road_pothole_angle2.jpg",
        media_type: "PHOTO",
        extracted_frames: [],
        original_audio_script: "Same huge pothole seen from south sidewalk, school vans are swerving into oncoming traffic lane.",
        detected_language: "en",
        translated_english_text: "Same huge pothole seen from south sidewalk, school vans are swerving into oncoming traffic lane.",
        extracted_urgency_keywords: ["school vans swerving", "oncoming traffic", "huge pothole"],
        phash: "3f8a9c1e7b2d5a42",
        evidence_confidence: 94.0,
        evidence_tier: "HIGH",
        location_consistency: "HIGH",
        image_quality: "GOOD",
        flagged_for_human_review: false,
        review_reason: null
      }
    ],
    xai: {
      base_severity: 35,
      proximity_penalty: 25,
      traffic_importance: 20,
      worsening_trend: 12,
      total_risk_score: 92,
      summary_narrative: "Calculated P1 CRITICAL Risk Score (92/100). Contributing factors: +35 Base Pothole Severity (1.8m crater, 94% YOLO confidence), +25 School Zone Proximity (<200m to St. Xavier Model High School), +20 Arterial Road Traffic, +12 Worsening Trend from 2 consecutive citizen reports.",
      deduplication_reason: "Merged Citizen Report A (10:00 AM) and Citizen Report B (10:20 AM): 14m GPS distance via DBSCAN, 89% visual feature overlap, and 20-min timestamp delta.",
      jurisdiction_rule: "Coordinates fall inside Municipal Zone 3 Polygon. Category 'Road Damage' routes automatically to Road Maintenance Department."
    },
    audit_logs: [
      {
        id: "log-001",
        timestamp: "2026-10-31 10:00:15 UTC",
        actor: "Citizen A (Priyanka M.)",
        actor_role: "CITIZEN",
        action: "SUBMISSION_RECEIVED",
        details: "Uploaded road damage video with Odia voice note at coordinates (20.2961, 85.8245).",
        cryptographic_hash: "SHA256-e9b41a3f8c2d10e5"
      },
      {
        id: "log-002",
        timestamp: "2026-10-31 10:00:22 UTC",
        actor: "Vision YOLO Node",
        actor_role: "SYSTEM",
        action: "DEFECT_DETECTED",
        details: "YOLOv8 detected deep road void (94% confidence, 14.8% frame area).",
        cryptographic_hash: "SHA256-4a7b2c9e1d8f30aa"
      },
      {
        id: "log-003",
        timestamp: "2026-10-31 10:00:30 UTC",
        actor: "Severity Scoring Node",
        actor_role: "SYSTEM",
        action: "PRIORITY_ASSIGNED",
        details: "AI Risk Score: 92/100. Assigned P1_CRITICAL (4-hour SLA). Emergency escalation triggered.",
        cryptographic_hash: "SHA256-7f8e1d2c3b4a5960"
      },
      {
        id: "log-004",
        timestamp: "2026-10-31 10:00:35 UTC",
        actor: "Jurisdiction Router Node",
        actor_role: "SYSTEM",
        action: "ROUTED_TO_DEPARTMENT",
        details: "Routed to Road Maintenance Department (Municipal Zone 3). Zonal Chief Engineer notified.",
        cryptographic_hash: "SHA256-11ac92ef8834db02"
      },
      {
        id: "log-005",
        timestamp: "2026-10-31 10:20:45 UTC",
        actor: "LangGraph Deduplication Node",
        actor_role: "SYSTEM",
        action: "DUPLICATE_MERGED",
        details: "Citizen B report merged into #CP102 (14m GPS distance, 96% match confidence). Reports consolidated (2 -> 1).",
        cryptographic_hash: "SHA256-88d4fe3109ab76cc"
      }
    ],
    repair_verification: {
      before_image_url: "/images/road_pothole_before.jpg",
      after_image_url: "/images/road_pothole_after.jpg",
      officer_id: "OFFICER-ZN3-01",
      officer_name: "Er. Alok Das (Chief Zonal Engineer)",
      uploaded_at: "Today 10:45 AM",
      ssim_score: 0.94,
      repair_verification_score: 96.5,
      hazard_resolved: true,
      citizen_feedback_status: "PENDING",
      citizen_dispute_reason: null
    }
  },
  {
    id: "cp-103-master-uuid",
    tracking_number: "CP103",
    title: "Severe Solid Waste Overflow on Market Street Pedestrian Path",
    category: "GARBAGE_OVERFLOW",
    priority: "P2_HIGH",
    risk_score: 74,
    status: "ASSIGNED",
    latitude: 20.2985,
    longitude: 85.8290,
    address_display: "Opposite Saheed Nagar Daily Market, Zone 2",
    zone_id: 2,
    zone_name: "Municipal Zone 2 — Saheed Nagar Residential Sector",
    assigned_department: "Sanitation Department",
    sla_hours: 12,
    sla_deadline: "2026-10-31 20:15:00 UTC",
    sla_breached: false,
    created_at: "2026-10-31 08:15:10 UTC",
    updated_at: "2026-10-31 08:15:30 UTC",
    report_count: 1,
    community_upvotes: 7,
    duplicate_match_confidence: 0.0,
    reports: [
      {
        id: "rep-003",
        reporter_alias: "Citizen C (Ramesh S.)",
        phone_masked: "+91 99*** **112",
        submitted_at: "08:15 AM",
        latitude: 20.2985,
        longitude: 85.8290,
        media_url: "/images/garbage_before.jpg",
        media_type: "PHOTO",
        extracted_frames: [],
        original_audio_script: "मेन मार्केट के सामने कचरे का बहुत बड़ा ढेर लगा है, बदबू आ रही है।",
        detected_language: "hi",
        translated_english_text: "There is a massive overflow of rotten garbage opposite main market, causing stench and attracting stray animals.",
        extracted_urgency_keywords: ["कचरे का ढेर", "बदबू", "आवारा पशु"],
        phash: "7c9b1a5e3d2f4088",
        evidence_confidence: 92.0,
        evidence_tier: "HIGH",
        location_consistency: "HIGH",
        image_quality: "GOOD",
        flagged_for_human_review: false,
        review_reason: null
      }
    ],
    xai: {
      base_severity: 30,
      proximity_penalty: 20,
      traffic_importance: 14,
      worsening_trend: 10,
      total_risk_score: 74,
      summary_narrative: "P2 High Priority (74/100). Biological waste spillover blocking commercial footpath within 150m of public food stalls.",
      deduplication_reason: "Evaluated as unique civic incident; no active reports within 35m.",
      jurisdiction_rule: "Coordinates fall inside Municipal Zone 2. Category 'Garbage Overflow' routes to Sanitation Department."
    },
    audit_logs: [
      {
        id: "log-006",
        timestamp: "2026-10-31 08:15:10 UTC",
        actor: "Citizen C (Ramesh S.)",
        actor_role: "CITIZEN",
        action: "SUBMISSION_RECEIVED",
        details: "Photo report with Hindi audio submitted in Zone 2.",
        cryptographic_hash: "SHA256-55aa32c109df4421"
      },
      {
        id: "log-007",
        timestamp: "2026-10-31 08:15:30 UTC",
        actor: "Jurisdiction Router Node",
        actor_role: "SYSTEM",
        action: "ROUTED_TO_DEPARTMENT",
        details: "Assigned to Sanitation Department. 12h SLA timer running.",
        cryptographic_hash: "SHA256-99bc4512e0fa3311"
      }
    ],
    repair_verification: {
      before_image_url: "/images/garbage_before.jpg",
      after_image_url: "/images/garbage_after.jpg",
      officer_id: "OFFICER-ZN2-04",
      officer_name: "Er. Suresh Mohanty (Zonal Sanitation Inspector)",
      uploaded_at: "Today 10:45 AM",
      ssim_score: 0.94,
      repair_verification_score: 96.5,
      hazard_resolved: true,
      citizen_feedback_status: "PENDING",
      citizen_dispute_reason: null
    }
  },
  {
    id: "cp-104-master-uuid",
    tracking_number: "CP104",
    title: "Broken Sodium Luminaire & Blackout on Old Heritage Walkway",
    category: "BROKEN_STREETLIGHT",
    priority: "P3_MEDIUM",
    risk_score: 58,
    status: "VERIFIED",
    latitude: 20.2850,
    longitude: 85.8150,
    address_display: "Near Old Temple Gate, Heritage Corridor, Zone 1",
    zone_id: 1,
    zone_name: "Municipal Zone 1 — Old City & Heritage Corridor",
    assigned_department: "Electrical Department",
    sla_hours: 24,
    sla_deadline: "2026-11-01 07:30:00 UTC",
    sla_breached: false,
    created_at: "2026-10-31 07:30:10 UTC",
    updated_at: "2026-10-31 07:30:25 UTC",
    report_count: 1,
    community_upvotes: 3,
    duplicate_match_confidence: 0.0,
    reports: [
      {
        id: "rep-004",
        reporter_alias: "Citizen D (Ananya B.)",
        phone_masked: "+91 94*** **555",
        submitted_at: "07:30 AM",
        latitude: 20.2850,
        longitude: 85.8150,
        media_url: "/images/streetlight_before.jpg",
        media_type: "PHOTO",
        extracted_frames: [],
        original_audio_script: "বাস স্টপের কাছে স্ট্রিট লাইট ৩ দিন ধরে বন্ধ, রাতে অন্ধকার রয়েছে।",
        detected_language: "bn",
        translated_english_text: "The street lamp near the bus stop has been broken for 3 days; total blackout poses safety risks for commuters.",
        extracted_urgency_keywords: ["স্ট্রিট লাইট বন্ধ", "অন্ধকার", "বাস স্টপ"],
        phash: "2a8e1b9f7c3d5501",
        evidence_confidence: 68.0,
        evidence_tier: "LOW",
        location_consistency: "HIGH",
        image_quality: "FAIR",
        flagged_for_human_review: true,
        review_reason: "Evidence confidence (68.0%) below 70% threshold due to night glare and partial lighting occlusion.",
        verified_by_officer: false
      }
    ],
    xai: {
      base_severity: 22,
      proximity_penalty: 15,
      traffic_importance: 12,
      worsening_trend: 9,
      total_risk_score: 58,
      summary_narrative: "P3 Medium Priority (58/100). Luminaire failure causing walkway blackout. Flagged to Officer Queue due to low-confidence nighttime exposure.",
      deduplication_reason: "Evaluated as unique civic incident; no active reports within 35m.",
      jurisdiction_rule: "Coordinates fall inside Municipal Zone 1. Category 'Broken Streetlight' routes to Electrical Department."
    },
    audit_logs: [
      {
        id: "log-008",
        timestamp: "2026-10-31 07:30:10 UTC",
        actor: "Citizen D (Ananya B.)",
        actor_role: "CITIZEN",
        action: "SUBMISSION_RECEIVED",
        details: "Night photo with Bengali audio submitted.",
        cryptographic_hash: "SHA256-33ee4411bb22aa09"
      },
      {
        id: "log-009",
        timestamp: "2026-10-31 07:30:25 UTC",
        actor: "Evidence Authenticity Node",
        actor_role: "SYSTEM",
        action: "FLAGGED_FOR_HUMAN_REVIEW",
        details: "Confidence 68% < 70%. Routed to Human Review Queue in Command Center.",
        cryptographic_hash: "SHA256-44dd5522cc33bb10"
      }
    ],
    repair_verification: {
      before_image_url: "/images/streetlight_before.jpg",
      after_image_url: "/images/streetlight_after.jpg",
      officer_id: "OFFICER-ZN1-03",
      officer_name: "Er. Debendra Jena (Chief Electrical Inspector)",
      uploaded_at: "Today 10:45 AM",
      ssim_score: 0.92,
      repair_verification_score: 94.8,
      hazard_resolved: true,
      citizen_feedback_status: "PENDING",
      citizen_dispute_reason: null
    }
  },
  {
    id: "cp-101-master-uuid",
    tracking_number: "CP101",
    title: "Asphalt Subsurface Crack Repair at Master Canteen Commercial Plaza",
    category: "POTHOLE_ROAD_DAMAGE",
    priority: "P2_HIGH",
    risk_score: 68,
    status: "RESOLVED",
    latitude: 20.2780,
    longitude: 85.8320,
    address_display: "South Avenue Commercial Circle, Zone 5",
    zone_id: 5,
    zone_name: "Municipal Zone 5 — Master Canteen Commercial Plaza",
    assigned_department: "Road Maintenance Department",
    sla_hours: 12,
    sla_deadline: "2026-10-31 06:00:00 UTC",
    sla_breached: false,
    created_at: "2026-10-30 18:00:00 UTC",
    updated_at: "2026-10-31 06:40:00 UTC",
    report_count: 1,
    community_upvotes: 19,
    duplicate_match_confidence: 0.0,
    reports: [
      {
        id: "rep-005",
        reporter_alias: "Citizen E (Vikram K.)",
        phone_masked: "+91 93*** **774",
        submitted_at: "Yesterday 06:00 PM",
        latitude: 20.2780,
        longitude: 85.8320,
        media_url: "/images/road_pothole_before.jpg",
        media_type: "PHOTO",
        extracted_frames: [],
        original_audio_script: "Deep pavement crack threatening bus corridor lane.",
        detected_language: "en",
        translated_english_text: "Deep pavement crack threatening bus corridor lane.",
        extracted_urgency_keywords: ["pavement crack", "bus corridor"],
        phash: "9f1b4a2e8c5d3310",
        evidence_confidence: 95.0,
        evidence_tier: "HIGH",
        location_consistency: "HIGH",
        image_quality: "GOOD",
        flagged_for_human_review: false,
        review_reason: null
      }
    ],
    xai: {
      base_severity: 28,
      proximity_penalty: 18,
      traffic_importance: 14,
      worsening_trend: 8,
      total_risk_score: 68,
      summary_narrative: "P2 High Priority (68/100). Commercial plaza roadway fracture verified and repaired.",
      deduplication_reason: "Evaluated as unique civic incident; no active reports within 35m.",
      jurisdiction_rule: "Coordinates fall inside Municipal Zone 5. Assigned to Road Maintenance Department."
    },
    audit_logs: [
      {
        id: "log-010",
        timestamp: "2026-10-30 18:00:00 UTC",
        actor: "Citizen E",
        actor_role: "CITIZEN",
        action: "SUBMISSION_RECEIVED",
        details: "Initial photo report submitted.",
        cryptographic_hash: "SHA256-aa11bb22cc33dd44"
      },
      {
        id: "log-011",
        timestamp: "2026-10-31 06:15:00 UTC",
        actor: "Officer Er. Smita Rout",
        actor_role: "MUNICIPAL_OFFICER",
        action: "REPAIR_PHOTO_UPLOADED",
        details: "Uploaded post-repair asphalt patch photograph.",
        cryptographic_hash: "SHA256-bb22cc33dd44ee55"
      },
      {
        id: "log-012",
        timestamp: "2026-10-31 06:15:20 UTC",
        actor: "Vision AI Verifier",
        actor_role: "SYSTEM",
        action: "REPAIR_VERIFIED",
        details: "AI Before/After Repair Verification: 94.2% score. Hazard resolved.",
        cryptographic_hash: "SHA256-cc33dd44ee55ff66"
      },
      {
        id: "log-013",
        timestamp: "2026-10-31 06:40:00 UTC",
        actor: "Citizen E (Vikram K.)",
        actor_role: "CITIZEN",
        action: "CITIZEN_CONFIRMED_RESOLUTION",
        details: "Citizen confirmed repair satisfaction via Tracking Portal. Ticket CLOSED.",
        cryptographic_hash: "SHA256-dd44ee55ff66aa77"
      }
    ],
    repair_verification: {
      before_image_url: "/images/road_pothole_before.jpg",
      after_image_url: "/images/road_pothole_after.jpg",
      officer_id: "OFFICER-ZN5-01",
      officer_name: "Er. Smita Rout",
      uploaded_at: "Today 06:15 AM",
      ssim_score: 0.91,
      repair_verification_score: 94.2,
      hazard_resolved: true,
      citizen_feedback_status: "CONFIRMED",
      citizen_dispute_reason: null
    }
  },
  {
    id: "cp-105-master-uuid",
    tracking_number: "CP105",
    title: "Industrial Storm Drain Inundation & Hazardous Blackwater Pooling",
    category: "DRAINAGE_WATER_LEAKAGE",
    priority: "P2_HIGH",
    risk_score: 79,
    status: "IN_PROGRESS",
    latitude: 20.3180,
    longitude: 85.8420,
    address_display: "Plot 42, Mancheswar Industrial Estate, Zone 4",
    zone_id: 4,
    zone_name: "Municipal Zone 4 — Mancheswar Logistics & Industrial Hub",
    assigned_department: "Water and Drainage Department",
    sla_hours: 12,
    sla_deadline: "2026-10-31 11:55:00 UTC",
    sla_breached: false,
    created_at: "2026-10-30 20:00:00 UTC",
    updated_at: "2026-10-31 09:00:00 UTC",
    report_count: 1,
    community_upvotes: 11,
    duplicate_match_confidence: 0.0,
    reports: [
      {
        id: "rep-006",
        reporter_alias: "Citizen F (Manoj K.)",
        phone_masked: "+91 91*** **889",
        submitted_at: "11 hours ago",
        latitude: 20.3180,
        longitude: 85.8420,
        media_url: "/images/drainage_before.jpg",
        media_type: "PHOTO",
        extracted_frames: [],
        original_audio_script: "Storm drain overflowing with black sewage water after rain, flooding road corner.",
        detected_language: "en",
        translated_english_text: "Storm drain overflowing with black sewage water after rain, flooding road corner.",
        extracted_urgency_keywords: ["storm drain", "black sewage", "flooding road"],
        phash: "5b2e9a1c8f4d7702",
        evidence_confidence: 91.0,
        evidence_tier: "HIGH",
        location_consistency: "HIGH",
        image_quality: "GOOD",
        flagged_for_human_review: false,
        review_reason: null
      }
    ],
    xai: {
      base_severity: 32,
      proximity_penalty: 20,
      traffic_importance: 15,
      worsening_trend: 12,
      total_risk_score: 79,
      summary_narrative: "P2 High Priority (79/100). Silt and chemical sludge backflow threatening freight logistics route. SLA near breach (< 30 mins remaining).",
      deduplication_reason: "Evaluated as unique civic incident; no active reports within 35m.",
      jurisdiction_rule: "Coordinates fall inside Municipal Zone 4. Category 'Drainage' routes to Water and Drainage Department."
    },
    audit_logs: [
      {
        id: "log-014",
        timestamp: "2026-10-30 20:00:00 UTC",
        actor: "Citizen F",
        actor_role: "CITIZEN",
        action: "SUBMISSION_RECEIVED",
        details: "Drainage flooding reported in Zone 4.",
        cryptographic_hash: "SHA256-ff77ee88dd99aa00"
      },
      {
        id: "log-015",
        timestamp: "2026-10-30 20:01:00 UTC",
        actor: "Jurisdiction Router Node",
        actor_role: "SYSTEM",
        action: "ROUTED_TO_DEPARTMENT",
        details: "Assigned to Water and Drainage Department. 12-hour SLA.",
        cryptographic_hash: "SHA256-1122334455667788"
      }
    ],
    repair_verification: {
      before_image_url: "/images/drainage_before.jpg",
      after_image_url: "/images/drainage_after.jpg",
      officer_id: "OFFICER-ZN4-02",
      officer_name: "Er. Bimal Patnaik (Zonal Drainage Engineer)",
      uploaded_at: "Today 10:45 AM",
      ssim_score: 0.93,
      repair_verification_score: 95.8,
      hazard_resolved: true,
      citizen_feedback_status: "PENDING",
      citizen_dispute_reason: null
    }
  },
  {
    id: "cp-106-master-uuid",
    tracking_number: "CP106",
    title: "Recurring Public Toilet Sanitary Failure & Water Supply Choke",
    category: "PUBLIC_TOILET_ISSUES",
    priority: "P2_HIGH",
    risk_score: 76,
    status: "ASSIGNED",
    latitude: 20.2970,
    longitude: 85.8305,
    address_display: "Public Convenience Complex, Saheed Nagar Park, Zone 2",
    zone_id: 2,
    zone_name: "Municipal Zone 2 — Saheed Nagar Residential Sector",
    assigned_department: "Public Health & Sanitation Division",
    sla_hours: 12,
    sla_deadline: "2026-10-31 18:30:00 UTC",
    sla_breached: false,
    created_at: "2026-10-31 06:30:00 UTC",
    updated_at: "2026-10-31 06:30:00 UTC",
    report_count: 2,
    community_upvotes: 16,
    duplicate_match_confidence: 94.0,
    reports: [
      {
        id: "rep-007",
        reporter_alias: "Citizen G (Sunil T.)",
        phone_masked: "+91 98*** **401",
        submitted_at: "06:30 AM",
        latitude: 20.2970,
        longitude: 85.8305,
        media_url: "/images/toilet_before.jpg",
        media_type: "PHOTO",
        extracted_frames: [],
        original_audio_script: "Public toilet has broken flush valve and severe sewage overflow, unusable for park visitors.",
        detected_language: "en",
        translated_english_text: "Public toilet has broken flush valve and severe sewage overflow, unusable for park visitors.",
        extracted_urgency_keywords: ["broken flush", "sewage overflow", "public toilet"],
        phash: "3c7b9e1a2f4d6688",
        evidence_confidence: 93.0,
        evidence_tier: "HIGH",
        location_consistency: "HIGH",
        image_quality: "GOOD",
        flagged_for_human_review: false,
        review_reason: null
      }
    ],
    xai: {
      base_severity: 30,
      proximity_penalty: 20,
      traffic_importance: 14,
      worsening_trend: 12,
      total_risk_score: 76,
      summary_narrative: "P2 High Priority (76/100). Severe biological sanitation hazard in public utility facility near children's park.",
      deduplication_reason: "Merged with recurring facility maintenance cluster #CP106.",
      jurisdiction_rule: "Coordinates fall inside Municipal Zone 2. Assigned to Public Health & Sanitation Division."
    },
    audit_logs: [
      {
        id: "log-016",
        timestamp: "2026-10-31 06:30:00 UTC",
        actor: "Citizen G",
        actor_role: "CITIZEN",
        action: "SUBMISSION_RECEIVED",
        details: "Public toilet complaint filed.",
        cryptographic_hash: "SHA256-44332211aabbccdd"
      }
    ],
    repair_verification: {
      before_image_url: "/images/toilet_before.jpg",
      after_image_url: "/images/toilet_after.jpg",
      officer_id: "OFFICER-ZN2-07",
      officer_name: "Er. Rashmi Rekha Das (Public Health Officer)",
      uploaded_at: "Today 10:45 AM",
      ssim_score: 0.95,
      repair_verification_score: 93.6,
      hazard_resolved: true,
      citizen_feedback_status: "PENDING",
      citizen_dispute_reason: null
    }
  },
  {
    id: "cp-107-master-uuid",
    tracking_number: "CP107",
    title: "Severe Street Waterlogging (30cm Depth) Trapping Transit Traffic",
    category: "WATERLOGGING",
    priority: "P1_CRITICAL",
    risk_score: 91,
    status: "IN_PROGRESS",
    latitude: 20.2940,
    longitude: 85.8260,
    address_display: "Metro Underpass Intersection, Zone 3",
    zone_id: 3,
    zone_name: "Municipal Zone 3 — Central Tech Corridor & Metro Boulevard",
    assigned_department: "Stormwater Management & Flood Unit",
    sla_hours: 4,
    sla_deadline: "2026-10-31 13:10:00 UTC",
    sla_breached: false,
    created_at: "2026-10-31 09:10:00 UTC",
    updated_at: "2026-10-31 09:30:00 UTC",
    report_count: 3,
    community_upvotes: 28,
    duplicate_match_confidence: 98.0,
    reports: [
      {
        id: "rep-008",
        reporter_alias: "Citizen H (Anita P.)",
        phone_masked: "+91 94*** **910",
        submitted_at: "09:10 AM",
        latitude: 20.2940,
        longitude: 85.8260,
        media_url: "/images/waterlogging_before.jpg",
        media_type: "PHOTO",
        extracted_frames: [],
        original_audio_script: "Metro underpass flooded knee-deep, two auto-rickshaws stalled in water.",
        detected_language: "en",
        translated_english_text: "Metro underpass flooded knee-deep, two auto-rickshaws stalled in water.",
        extracted_urgency_keywords: ["flooded knee-deep", "stalled auto-rickshaws", "waterlogging"],
        phash: "1e9f4a2b8c5d7711",
        evidence_confidence: 96.0,
        evidence_tier: "HIGH",
        location_consistency: "HIGH",
        image_quality: "GOOD",
        flagged_for_human_review: false,
        review_reason: null
      }
    ],
    xai: {
      base_severity: 36,
      proximity_penalty: 24,
      traffic_importance: 20,
      worsening_trend: 11,
      total_risk_score: 91,
      summary_narrative: "P1 Critical Emergency (91/100). Recurring monsoon waterlogging hotspot blocking arterial underpass with 30cm water depth.",
      deduplication_reason: "Merged 3 citizen complaints into recurring hotspot cluster #CP107.",
      jurisdiction_rule: "Coordinates fall inside Municipal Zone 3. Dispatched to Stormwater Management & Flood Unit."
    },
    audit_logs: [
      {
        id: "log-017",
        timestamp: "2026-10-31 09:10:00 UTC",
        actor: "Citizen H",
        actor_role: "CITIZEN",
        action: "SUBMISSION_RECEIVED",
        details: "Waterlogging emergency reported.",
        cryptographic_hash: "SHA256-5566778899aabbcc"
      }
    ],
    repair_verification: {
      before_image_url: "/images/waterlogging_before.jpg",
      after_image_url: "/images/waterlogging_after.jpg",
      officer_id: "OFFICER-ZN3-05",
      officer_name: "Er. Kedar Panda (Stormwater Operations Lead)",
      uploaded_at: "Today 10:45 AM",
      ssim_score: 0.96,
      repair_verification_score: 97.1,
      hazard_resolved: true,
      citizen_feedback_status: "PENDING",
      citizen_dispute_reason: null
    }
  },
  {
    id: "cp-108-master-uuid",
    tracking_number: "CP108",
    title: "Uncovered Open Manhole Chamber on Pedestrian Walkway",
    category: "OPEN_MANHOLE_HAZARDS",
    priority: "P1_CRITICAL",
    risk_score: 95,
    status: "IN_PROGRESS",
    latitude: 20.2820,
    longitude: 85.8180,
    address_display: "Near Heritage Market Lane, Zone 1",
    zone_id: 1,
    zone_name: "Municipal Zone 1 — Old City & Heritage Corridor",
    assigned_department: "Emergency Civil Infrastructure Unit",
    sla_hours: 4,
    sla_deadline: "2026-10-31 12:15:00 UTC",
    sla_breached: false,
    created_at: "2026-10-31 08:15:00 UTC",
    updated_at: "2026-10-31 09:15:00 UTC",
    report_count: 2,
    community_upvotes: 22,
    duplicate_match_confidence: 97.0,
    reports: [
      {
        id: "rep-009",
        reporter_alias: "Citizen I (Alok B.)",
        phone_masked: "+91 93*** **118",
        submitted_at: "08:15 AM",
        latitude: 20.2820,
        longitude: 85.8180,
        media_url: "/images/manhole_before.jpg",
        media_type: "PHOTO",
        extracted_frames: [],
        original_audio_script: "Open manhole cover stolen or broken, deep drop in middle of footpath.",
        detected_language: "en",
        translated_english_text: "Open manhole cover stolen or broken, deep drop in middle of footpath.",
        extracted_urgency_keywords: ["open manhole", "deep drop", "fatal fall risk"],
        phash: "2f8a9c1e7b4d5500",
        evidence_confidence: 98.0,
        evidence_tier: "HIGH",
        location_consistency: "HIGH",
        image_quality: "GOOD",
        flagged_for_human_review: false,
        review_reason: null
      }
    ],
    xai: {
      base_severity: 38,
      proximity_penalty: 25,
      traffic_importance: 20,
      worsening_trend: 12,
      total_risk_score: 95,
      summary_narrative: "P1 Critical Safety Emergency (95/100). Uncovered 2-meter deep sewer chamber creating imminent fatal fall risk for pedestrians.",
      deduplication_reason: "Merged into open manhole emergency ticket #CP108.",
      jurisdiction_rule: "Coordinates fall inside Municipal Zone 1. Dispatched to Emergency Civil Infrastructure Unit."
    },
    audit_logs: [
      {
        id: "log-018",
        timestamp: "2026-10-31 08:15:00 UTC",
        actor: "Citizen I",
        actor_role: "CITIZEN",
        action: "SUBMISSION_RECEIVED",
        details: "Open manhole hazard reported.",
        cryptographic_hash: "SHA256-6677889900aabbcc"
      }
    ],
    repair_verification: {
      before_image_url: "/images/manhole_before.jpg",
      after_image_url: "/images/manhole_after.jpg",
      officer_id: "OFFICER-ZN1-09",
      officer_name: "Er. Alok Das (Emergency Infrastructure Team)",
      uploaded_at: "Today 10:45 AM",
      ssim_score: 0.97,
      repair_verification_score: 98.4,
      hazard_resolved: true,
      citizen_feedback_status: "PENDING",
      citizen_dispute_reason: null
    }
  }
];

const DEFAULT_KPI: KPIGridSummary = {
  total_reports: 1250,
  verified_incidents: 840,
  duplicate_reports_merged: 310,
  pending_incidents: 120,
  critical_incidents: 18,
  resolved_incidents: 720
};

const CivicPulseContext = createContext<CivicPulseContextType | undefined>(undefined);

export const CivicPulseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Direct Dashboard Access (No Starting Page Auth Barrier)
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'USR-CITIZEN-01',
    full_name: 'Citizen (Direct Access)',
    phone_number: '9876543210',
    role: 'CITIZEN',
    created_at: '2026-10-31 00:00:00 UTC'
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState<boolean>(false);

  const [incidents, setIncidents] = useState<MasterIncident[]>(DEFAULT_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<MasterIncident | null>(DEFAULT_INCIDENTS[0]);
  const [zones] = useState<MunicipalZone[]>(DEFAULT_ZONES);
  const [kpi, setKpi] = useState<KPIGridSummary>(DEFAULT_KPI);
  
  const [role, setRole] = useState<'CITIZEN' | 'OFFICER' | 'DEMO'>('CITIZEN');
  const [citizenTab, setCitizenTab] = useState<'REPORT' | 'TRACK' | 'CONFIRM'>('REPORT');
  const [officerTab, setOfficerTab] = useState<'MAP' | 'SLA_BOARD' | 'REVIEW_QUEUE'>('MAP');
  
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Officer Modal State
  const [officerModalOpen, setOfficerModalOpen] = useState<boolean>(false);
  const [repairTargetTracking, setRepairTargetTracking] = useState<string | null>(null);

  // 90-Second Demo Simulator State
  const [demoStep, setDemoStep] = useState<number>(1);
  const [demoAutoPlaying, setDemoAutoPlaying] = useState<boolean>(false);

  const clearNotification = useCallback(() => setNotification(null), []);

  const selectIncidentByTracking = useCallback((trackingNumber: string) => {
    const found = incidents.find(
      (inc) => inc.tracking_number.toUpperCase() === trackingNumber.toUpperCase()
    );
    if (found) {
      setSelectedIncident(found);
    }
  }, [incidents]);

  // Connect to live WebSocket with graceful fallback
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === 'UPVOTE_ADDED') {
              setIncidents((prev) =>
                prev.map((inc) =>
                  inc.tracking_number === data.tracking_number
                    ? { ...inc, community_upvotes: data.community_upvotes }
                    : inc
                )
              );
            } else if (data.event === 'DUPLICATE_MERGED') {
              setNotification(`AI Duplicate Merged: Citizen report merged into #${data.tracking_number} (${data.match_confidence}% confidence)`);
              setKpi((prev) => ({
                ...prev,
                total_reports: data.total_reports || prev.total_reports + 1,
                duplicate_reports_merged: data.duplicate_reports_merged || prev.duplicate_reports_merged + 1
              }));
            } else if (data.event === 'REPAIR_VERIFIED') {
              setNotification(`AI Repair Verified for #${data.tracking_number} (${data.verification_score}%). Awaiting citizen confirmation.`);
            }
          } catch (e) {
            console.error('WS Parse error', e);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = () => {
          setWsConnected(false);
          ws?.close();
        };
      } catch (err) {
        setWsConnected(false);
      }
    };

    connectWebSocket();

    // Fetch live backend incidents on mount
    const fetchLiveIncidents = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/incidents`);
        if (res.ok) {
          const list: MasterIncident[] = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            setIncidents(list);
            setSelectedIncident((curr) => {
              if (!curr) return list[0];
              const match = list.find((i) => i.tracking_number === curr.tracking_number);
              return match || list[0];
            });
          }
        }
      } catch (err) {
        // Fallback to updated DEFAULT_INCIDENTS
      }
    };
    fetchLiveIncidents();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // Helper to store tokens across all standard key identifiers
  const saveAuthToken = (token: string, remember: boolean = true) => {
    if (remember) {
      localStorage.setItem('civicpulse_auth_token', token);
      localStorage.setItem('civicpulse_token', token);
      sessionStorage.removeItem('civicpulse_auth_token');
      sessionStorage.removeItem('civicpulse_token');
    } else {
      sessionStorage.setItem('civicpulse_auth_token', token);
      sessionStorage.setItem('civicpulse_token', token);
      localStorage.removeItem('civicpulse_auth_token');
      localStorage.removeItem('civicpulse_token');
    }
  };

  const clearAuthTokens = () => {
    localStorage.removeItem('civicpulse_auth_token');
    localStorage.removeItem('civicpulse_token');
    sessionStorage.removeItem('civicpulse_auth_token');
    sessionStorage.removeItem('civicpulse_token');
  };

  const getSavedToken = (): string | null => {
    return localStorage.getItem('civicpulse_auth_token') ||
           localStorage.getItem('civicpulse_token') ||
           sessionStorage.getItem('civicpulse_auth_token') ||
           sessionStorage.getItem('civicpulse_token');
  };

  // Direct Dashboard Access (Auth verification bypass)
  useEffect(() => {
    setAuthLoading(false);
    setIsAuthenticated(true);
  }, []);

  // Authentication Actions
  const login = useCallback(async (credentials: LoginFormData) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = typeof data.detail === 'string'
          ? data.detail
          : (Array.isArray(data.detail) ? data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ') : 'Login failed.');
        return { success: false, message: errMsg };
      }

      saveAuthToken(data.token, credentials.remember_me !== false);
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      if (data.user.role === 'OFFICER') {
        setRole('OFFICER');
      }
      setNotification(`Welcome back, ${data.user.full_name}!`);
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Could not connect to authentication server. Please ensure backend is running.' };
    }
  }, []);

  const register = useCallback(async (formData: RegisterFormData) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = typeof data.detail === 'string'
          ? data.detail
          : (Array.isArray(data.detail) ? data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ') : 'Registration failed.');
        return { success: false, message: errMsg };
      }

      saveAuthToken(data.token, true);
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      if (data.user.role === 'OFFICER') {
        setRole('OFFICER');
      }
      setNotification(`Account registered! Welcome to CivicPulse, ${data.user.full_name}.`);
      return { success: true, message: data.message };
    } catch (e) {
      return { success: false, message: 'Could not connect to authentication server. Please ensure backend is running.' };
    }
  }, []);

  const logout = useCallback(async () => {
    const token = getSavedToken();
    try {
      if (token) {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.warn('Backend logout failed', e);
    }
    clearAuthTokens();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setNotification('You have logged out successfully.');
  }, []);


  // 1-Click Community Confirmation
  const confirmIncident = useCallback(async (trackingNumber: string) => {
    // Optimistic local state update
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.tracking_number === trackingNumber) {
          const newUpvotes = inc.community_upvotes + 1;
          const updated: MasterIncident = {
            ...inc,
            community_upvotes: newUpvotes,
            audit_logs: [
              ...inc.audit_logs,
              {
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString(),
                actor: 'Nearby Citizen (+1)',
                actor_role: 'CITIZEN',
                action: 'COMMUNITY_CONFIRMED',
                details: `1-Tap independent community verification registered. Total upvotes: ${newUpvotes}.`,
                cryptographic_hash: `SHA256-${Math.random().toString(16).substring(2, 10)}`
              }
            ]
          };
          if (selectedIncident?.tracking_number === trackingNumber) {
            setSelectedIncident(updated);
          }
          return updated;
        }
        return inc;
      })
    );

    setNotification(`Community confirmation (+1) registered for #${trackingNumber}!`);

    // Try sync with backend
    try {
      await fetch(`${API_BASE}/api/incidents/${trackingNumber}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      // Local state already updated
    }
  }, [selectedIncident]);

  // Direct Incident Status Update (e.g. In Progress, Fixed / Resolved, Assigned, Submitted)
  const updateIncidentStatus = useCallback(async (trackingNumber: string, newStatus: string, notes?: string) => {
    // Optimistic local update
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.tracking_number.toUpperCase() === trackingNumber.toUpperCase()) {
          return {
            ...inc,
            status: newStatus as any,
            updated_at: 'Just now'
          };
        }
        return inc;
      })
    );

    setSelectedIncident((curr) => {
      if (curr && curr.tracking_number.toUpperCase() === trackingNumber.toUpperCase()) {
        return {
          ...curr,
          status: newStatus as any,
          updated_at: 'Just now'
        };
      }
      return curr;
    });

    try {
      const res = await fetch(`${API_BASE}/api/incidents/${trackingNumber}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          actor_name: currentUser ? currentUser.full_name : 'Municipal Authority',
          notes: notes || `Status updated to ${newStatus}`
        })
      });
      if (res.ok) {
        setNotification(`Ticket #${trackingNumber} status updated to: ${newStatus.replace('_', ' ')}`);
      }
    } catch (e) {
      console.warn('Backend status update failed, local state updated');
    }
  }, [currentUser]);

  // Submit Report
  const submitReport = useCallback(async (formData: any) => {
    try {
      const res = await fetch(`${API_BASE}/api/reports/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.incident) {
          setIncidents((prev) => [data.incident, ...prev.filter((i) => i.tracking_number !== data.incident.tracking_number)]);
          setSelectedIncident(data.incident);
        }
        // Refresh incidents from backend if possible
        try {
          const fetchRes = await fetch(`${API_BASE}/api/incidents`);
          if (fetchRes.ok) {
            const incList = await fetchRes.json();
            setIncidents(incList);
            selectIncidentByTracking(data.tracking_number);
          }
        } catch (_) {}
        return {
          status: data.status,
          trackingNumber: data.tracking_number,
          isDuplicate: data.is_duplicate
        };
      }
    } catch (e) {
      console.warn('Backend submit unavailable; applying client simulation');
    }

    // Client fallback simulation
    const lat = Number(formData.latitude) || 20.2961;
    const lon = Number(formData.longitude) || 85.8245;

    // Check if within 45m of an active incident of same category (or demo coordinate 20.2961)
    const existingMatch = incidents.find((inc) => {
      if (inc.status === 'RESOLVED') return false;
      const dLat = (inc.latitude - lat) * 111000;
      const dLon = (inc.longitude - lon) * 111000 * Math.cos(lat * (Math.PI / 180));
      const dist = Math.sqrt(dLat * dLat + dLon * dLon);
      return (dist <= 45 && inc.category === formData.category) || (lat === 20.2961 && inc.tracking_number === 'CP102');
    });

    if (existingMatch) {
      const newReport: CitizenReport = {
        id: `rep-${Date.now()}`,
        reporter_alias: formData.reporter_alias || (currentUser ? `${currentUser.full_name} (${currentUser.phone_number})` : 'Citizen Reporter'),
        phone_masked: currentUser ? currentUser.phone_number.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : '+91 97*** **842',
        submitted_at: 'Just now',
        latitude: lat,
        longitude: lon,
        media_url: formData.media_url || existingMatch.reports[0]?.media_url || '/images/road_pothole_angle2.jpg',
        media_type: formData.media_type || 'PHOTO',
        extracted_frames: [],
        original_audio_script: formData.audio_script || formData.raw_text || 'Civic hazard reported by citizen.',
        detected_language: formData.detected_language || 'en',
        translated_english_text: formData.translated_english || formData.raw_text || 'Civic hazard reported by citizen.',
        extracted_urgency_keywords: ['civic hazard', 'duplicate hotspot'],
        phash: '3f8a9c1e7b2d5a42',
        evidence_confidence: 96.0,
        evidence_tier: 'HIGH' as const,
        location_consistency: 'HIGH' as const,
        image_quality: 'GOOD' as const,
        flagged_for_human_review: false,
        review_reason: null
      };

      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc.tracking_number === existingMatch.tracking_number) {
            const updated: MasterIncident = {
              ...inc,
              report_count: inc.report_count + 1,
              duplicate_match_confidence: 96.0,
              community_upvotes: inc.community_upvotes + 1,
              reports: [...inc.reports, newReport],
              audit_logs: [
                ...inc.audit_logs,
                {
                  id: `log-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  actor: 'AI Spatial Deduplication Node',
                  actor_role: 'SYSTEM',
                  action: 'DUPLICATE_MERGED',
                  details: `Citizen report merged into ticket #${existingMatch.tracking_number} (geospatial cluster match). Priority boosted.`,
                  cryptographic_hash: `SHA256-${Math.random().toString(16).substring(2, 10)}`
                }
              ]
            };
            setSelectedIncident(updated);
            return updated;
          }
          return inc;
        })
      );
      setKpi((prev) => ({
        ...prev,
        total_reports: prev.total_reports + 1,
        duplicate_reports_merged: prev.duplicate_reports_merged + 1
      }));
      return { status: 'MERGED', trackingNumber: existingMatch.tracking_number, isDuplicate: true };
    }

    // New unique incident creation
    const nextNum = Math.max(105, ...incidents.map((i) => parseInt(i.tracking_number.replace(/\D/g, '')) || 100)) + 1;
    const trackingNumber = `CP${nextNum}`;
    const cat = formData.category || 'POTHOLE_ROAD_DAMAGE';
    const rawText = (formData.raw_text || formData.translated_english || '').trim();

    const catMeta: Record<string, { dept: string; priority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM'; risk: number; sla: number; defaultTitle: string }> = {
      POTHOLE_ROAD_DAMAGE: { dept: 'Road Maintenance Department', priority: 'P1_CRITICAL', risk: 92, sla: 4, defaultTitle: 'Severe Road Crater & Pothole Hazard' },
      OPEN_MANHOLE_HAZARDS: { dept: 'Stormwater Drainage & Sewerage Division', priority: 'P1_CRITICAL', risk: 95, sla: 4, defaultTitle: 'Open Uncovered Sewer Manhole' },
      WATERLOGGING: { dept: 'Stormwater Drainage & Sewerage Division', priority: 'P1_CRITICAL', risk: 88, sla: 6, defaultTitle: 'Severe Roadway Waterlogging & Standing Water' },
      GARBAGE_OVERFLOW: { dept: 'Sanitation & Solid Waste Management', priority: 'P2_HIGH', risk: 78, sla: 8, defaultTitle: 'Overflowing Uncollected Waste & Garbage' },
      BROKEN_STREETLIGHT: { dept: 'Electrical & Public Lighting Division', priority: 'P2_HIGH', risk: 74, sla: 12, defaultTitle: 'Broken Luminaire & Streetlight Outage' },
      DRAINAGE_WATER_LEAKAGE: { dept: 'Heavy Infrastructure & Industrial Drainage', priority: 'P2_HIGH', risk: 82, sla: 8, defaultTitle: 'Choked Storm Drain & Sewage Leakage' },
      PUBLIC_TOILET_ISSUES: { dept: 'Urban Amenities & Civil Infrastructure', priority: 'P2_HIGH', risk: 70, sla: 12, defaultTitle: 'Public Toilet Facility Sanitary Defect' },
      OTHERS: { dept: 'General Municipal Grievance & Civil Cell', priority: 'P3_MEDIUM', risk: 65, sla: 24, defaultTitle: 'Citizen Municipal Grievance' }
    };

    const meta = catMeta[cat] || catMeta.OTHERS;
    const title = rawText.length > 5
      ? (rawText.length > 75 ? `${rawText.slice(0, 72)}...` : rawText)
      : `${meta.defaultTitle} at (${lat.toFixed(4)}, ${lon.toFixed(4)})`;

    // Locate closest zone
    const zone = DEFAULT_ZONES.find((z) => {
      const poly = z.boundary_polygon;
      const minLat = Math.min(...poly.map((p) => p[0]));
      const maxLat = Math.max(...poly.map((p) => p[0]));
      const minLon = Math.min(...poly.map((p) => p[1]));
      const maxLon = Math.max(...poly.map((p) => p[1]));
      return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
    }) || DEFAULT_ZONES[2];

    const nowIso = new Date().toISOString();
    const deadlineDate = new Date(Date.now() + meta.sla * 3600 * 1000);
    const deadlineStr = `${deadlineDate.toISOString().replace('T', ' ').slice(0, 19)} UTC`;

    const newIncident: MasterIncident = {
      id: `cp-${nextNum}-master-uuid`,
      tracking_number: trackingNumber,
      title: title,
      category: cat,
      priority: meta.priority,
      risk_score: meta.risk,
      status: 'VERIFIED',
      latitude: lat,
      longitude: lon,
      address_display: `Near ${zone.zone_name.split('—')[1]?.trim() || 'Central Sector'}, (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
      zone_id: zone.zone_id,
      zone_name: zone.zone_name,
      assigned_department: meta.dept,
      sla_hours: meta.sla,
      sla_deadline: deadlineStr,
      sla_breached: false,
      created_at: `${nowIso.replace('T', ' ').slice(0, 19)} UTC`,
      updated_at: `${nowIso.replace('T', ' ').slice(0, 19)} UTC`,
      report_count: 1,
      community_upvotes: 1,
      duplicate_match_confidence: 0,
      reports: [
        {
          id: `rep-${Date.now()}`,
          reporter_alias: formData.reporter_alias || (currentUser ? `${currentUser.full_name} (${currentUser.phone_number})` : 'Citizen Civic Inspector'),
          phone_masked: currentUser ? currentUser.phone_number.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : '+91 98*** **321',
          submitted_at: 'Just now',
          latitude: lat,
          longitude: lon,
          media_url: formData.media_url || '/images/road_pothole_before.jpg',
          media_type: formData.media_type || 'PHOTO',
          extracted_frames: [],
          original_audio_script: formData.audio_script || rawText || title,
          detected_language: formData.detected_language || 'en',
          translated_english_text: formData.translated_english || rawText || title,
          extracted_urgency_keywords: ['citizen report', 'verified defect', 'civic hazard'],
          phash: '3f8a9c1e7b2d5a42',
          evidence_confidence: 94.0,
          evidence_tier: 'HIGH' as const,
          location_consistency: 'HIGH' as const,
          image_quality: 'GOOD' as const,
          flagged_for_human_review: false,
          review_reason: null
        }
      ],
      audit_logs: [
        {
          id: `log-${Date.now()}-1`,
          timestamp: `${nowIso.replace('T', ' ').slice(0, 19)} UTC`,
          actor: 'Citizen Ingestion Gateway',
          actor_role: 'CITIZEN',
          action: 'REPORT_SUBMITTED',
          details: `Filed by ${formData.reporter_alias || 'Citizen'} with GPS (${lat}, ${lon}) & image evidence. Description: "${rawText.slice(0, 60)}"`,
          cryptographic_hash: `SHA256-${Math.random().toString(16).substring(2, 10)}`
        },
        {
          id: `log-${Date.now()}-2`,
          timestamp: `${nowIso.replace('T', ' ').slice(0, 19)} UTC`,
          actor: 'LangGraph Orchestrator & YOLO Engine',
          actor_role: 'SYSTEM',
          action: 'INCIDENT_VERIFIED',
          details: `Autonomous verification complete. Routed to ${meta.dept}. SLA timer started (${meta.sla}h deadline).`,
          cryptographic_hash: `SHA256-${Math.random().toString(16).substring(2, 10)}`
        }
      ],
      xai: {
        base_severity: Math.round(meta.risk * 0.4),
        proximity_penalty: 15,
        traffic_importance: 20,
        worsening_trend: 10,
        total_risk_score: meta.risk,
        summary_narrative: `AI verified ${cat.replace(/_/g, ' ')} from citizen submission. Explainable AI risk computed at ${meta.risk}/100.`,
        deduplication_reason: 'Evaluated as unique civic incident; no active reports within spatial threshold.',
        jurisdiction_rule: `Automatically routed to ${meta.dept} under Municipal ${zone.zone_code}.`
      }
    };

    setIncidents((prev) => [newIncident, ...prev]);
    setSelectedIncident(newIncident);
    setKpi((prev) => ({
      ...prev,
      total_reports: prev.total_reports + 1,
      pending_incidents: prev.pending_incidents + 1,
      verified_incidents: prev.verified_incidents + 1,
      critical_incidents: meta.priority === 'P1_CRITICAL' ? prev.critical_incidents + 1 : prev.critical_incidents
    }));

    return { status: 'CREATED', trackingNumber: trackingNumber, isDuplicate: false };
  }, [incidents, currentUser, selectIncidentByTracking]);

  // Officer Verify Repair
  const verifyRepair = useCallback(async (trackingNumber: string, afterImageUrl: string, lat: number, lon: number) => {
    const categoryAfterMap: Record<string, string> = {
      POTHOLE_ROAD_DAMAGE: '/images/road_pothole_after.jpg',
      GARBAGE_OVERFLOW: '/images/garbage_after.jpg',
      BROKEN_STREETLIGHT: '/images/streetlight_after.jpg',
      DRAINAGE_WATER_LEAKAGE: '/images/drainage_after.jpg',
      PUBLIC_TOILET_ISSUES: '/images/toilet_after.jpg',
      WATERLOGGING: '/images/waterlogging_after.jpg',
      OPEN_MANHOLE_HAZARDS: '/images/manhole_after.jpg'
    };
    const categoryBeforeMap: Record<string, string> = {
      POTHOLE_ROAD_DAMAGE: '/images/road_pothole_before.jpg',
      GARBAGE_OVERFLOW: '/images/garbage_before.jpg',
      BROKEN_STREETLIGHT: '/images/streetlight_before.jpg',
      DRAINAGE_WATER_LEAKAGE: '/images/drainage_before.jpg',
      PUBLIC_TOILET_ISSUES: '/images/toilet_before.jpg',
      WATERLOGGING: '/images/waterlogging_before.jpg',
      OPEN_MANHOLE_HAZARDS: '/images/manhole_before.jpg'
    };

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.tracking_number === trackingNumber) {
          const resolvedAfter = (afterImageUrl && !afterImageUrl.includes('placeholder')) 
            ? afterImageUrl 
            : (categoryAfterMap[inc.category] || '/images/road_pothole_after.jpg');
          const resolvedBefore = inc.reports[0]?.media_url || categoryBeforeMap[inc.category] || '/images/road_pothole_before.jpg';

          const updated: MasterIncident = {
            ...inc,
            status: 'AWAITING_CITIZEN_CONFIRMATION',
            repair_verification: {
              before_image_url: resolvedBefore,
              after_image_url: resolvedAfter,
              officer_id: 'OFFICER-ZN3-01',
              officer_name: 'Er. Alok Das (Chief Zonal Engineer)',
              uploaded_at: 'Just now',
              ssim_score: 0.89,
              repair_verification_score: 91.4,
              hazard_resolved: true,
              citizen_feedback_status: 'PENDING',
              citizen_dispute_reason: null
            },
            audit_logs: [
              ...inc.audit_logs,
              {
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString(),
                actor: 'Er. Alok Das (Chief Zonal Engineer)',
                actor_role: 'MUNICIPAL_OFFICER',
                action: 'AFTER_REPAIR_SUBMITTED',
                details: 'Uploaded after-repair road photo. AI verification: 91.4%. Status transitioned to Awaiting Citizen Confirmation.',
                cryptographic_hash: `SHA256-${Math.random().toString(16).substring(2, 10)}`
              }
            ]
          };
          if (selectedIncident?.tracking_number === trackingNumber) {
            setSelectedIncident(updated);
          }
          return updated;
        }
        return inc;
      })
    );

    setNotification(`AI Repair Verification: 91.4% match! #${trackingNumber} moved to Awaiting Citizen Confirmation.`);

    try {
      await fetch(`${API_BASE}/api/incidents/${trackingNumber}/verify-repair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officer_id: 'OFFICER-ZN3-01',
          officer_name: 'Er. Alok Das (Chief Zonal Engineer)',
          after_image_url: afterImageUrl,
          latitude: lat,
          longitude: lon
        })
      });
    } catch (e) {
      // Local state is already updated
    }
  }, [selectedIncident]);

  // Citizen Confirm / Dispute Repair
  const submitCitizenFeedback = useCallback(async (trackingNumber: string, action: 'CONFIRM' | 'DISPUTE', reason?: string) => {
    const defaultDisputeMap: Record<string, string> = {
      POTHOLE_ROAD_DAMAGE: 'Road repair incomplete or uneven asphalt surface',
      GARBAGE_OVERFLOW: 'Garbage heap not completely cleared, residue remaining',
      BROKEN_STREETLIGHT: 'Streetlight still dark or luminaire not replaced',
      DRAINAGE_WATER_LEAKAGE: 'Storm drain still blocked, blackwater continuing to pool',
      PUBLIC_TOILET_ISSUES: 'Facility sanitation still defective or unhygienic',
      WATERLOGGING: 'Water accumulation still persistent on underpass',
      OPEN_MANHOLE_HAZARDS: 'Manhole chamber cover loose or unsafe'
    };

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.tracking_number === trackingNumber && inc.repair_verification) {
          const newStatus = action === 'CONFIRM' ? 'RESOLVED' : 'DISPUTED';
          const updated: MasterIncident = {
            ...inc,
            status: newStatus,
            repair_verification: {
              ...inc.repair_verification,
              citizen_feedback_status: action === 'CONFIRM' ? 'CONFIRMED' : 'DISPUTED',
              citizen_dispute_reason: action === 'DISPUTE' ? reason || (defaultDisputeMap[inc.category] || 'Hazard condition remains unresolved') : null
            },
            audit_logs: [
              ...inc.audit_logs,
              {
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString(),
                actor: 'Citizen Reporter',
                actor_role: 'CITIZEN',
                action: action === 'CONFIRM' ? 'CITIZEN_CONFIRMED_RESOLUTION' : 'REPAIR_DISPUTED',
                details: action === 'CONFIRM'
                  ? 'Citizen approved repaired road quality. Ticket officially marked RESOLVED.'
                  : `Citizen disputed repair: "${reason}". Escalated to Department Supervisor.`,
                cryptographic_hash: `SHA256-${Math.random().toString(16).substring(2, 10)}`
              }
            ]
          };
          if (selectedIncident?.tracking_number === trackingNumber) {
            setSelectedIncident(updated);
          }
          return updated;
        }
        return inc;
      })
    );

    if (action === 'CONFIRM') {
      setKpi((prev) => ({
        ...prev,
        pending_incidents: Math.max(0, prev.pending_incidents - 1),
        resolved_incidents: prev.resolved_incidents + 1
      }));
      setNotification(`Incident #${trackingNumber} officially confirmed & CLOSED by citizen!`);
    } else {
      setNotification(`Repair dispute filed for #${trackingNumber}. Escalated to Supervisor.`);
    }

    try {
      await fetch(`${API_BASE}/api/incidents/${trackingNumber}/citizen-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, dispute_reason: reason })
      });
    } catch (e) {
      // Local state already updated
    }
  }, [selectedIncident]);

  // Officer Approve Review Queue Item
  const approveReviewItem = useCallback((trackingNumber: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.tracking_number === trackingNumber) {
          const updated: MasterIncident = {
            ...inc,
            reports: inc.reports.map((r) => ({
              ...r,
              flagged_for_human_review: false,
              verified_by_officer: true
            })),
            audit_logs: [
              ...inc.audit_logs,
              {
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString(),
                actor: 'Officer Er. Rajesh Mohapatra',
                actor_role: 'MUNICIPAL_OFFICER',
                action: 'OFFICER_REVIEW_APPROVED',
                details: 'Officer physically confirmed evidence authenticity despite nighttime glare. Marked Verified.',
                cryptographic_hash: `SHA256-${Math.random().toString(16).substring(2, 10)}`
              }
            ]
          };
          if (selectedIncident?.tracking_number === trackingNumber) {
            setSelectedIncident(updated);
          }
          return updated;
        }
        return inc;
      })
    );
    setNotification(`Evidence for #${trackingNumber} approved by municipal officer!`);
  }, [selectedIncident]);

  // Reset Demo State
  const resetDemo = useCallback(async () => {
    setIncidents(DEFAULT_INCIDENTS);
    setSelectedIncident(DEFAULT_INCIDENTS[0]);
    setKpi(DEFAULT_KPI);
    setDemoStep(1);
    setDemoAutoPlaying(false);
    setNotification('Demo simulator state reset to pristine baseline (#CP102 ready).');

    try {
      await fetch(`${API_BASE}/api/demo/reset`, { method: 'POST' });
    } catch (e) {
      // Local reset done
    }
  }, []);

  const toggleDemoAutoPlay = useCallback(() => {
    setDemoAutoPlaying((prev) => !prev);
  }, []);

  return (
    <CivicPulseContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        authLoading,
        logoutModalOpen,
        setLogoutModalOpen,
        login,
        register,
        logout,
        incidents,
        selectedIncident,
        setSelectedIncident,
        selectIncidentByTracking,
        zones,
        kpi,
        role,
        setRole,
        citizenTab,
        setCitizenTab,
        officerTab,
        setOfficerTab,
        wsConnected,
        notification,
        clearNotification,
        submitReport,
        confirmIncident,
        updateIncidentStatus,
        verifyRepair,
        submitCitizenFeedback,
        approveReviewItem,
        officerModalOpen,
        setOfficerModalOpen,
        repairTargetTracking,
        setRepairTargetTracking,
        demoStep,
        demoAutoPlaying,
        setDemoStep,
        toggleDemoAutoPlay,
        resetDemo
      }}
    >
      {children}
    </CivicPulseContext.Provider>
  );
};

export const useCivicPulse = () => {
  const context = useContext(CivicPulseContext);
  if (!context) {
    throw new Error('useCivicPulse must be used within a CivicPulseProvider');
  }
  return context;
};

