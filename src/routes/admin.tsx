import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

const title = "Admin Dashboard — MindBloom ADHD Kids";
const description = "Manage the activity catalog and view consultation requests.";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AdminPage,
});

type ActivityRow = {
  id: string;
  title: string;
  description: string;
  icon_key: string;
  category: string;
  is_active: boolean;
};

type BookingRow = {
  id: string;
  created_at: string;
  service_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  status: string;
};

type ContactRequestRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  child_age: string | null;
  message: string;
};

const BOOKING_STATUSES = ["requested", "confirmed", "completed", "cancelled"] as const;

function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [requests, setRequests] = useState<ContactRequestRow[]>([]);
  const [ready, setReady] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const loadAll = useCallback(async () => {
    const [acts, bks, reqs] = await Promise.all([
      supabase
        .from("activity_content")
        .select("id, title, description, icon_key, category, is_active")
        .order("sort_order"),
      supabase
        .from("bookings")
        .select("id, created_at, service_name, contact_name, contact_email, contact_phone, status")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("contact_requests")
        .select("id, created_at, name, email, phone, child_age, message")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    setActivities((acts.data ?? []) as ActivityRow[]);
    setBookings((bks.data ?? []) as BookingRow[]);
    setRequests((reqs.data ?? []) as ContactRequestRow[]);
    setReady(true);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    if (!isAdmin) {
      navigate({ to: "/parent", replace: true });
      return;
    }
    void loadAll();
  }, [loading, user, isAdmin, navigate, loadAll]);

  if (loading || !user || !isAdmin) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-24 text-center text-muted-foreground">
        Checking your access…
      </section>
    );
  }

  async function saveActivity(row: ActivityRow, patch: Partial<ActivityRow>) {
    const { error } = await supabase.from("activity_content").update(patch).eq("id", row.id);
    if (error) {
      toast.error("Could not save the change. Please try again.");
      return;
    }
    setActivities((rows) => rows.map((r) => (r.id === row.id ? { ...r, ...patch } : r)));
    toast.success("Activity updated.");
  }

  async function deleteActivity(row: ActivityRow) {
    const { error } = await supabase.from("activity_content").delete().eq("id", row.id);
    if (error) {
      toast.error("Could not remove the activity. Please try again.");
      return;
    }
    setActivities((rows) => rows.filter((r) => r.id !== row.id));
    toast.success("Activity removed.");
  }

  async function createActivity() {
    if (!newTitle.trim() || !newDescription.trim()) {
      toast.error("Add a title and a short description first.");
      return;
    }
    const { data, error } = await supabase
      .from("activity_content")
      .insert({
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: "activity",
        icon_key: "sparkles",
        sort_order: (activities.length + 1) * 10,
      })
      .select("id, title, description, icon_key, category, is_active")
      .single();
    if (error || !data) {
      toast.error("Could not add the activity. Please try again.");
      return;
    }
    setActivities((rows) => [...rows, data as ActivityRow]);
    setNewTitle("");
    setNewDescription("");
    toast.success("Activity added.");
  }

  async function setBookingStatus(row: BookingRow, status: string) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", row.id);
    if (error) {
      toast.error("Could not update the booking. Please try again.");
      return;
    }
    setBookings((rows) => rows.map((r) => (r.id === row.id ? { ...r, status } : r)));
    toast.success("Booking status updated.");
  }

  return (
    <>
      <PageHero
        eyebrow="Admin"
        title="Admin Dashboard"
        description="Manage the activity catalog and review consultation requests. Only the fields needed to run the day are shown."
      />
      <section className="mx-auto max-w-6xl px-5 py-16">
        <article className="card-soft p-8">
          <h2 className="flex items-center gap-2 text-2xl font-extrabold">
            <ShieldCheck className="size-6 text-grass" /> Activity catalog
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit what families see on the Activities page. Hidden activities stay saved but disappear
            from the page.
          </p>

          <div className="mt-6 grid gap-3">
            {activities.map((row) => (
              <ActivityEditor key={row.id} row={row} onSave={saveActivity} onDelete={deleteActivity} />
            ))}
            {ready && activities.length === 0 && (
              <p className="text-sm text-muted-foreground">No activities yet — add the first one below.</p>
            )}
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl border border-border p-4 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end">
            <div className="grid gap-1.5">
              <Label htmlFor="new-activity-title">New activity title</Label>
              <Input
                id="new-activity-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                maxLength={80}
                placeholder="e.g. Pattern Detective"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="new-activity-description">Short description</Label>
              <Input
                id="new-activity-description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                maxLength={160}
                placeholder="What families will see on the card"
              />
            </div>
            <Button className="rounded-full font-bold" onClick={() => void createActivity()}>
              <Plus className="size-4" /> Add activity
            </Button>
          </div>
        </article>

        <article className="card-soft mt-8 p-8">
          <h2 className="text-2xl font-extrabold">Consultation bookings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Booking details and current status. Update status as you confirm or complete sessions.
          </p>
          <div className="mt-6 grid gap-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="grid gap-2 rounded-2xl border border-border p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"
              >
                <div className="text-xs font-semibold text-muted-foreground">
                  {new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold">{b.service_name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {b.contact_name} · {b.contact_email}
                    {b.contact_phone ? ` · ${b.contact_phone}` : ""}
                  </p>
                </div>
                <select
                  aria-label={`Status for ${b.service_name} booking`}
                  value={b.status}
                  onChange={(e) => void setBookingStatus(b, e.target.value)}
                  className="rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold"
                >
                  {BOOKING_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {ready && bookings.length === 0 && (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            )}
          </div>
        </article>

        <article className="card-soft mt-8 p-8">
          <h2 className="text-2xl font-extrabold">Contact form requests</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Messages sent through the contact form, including parent phone numbers for follow-up.
          </p>
          <div className="mt-6 grid gap-3">
            {requests.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border p-4">
                <p className="font-bold">
                  {r.name}
                  {r.child_age ? ` · child age ${r.child_age}` : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  {r.email} · {r.phone} ·{" "}
                  {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
                <p className="mt-2 text-sm">{r.message}</p>
              </div>
            ))}
            {ready && requests.length === 0 && (
              <p className="text-sm text-muted-foreground">No contact requests yet.</p>
            )}
          </div>
        </article>
      </section>
    </>
  );
}

function ActivityEditor({
  row,
  onSave,
  onDelete,
}: {
  row: ActivityRow;
  onSave: (row: ActivityRow, patch: Partial<ActivityRow>) => Promise<void>;
  onDelete: (row: ActivityRow) => Promise<void>;
}) {
  const [title, setTitle] = useState(row.title);
  const [description, setDescription] = useState(row.description);

  return (
    <div className="grid gap-2 rounded-2xl border border-border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor={`title-${row.id}`}>Title</Label>
          <Input
            id={`title-${row.id}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`description-${row.id}`}>Description</Label>
          <Input
            id={`description-${row.id}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={160}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          className="rounded-full font-bold"
          onClick={() => void onSave(row, { title, description })}
          disabled={title.trim() === row.title && description.trim() === row.description}
        >
          Save
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="rounded-full font-bold"
          onClick={() => void onSave(row, { is_active: !row.is_active })}
        >
          {row.is_active ? "Hide from page" : "Show on page"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full font-bold text-destructive"
          onClick={() => void onDelete(row)}
        >
          <Trash2 className="size-4" /> Delete
        </Button>
        {!row.is_active && <span className="text-xs font-bold text-muted-foreground">Hidden</span>}
      </div>
    </div>
  );
}
