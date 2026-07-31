import { describe, expect, it } from "vitest";
import {
  canApprovePolicyRole,
  canTransitionPolicy,
} from "./policy-state";

describe("policy state machine", () => {
  it("allows governed activation and rollback transitions", () => {
    expect(canTransitionPolicy("proposed", "active")).toBe(true);
    expect(canTransitionPolicy("active", "rolled_back")).toBe(true);
  });

  it("prevents repeat approval and resurrection of terminal policies", () => {
    expect(canTransitionPolicy("active", "active")).toBe(false);
    expect(canTransitionPolicy("rejected", "active")).toBe(false);
    expect(canTransitionPolicy("rolled_back", "active")).toBe(false);
  });

  it("limits approval to workspace administrators", () => {
    expect(canApprovePolicyRole("owner")).toBe(true);
    expect(canApprovePolicyRole("admin")).toBe(true);
    expect(canApprovePolicyRole("analyst")).toBe(false);
    expect(canApprovePolicyRole("viewer")).toBe(false);
  });
});
