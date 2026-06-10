export {
  renderDemandAvailableEmail,
  renderMissionConfirmedEmail,
  renderMissionTakenEmail,
  renderNewRequestEmail,
  renderReminder30MinEmail,
  buildProLinkUrl,
  type DemandAvailableEmailData,
  type MissionConfirmedEmailData,
  type MissionTakenEmailData,
  type NewRequestEmailData,
  type Reminder30MinEmailData,
} from "./pro-workflow";

export const EMAIL_TEMPLATES = {
  newRequest: "new-request",
  missionConfirmed: "mission-confirmed",
  reminder30Min: "reminder-30min",
  missionTaken: "mission-taken",
  demandAvailable: "demand-available",
} as const;

export type EmailTemplateId =
  (typeof EMAIL_TEMPLATES)[keyof typeof EMAIL_TEMPLATES];
