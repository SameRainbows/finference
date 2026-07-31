import { Dashboard } from "@/components/dashboard";
import { WorkspaceControls } from "@/components/workspace-controls";
import type { SessionUser } from "@/db/services";
import { getPersistentDashboard } from "@/db/services";

type PersistentData = Awaited<ReturnType<typeof getPersistentDashboard>>;

export function PersistentDashboard({
  user,
  data,
}: {
  user: SessionUser;
  data: PersistentData;
}) {
  return (
    <>
      <Dashboard
        mode="persistent"
        workspaceName={data.workspace.name}
        userName={user.name || user.email}
        initialPolicyApplied={data.policyApplied}
        policyId={data.policy?.id}
        initialMetrics={{
          revenue: data.snapshot.revenue,
          cost: data.snapshot.cost,
          requests: data.snapshot.requests,
          errorRate: data.snapshot.errorRate,
          p95LatencyMs: data.snapshot.p95LatencyMs,
        }}
        initialAudit={data.audit.map((event) => ({
          time: event.createdAt.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          actor:
            event.actorId === user.id
              ? user.name || user.email
              : event.actorId,
          action: event.action,
          target:
            typeof event.evidence.target === "string"
              ? event.evidence.target
              : `${event.targetType} · ${event.targetId.slice(0, 10)}`,
          status: event.status.replaceAll("_", " "),
        }))}
        initialMeter={
          data.meterFlushes[0]
            ? {
                eventCount: data.meterFlushes[0].eventCount,
                billableUnits: data.meterFlushes[0].billableUnits,
                status: data.meterFlushes[0].status,
              }
            : null
        }
        integrations={data.integrations}
      />
      <WorkspaceControls
        email={user.email}
        allowReset={user.email === process.env.DEMO_USER_EMAIL}
      />
    </>
  );
}
