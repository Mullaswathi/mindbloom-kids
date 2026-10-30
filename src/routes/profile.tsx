
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Plus, Trash2, UserRound, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

const title = "Family Profile — MindBloom ADHD Kids";
const description =
  "Manage your parent details and the child profiles linked to your account.";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ProfilePage,
});

const familyProfileSchema = z.object({
  parent: z.object({
    name: z.string().trim().min(2, "Enter the parent's name").max(100),
    phone: z.string().trim().max(30, "Phone number must be 30 characters or fewer"),
  }),
  children: z
    .array(
      z.object({
        name: z.string().trim().min(2, "Enter each child's name").max(100),
        age: z
          .string()
          .regex(/^\d{1,2}$/, "Enter an age from 1 to 18")
          .transform(Number)
          .pipe(
            z.number().int().min(1, "Age must be at least 1").max(18, "Age must be 18 or younger"),
          ),
      }),
    )
    .min(1, "Add at least one child profile")
    .max(10, "You can add up to 10 child profiles"),
});

type ChildForm = {
  key: string;
  name: string;
  age: string;
};

let nextChildKey = 0;

function createChildForm(name = "", age = ""): ChildForm {
  const key =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `child-${nextChildKey++}`;

  return { key, name, age };
}

function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [children, setChildren] = useState<ChildForm[]>(() => [
    createChildForm(),
  ]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    const saved = z
      .object({
        parent: z.object({
          name: z.string(),
          phone: z.string(),
        }),
        children: z.array(
          z.object({
            name: z.string(),
            age: z.number(),
          }),
        ),
      })
      .safeParse(user.user_metadata["family_profile"]);

    if (saved.success) {
      setParentName(saved.data.parent.name);
      setPhone(saved.data.parent.phone);
      setChildren(
        saved.data.children.map((child) =>
          createChildForm(child.name, String(child.age)),
        ),
      );
      return;
    }

    const userName =
      user.user_metadata["full_name"] ?? user.user_metadata["name"] ?? "";

    setParentName(typeof userName === "string" ? userName : "");
    setPhone("");
    setChildren([createChildForm()]);
  }, [user]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = familyProfileSchema.safeParse({
      parent: { name: parentName, phone },
      children: children.map(({ name, age }) => ({ name, age })),
    });

    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? "Please check the profile details",
      );
      return;
    }

    if (!user) {
      toast.error("Sign in to save your family profile.");
      return;
    }

    setBusy(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          family_profile: {
            parent: parsed.data.parent,
            children: parsed.data.children,
          },
        },
      });

      if (error) throw error;

      toast.success("Family profile saved.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save your profile.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user) {
    return (
      <div
        className="mx-auto max-w-3xl px-5 py-16 text-center text-muted-foreground"
        role="status"
      >
        Loading your profile…
      </div>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Your Family"
        title="Parent & child profiles"
        description="Keep your family details together so we can personalize your MindBloom experience."
      />

      <section className="mx-auto max-w-3xl px-5 py-12">
        <form onSubmit={saveProfile} className="grid gap-6">
          <section
            className="card-soft grid gap-5 p-6 sm:p-8"
            aria-labelledby="parent-profile-heading"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-sky-soft text-sky">
                <UserRound className="size-5" />
              </span>

              <div>
                <h2 id="parent-profile-heading" className="text-xl font-bold">
                  Parent profile
                </h2>
                <p className="text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="parent-name">
                Parent or guardian name
              </Label>
              <Input
                id="parent-name"
                autoComplete="name"
                maxLength={100}
                value={parentName}
                onChange={(event) => setParentName(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="parent-phone">
                Phone number{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id="parent-phone"
                type="tel"
                autoComplete="tel"
                maxLength={30}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
          </section>

          <section
            className="card-soft grid gap-5 p-6 sm:p-8"
            aria-labelledby="children-heading"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-grass-soft text-grass">
                  <UsersRound className="size-5" />
                </span>

                <div>
                  <h2 id="children-heading" className="text-xl font-bold">
                    Child profiles
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Add one profile for each child.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                className="shrink-0 rounded-full font-bold"
                disabled={children.length >= 10}
                onClick={() =>
                  setChildren((current) => [
                    ...current,
                    createChildForm(),
                  ])
                }
              >
                <Plus className="size-4" /> Add child
              </Button>
            </div>

            {children.map((child, index) => (
              <div
                key={child.key}
                className="grid gap-4 rounded-2xl border border-border p-4 sm:grid-cols-[1fr_8rem_auto] sm:items-end"
              >
                <div className="grid gap-2">
                  <Label htmlFor={`child-name-${child.key}`}>
                    Child's name
                  </Label>
                  <Input
                    id={`child-name-${child.key}`}
                    autoComplete="off"
                    maxLength={100}
                    value={child.name}
                    onChange={(event) =>
                      setChildren((current) =>
                        current.map((item) =>
                          item.key === child.key
                            ? { ...item, name: event.target.value }
                            : item,
                        ),
                      )
                    }
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`child-age-${child.key}`}>
                    Age
                  </Label>
                  <Input
                    id={`child-age-${child.key}`}
                    type="number"
                    min={1}
                    max={18}
                    inputMode="numeric"
                    value={child.age}
                    onChange={(event) =>
                      setChildren((current) =>
                        current.map((item) =>
                          item.key === child.key
                            ? { ...item, age: event.target.value }
                            : item,
                        ),
                      )
                    }
                    required
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove child ${index + 1}`}
                  disabled={children.length === 1}
                  onClick={() =>
                    setChildren((current) =>
                      current.filter((item) => item.key !== child.key),
                    )
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </section>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={busy}
              className="rounded-full px-8 font-bold"
            >
              {busy ? "Saving…" : "Save family profile"}
            </Button>
          </div>
        </form>
      </section>
    </>
  );
}
