// src/hooks/useSavedEvents.ts
import type { EventItem } from "@/api/events";
import {
    fetchEngagementByIdApi,
    removeEngagementApi,
    saveEngagementApi,
    type Engagement,
} from "@/api/eventsave";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

const QK = ["engagements"] as const;

function getEventId(ev?: Partial<EventItem> | null) {
  // Support either _id (Mongo) or id
  return (ev as any)?._id ?? (ev as any)?.id ?? "";
}

/** Load all saved engagements for the signed-in user */
export function useSavedEvents() {
  const q = useQuery<Engagement[]>({
    queryKey: QK,
    queryFn: fetchEngagementByIdApi,
  });

  const derived = useMemo(() => {
    const engagements = q.data ?? [];
    const events = engagements.map((e) => e.event).filter(Boolean) as EventItem[];
    const idSet = new Set(events.map((e) => getEventId(e)));
    // Map eventId -> engagementId (useful for quick unsave)
    const byEventId = new Map<string, string>(
      engagements
        .filter((e) => getEventId(e.event))
        .map((e) => [getEventId(e.event), e._id])
    );
    return { engagements, events, idSet, byEventId };
  }, [q.data]);

  return { ...q, ...derived };
}

/** Quick check if a single event is saved */
export function useIsEventSaved(eventId?: string) {
  const { idSet, byEventId } = useSavedEvents();
  const saved = !!(eventId && idSet.has(eventId));
  const engagementId = eventId ? byEventId.get(eventId) : undefined;
  return { saved, engagementId };
}

type ToggleVars = {
  eventId: string;
  /** Optional: pass the full event to enable optimistic "add" */
  event?: EventItem;
};

/**
 * Toggle save/unsave for an event.
 * - If engagement exists -> DELETE /engagement/:id (optimistic remove)
 * - Else -> POST /engagement { eventId } (invalidates list; optionally optimistic add if event provided)
 */
export function useToggleSavedEvent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId }: ToggleVars) => {
      const current = qc.getQueryData<Engagement[]>(QK) ?? [];
      const existing = current.find((e) => getEventId(e.event) === eventId);

      if (existing) {
        await removeEngagementApi(existing._id);
        return { action: "removed" as const, eventId, engagementId: existing._id };
      } else {
        const created = await saveEngagementApi(eventId);
        return { action: "added" as const, eventId, engagement: created as Engagement };
      }
    },

    // Optimistic update: remove immediately; add only if caller supplied full event
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: QK });
      const prev = qc.getQueryData<Engagement[]>(QK) ?? [];
      const existing = prev.find((e) => getEventId(e.event) === vars.eventId);

      if (existing) {
        // Optimistic remove
        const next = prev.filter((e) => e._id !== existing._id);
        qc.setQueryData(QK, next);
      } else if (vars.event) {
        // Optimistic add (only if we have full event data to show immediately)
        const optimistic: Engagement = {
          _id: `optimistic-${vars.eventId}`,
          user: "me",
          event: vars.event,
          attended: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        qc.setQueryData(QK, [...prev, optimistic]);
      }

      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(QK, ctx.prev);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK });
    },
  });
}
