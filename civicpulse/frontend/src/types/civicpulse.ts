/**
 * Domain Type Definitions for CivicPulse
 * Strict negative constraints applied:
 * - NO average resolution time
 * - NO predictive analytics
 * - NO digital twin
 */

export type IncidentCategory =
  | 'POTHOLE_ROAD_DAMAGE'       // Roads with repeated potholes & cracks
  | 'GARBAGE_OVERFLOW'         // Areas with recurring garbage overflow
  | 'PUBLIC_TOILET_ISSUES'     // Public toilet hygiene & plumbing
  | 'WATERLOGGING'             // Street waterlogging & flood inundation
  | 'DRAINAGE_WATER_LEAKAGE'   // Locations with frequent drainage complaints
  | 'BROKEN_STREETLIGHT'       // Streetlights that repeatedly fail
  | 'OPEN_MANHOLE_HAZARDS'    // Open manholes & severe physical hazards
  | 'OTHERS';                  // Other civic issues

export type PriorityTier = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';

export type IncidentStatus =
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'AWAITING_CITIZEN_CONFIRMATION'
  | 'DISPUTED'
  | 'CLOSED';

export type EvidenceConfidenceTier = 'HIGH' | 'MEDIUM' | 'LOW' | 'SUSPICIOUS';

export type LocationConsistency = 'HIGH' | 'MEDIUM' | 'LOW';

export type ImageQuality = 'GOOD' | 'FAIR' | 'POOR';

export interface BoundingBox {
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  severity_note: string;
}

export interface VideoFrame {
  frame_index: number;
  timestamp_offset_sec: number;
  image_url: string;
  blur_score: number;
  detections: BoundingBox[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actor_role: string;
  action: string;
  details: string;
  cryptographic_hash: string;
}

export interface XAIFactorBreakdown {
  base_severity: number;
  proximity_penalty: number;
  traffic_importance: number;
  worsening_trend: number;
  total_risk_score: number;
  summary_narrative: string;
  deduplication_reason?: string;
  jurisdiction_rule: string;
}

export interface BeforeAfterVerification {
  before_image_url: string;
  after_image_url: string;
  officer_id: string;
  officer_name: string;
  uploaded_at: string;
  ssim_score: number;
  repair_verification_score: number;
  hazard_resolved: boolean;
  citizen_feedback_status: 'PENDING' | 'CONFIRMED' | 'DISPUTED';
  citizen_dispute_reason?: string | null;
}

export interface CitizenReport {
  id: string;
  reporter_alias: string;
  phone_masked: string;
  submitted_at: string;
  latitude: number;
  longitude: number;
  media_url: string;
  media_type: 'VIDEO' | 'PHOTO';
  extracted_frames: VideoFrame[];
  original_audio_script?: string;
  detected_language?: string;
  translated_english_text?: string;
  extracted_urgency_keywords: string[];
  phash: string;
  evidence_confidence: number;
  evidence_tier: EvidenceConfidenceTier;
  location_consistency: LocationConsistency;
  image_quality: ImageQuality;
  flagged_for_human_review: boolean;
  review_reason?: string | null;
  verified_by_officer?: boolean;
}

export interface MasterIncident {
  id: string;
  tracking_number: string;
  title: string;
  category: IncidentCategory;
  priority: PriorityTier;
  risk_score: number;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  address_display: string;
  zone_id: number;
  zone_name: string;
  assigned_department: string;
  sla_hours: number;
  sla_deadline: string;
  sla_breached: boolean;
  created_at: string;
  updated_at: string;
  report_count: number;
  community_upvotes: number;
  duplicate_match_confidence: number;
  reports: CitizenReport[];
  xai: XAIFactorBreakdown;
  audit_logs: AuditLogEntry[];
  repair_verification?: BeforeAfterVerification | null;
}

export interface MunicipalZone {
  zone_id: number;
  zone_code: string;
  zone_name: string;
  boundary_polygon: [number, number][];
  responsible_department: string;
  ward_officer: string;
  contact_phone: string;
}

export interface KPIGridSummary {
  total_reports: number;
  verified_incidents: number;
  duplicate_reports_merged: number;
  pending_incidents: number;
  critical_incidents: number;
  resolved_incidents: number;
}

