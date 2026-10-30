import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const recipients = ["hellomindbloomadhd@gmail.com"];
const resendEndpoint = "https://api.resend.com/emails";

type FeedbackSendResult =
  | { success: true }
  | {
      success: false;
      reason:
        | "not_configured"
        | "api_key_rejected"
        | "sender_rejected"
        | "provider_error"
        | "network_error";
    };

export const sendFeedback = createServerFn({ method: "POST" })
  .validator(
    z.object({
      feedback: z.string().trim().min(1).max(2000),
      rating: z.number().int().min(0).max(5),
    }),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env["RESEND_API_KEY"];
    const from = process.env["RESEND_FROM_EMAIL"];

    if (!apiKey || !from) {
      console.error("Feedback email configuration is missing", {
        missing: [...(!apiKey ? ["RESEND_API_KEY"] : []), ...(!from ? ["RESEND_FROM_EMAIL"] : [])],
      });
      return { success: false, reason: "not_configured" } satisfies FeedbackSendResult;
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
          to: recipients,
          subject: "MindBloom ADHD Kids feedback",
          text: `${data.rating ? `Rating: ${data.rating}/5\n\n` : ""}Feedback:\n${data.feedback}`,
        }),
      });

      if (!response.ok) {
        let providerError: { name?: unknown; message?: unknown } = {};
        try {
          const payload: unknown = await response.json();
          if (payload && typeof payload === "object") {
            const record = payload as Record<string, unknown>;
            providerError = { name: record["name"], message: record["message"] };
          }
        } catch {
          console.error("Resend returned a non-JSON feedback error", { status: response.status });
        }

        console.error("Resend rejected feedback email", {
          status: response.status,
          errorName:
            typeof providerError.name === "string" ? providerError.name.slice(0, 100) : undefined,
          errorMessage:
            typeof providerError.message === "string"
              ? providerError.message.slice(0, 300)
              : undefined,
        });

        const reason =
          response.status === 401
            ? "api_key_rejected"
            : response.status === 403 || response.status === 422
              ? "sender_rejected"
              : "provider_error";

        return { success: false, reason } satisfies FeedbackSendResult;
      }

      return { success: true } satisfies FeedbackSendResult;
    } catch (error) {
      console.error("Feedback email request failed", {
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
      return { success: false, reason: "network_error" } satisfies FeedbackSendResult;
    }
  });
