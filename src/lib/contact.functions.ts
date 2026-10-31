import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
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

const resendEndpoint = "https://api.resend.com/emails";
const mailRecipients = ["hellomindbloomadhd@gmail.com"];

function publishableClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    // Opaque sb_ keys aren't JWTs; send only apikey, not the default Authorization bearer.
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === "Bearer invalid") {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function sendContactEmail(data: z.infer<typeof contactSchema>) {
  const apiKey = process.env["RESEND_API_KEY"];
  const from = process.env["RESEND_FROM_EMAIL"];

  if (!apiKey || !from) {
    console.error("Contact email configuration is missing", {
      missing: [...(!apiKey ? ["RESEND_API_KEY"] : []), ...(!from ? ["RESEND_FROM_EMAIL"] : [])],
    });
    return false;
  }

  try {
    const response = await fetch(resendEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: mailRecipients,
        subject: `New MindBloom consultation request from ${data.name}`,
        text: [
          `Name: ${data.name}`,
          `Email: ${data.email}`,
          `Phone: ${data.phone}`,
          `Child age: ${data.childAge || "Not provided"}`,
          "",
          "Message:",
          data.message,
        ].join("\n"),
      }),
    });

    if (!response.ok) {
      let errorMessage = "unknown resend error";
      try {
        const payload = await response.json();
        errorMessage = (payload as { message?: string })?.message ?? errorMessage;
      } catch {
        // Ignore parse failures and fall back to the default response data.
      }

      console.error("Resend rejected contact email", {
        status: response.status,
        errorMessage,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Contact email request failed", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return false;
  }
}

export const submitContactRequest = createServerFn({ method: "POST" })
  .validator((data) => contactSchema.parse(data))
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

      const emailSent = await sendContactEmail(data);
      if (!emailSent) {
        return {
          ok: false as const,
          error: "We saved your request, but the email notification could not be sent. Please email hello@mindbloomadhd.com.",
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
