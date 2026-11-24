/**
 * Which demo-signup sequence to enroll, if any.
 *
 * Same rule as pacerai-gtm infra/whitepaper-worker/src/enroll.ts
 * `chooseDemoSignupSequence`. A missing first name uses a separate sequence
 * whose email has no name merge field. An empty env var is logged and skipped.
 * It never falls back to the other sequence. @getpacerai.com is never enrolled.
 */

export const DEMO_SIGNUP_SEQUENCE_ENV = "APOLLO_SEQUENCE_ID_DEMO_SIGNUP";
export const DEMO_SIGNUP_NONAME_SEQUENCE_ENV = "APOLLO_SEQUENCE_ID_DEMO_SIGNUP_NONAME";
export const DEMO_SIGNUP_SEQUENCE_LABEL = "Signal_CONTACT_DemoSignup_Triage";
export const DEMO_SIGNUP_NONAME_SEQUENCE_LABEL = "Signal_CONTACT_DemoSignup_Triage_NoName";

const ENROLL_CLASSES = new Set(["valid_lead", "personal_email"]);

export type SequenceDecision =
  | { action: "enroll"; sequenceId: string; label: string; envKey: string }
  | { action: "skip"; reason: string; log?: string };

export function isInternalTestEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith("@getpacerai.com");
}

function filled(value: string | undefined): string {
  return (value ?? "").trim();
}

function unset(envKey: string): SequenceDecision {
  return {
    action: "skip",
    reason: "sequence env unset",
    log: `${envKey} is not set; skipping enrollment. No fallback sequence.`,
  };
}

export function chooseDemoSignupSequence(input: {
  email: string;
  leadClass: string;
  firstName?: string | null;
  namedSequenceId?: string;
  noNameSequenceId?: string;
}): SequenceDecision {
  if (isInternalTestEmail(input.email) || input.leadClass === "internal") {
    return { action: "skip", reason: "internal test address" };
  }
  if (!ENROLL_CLASSES.has(input.leadClass)) {
    return { action: "skip", reason: `list only (${input.leadClass})` };
  }
  const hasName = !!input.firstName && input.firstName.trim().length > 0;
  if (hasName) {
    const seqId = filled(input.namedSequenceId);
    if (!seqId) return unset(DEMO_SIGNUP_SEQUENCE_ENV);
    return {
      action: "enroll",
      sequenceId: seqId,
      label: DEMO_SIGNUP_SEQUENCE_LABEL,
      envKey: DEMO_SIGNUP_SEQUENCE_ENV,
    };
  }
  const seqId = filled(input.noNameSequenceId);
  if (!seqId) return unset(DEMO_SIGNUP_NONAME_SEQUENCE_ENV);
  return {
    action: "enroll",
    sequenceId: seqId,
    label: DEMO_SIGNUP_NONAME_SEQUENCE_LABEL,
    envKey: DEMO_SIGNUP_NONAME_SEQUENCE_ENV,
  };
}

export function buildEnrollBody(
  contactId: string,
  sequenceId: string,
  emailAccountId: string
): {
  contact_ids: string[];
  emailer_campaign_id: string;
  send_email_from_email_account_id: string;
} {
  return {
    contact_ids: [contactId],
    emailer_campaign_id: sequenceId,
    send_email_from_email_account_id: emailAccountId,
  };
}
