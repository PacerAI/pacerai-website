import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEMO_SIGNUP_NONAME_SEQUENCE_ENV,
  DEMO_SIGNUP_NONAME_SEQUENCE_LABEL,
  DEMO_SIGNUP_SEQUENCE_ENV,
  DEMO_SIGNUP_SEQUENCE_LABEL,
  buildEnrollBody,
  chooseDemoSignupSequence,
} from "../src/signup-sequence.ts";

const NAMED = "seq_named";
const NONAME = "seq_noname";
const MAILBOX = "email_account_will";

describe("no first name", () => {
  it("enrolls in the no-name sequence", () => {
    const decision = chooseDemoSignupSequence({
      email: "ada@portco.com",
      leadClass: "valid_lead",
      firstName: "",
      namedSequenceId: NAMED,
      noNameSequenceId: NONAME,
    });
    assert.deepEqual(decision, {
      action: "enroll",
      sequenceId: NONAME,
      label: DEMO_SIGNUP_NONAME_SEQUENCE_LABEL,
      envKey: DEMO_SIGNUP_NONAME_SEQUENCE_ENV,
    });
    if (decision.action !== "enroll") return;
    assert.deepEqual(buildEnrollBody("c1", decision.sequenceId, MAILBOX), {
      contact_ids: ["c1"],
      emailer_campaign_id: NONAME,
      send_email_from_email_account_id: MAILBOX,
    });
  });

  it("keeps a named contact on the named sequence", () => {
    const decision = chooseDemoSignupSequence({
      email: "ada@portco.com",
      leadClass: "personal_email",
      firstName: "Ada",
      namedSequenceId: NAMED,
      noNameSequenceId: NONAME,
    });
    assert.equal(decision.action, "enroll");
    if (decision.action === "enroll") {
      assert.equal(decision.sequenceId, NAMED);
      assert.equal(decision.label, DEMO_SIGNUP_SEQUENCE_LABEL);
      assert.equal(decision.envKey, DEMO_SIGNUP_SEQUENCE_ENV);
    }
  });
});

describe("skips", () => {
  it("skips @getpacerai.com with or without a first name", () => {
    for (const firstName of ["Will", null]) {
      const decision = chooseDemoSignupSequence({
        email: "Will@getpacerai.com",
        leadClass: "valid_lead",
        firstName,
        namedSequenceId: NAMED,
        noNameSequenceId: NONAME,
      });
      assert.equal(decision.action, "skip");
      if (decision.action === "skip") assert.equal(decision.reason, "internal test address");
    }
  });

  it("logs and skips when the no-name env var is missing, and does not use the named sequence", () => {
    const decision = chooseDemoSignupSequence({
      email: "ada@portco.com",
      leadClass: "valid_lead",
      firstName: "  ",
      namedSequenceId: NAMED,
      noNameSequenceId: undefined,
    });
    assert.equal(decision.action, "skip");
    if (decision.action === "skip") {
      assert.match(decision.log ?? "", /APOLLO_SEQUENCE_ID_DEMO_SIGNUP_NONAME is not set/);
      assert.match(decision.log ?? "", /No fallback sequence/);
    }
  });

  it("logs and skips when the named env var is missing", () => {
    const decision = chooseDemoSignupSequence({
      email: "ada@portco.com",
      leadClass: "valid_lead",
      firstName: "Ada",
      namedSequenceId: "",
      noNameSequenceId: NONAME,
    });
    assert.equal(decision.action, "skip");
    if (decision.action === "skip") {
      assert.match(decision.log ?? "", /APOLLO_SEQUENCE_ID_DEMO_SIGNUP is not set/);
    }
  });
});
