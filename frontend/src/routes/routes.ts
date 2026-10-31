/**
 * CivicPulse Navigation & Route Constants
 */

export const APP_ROUTES = {
  CITIZEN: {
    REPORT: 'REPORT',
    TRACK: 'TRACK',
    CONFIRM: 'CONFIRM'
  },
  OFFICER: {
    MAP: 'MAP',
    SLA_BOARD: 'SLA_BOARD',
    REVIEW_QUEUE: 'REVIEW_QUEUE'
  },
  DEMO: 'DEMO'
} as const;

export type UserRole = 'CITIZEN' | 'OFFICER' | 'DEMO';

