export type PolicyState =
  | "draft"
  | "proposed"
  | "approved"
  | "active"
  | "rolled_back"
  | "rejected";

const transitions: Record<PolicyState, PolicyState[]> = {
  draft: ["proposed", "rejected"],
  proposed: ["approved", "active", "rejected"],
  approved: ["active", "rejected"],
  active: ["rolled_back"],
  rolled_back: [],
  rejected: [],
};

export function canTransitionPolicy(from: PolicyState, to: PolicyState) {
  return transitions[from].includes(to);
}

export function canApprovePolicyRole(role: string) {
  return role === "owner" || role === "admin";
}
