import { ROUTES } from './routes';
import { L } from './labels';

export const NAV_ITEMS_USER = [
  { icon: 'dashboard', label: L.DASHBOARD, route: ROUTES.USER_DASHBOARD },
  { icon: 'public', label: L.VISA_MARKETPLACE, route: ROUTES.VISA_MARKETPLACE },
  { icon: 'description', label: L.MY_APPLICATIONS, route: ROUTES.MY_APPLICATIONS },
  { icon: 'verified_user', label: L.ELIGIBILITY, route: ROUTES.ELIGIBILITY_CHECKER },
  { icon: 'forum', label: L.CHATBOT, route: ROUTES.CHATBOT },
  { icon: 'description', label: L.DOCUMENTS, route: ROUTES.DOCUMENT_VAULT },
  { icon: 'calendar_month', label: L.SCHEDULER, route: ROUTES.APPOINTMENT_SCHEDULER },
  { icon: 'analytics', label: L.TRACKER, route: ROUTES.PROGRESS_TRACKER },
  { icon: 'satellite_alt', label: L.TRACKING_SIM, route: ROUTES.TRACKING_SIM },
  { icon: 'support', label: L.SUPPORT, route: ROUTES.SUPPORT_TICKETS },
];

export const NAV_ITEMS_ADMIN = [
  { icon: 'dashboard', label: L.ADMIN, route: ROUTES.ADMIN_DASHBOARD },
  { icon: 'verified', label: L.ADMIN_DOC_REVIEW || 'Document Review', route: ROUTES.ADMIN_DOC_REVIEW },
  { icon: 'menu_book', label: 'Visa Knowledge', route: ROUTES.KNOWLEDGE_MGMT },
  { icon: 'account_balance', label: 'Embassy Manager', route: ROUTES.SCRAPER_MONITOR },
  { icon: 'smart_toy', label: L.CHATBOT, route: ROUTES.CHATBOT },
  { icon: 'group', label: 'User Management', route: ROUTES.USER_DASHBOARD },
  { icon: 'rule', label: 'Approval Workflow', route: ROUTES.APPROVAL_WORKFLOW },
  { icon: 'history', label: 'Logs & Activity', route: ROUTES.ACTIVITY_LOGS },
];
