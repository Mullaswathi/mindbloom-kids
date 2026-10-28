import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-().]{7,20}$/, "Invalid phone number")
    .refine((v) => {
      const digits = (v.match(/\d/g) ?? []).length;
      return digits >= 8 && digits <= 15;
    }, "Invalid phone number"),
  childAge: z.string().trim().max(20).optional(),
  message: z.string().trim().min(1).max(1000),
});

function publishableClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const { createClient } = require("@supabase/supabase-js") as typeof import("@supabase/supabase-js");
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    // Opaque sb_ keys aren't JWTs; send only apikey, not the default Authorization bearer.
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const submitContactRequest = createServerFn({ method: "POST" })
  .inputValidator((data) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { error } = await publishableClient().from("contact_requests").insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        child_age: data.childAge ? data.childAge : null,
        message: data.message,
      });
      if (error) {
        return {
          ok: false as const,
          error: "We couldn't save your request just now. Please try again, or email hello@mindbloomadhd.com.",
        };
      }
      return { ok: true as const };
    } catch {
      return {
        ok: false as const,
        error: "We couldn't save your request just now. Please try again, or email hello@mindbloomadhd.com.",
      };
    }
  });
