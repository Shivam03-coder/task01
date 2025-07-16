"use client";
import React, { useState } from "react";
import { api } from "@/trpc/react";
import { extractEmailsFromJson } from "@/actions/email-extract";
import { saveMails } from "@/actions/save-mails";
import { Loader2 } from "lucide-react";
import { generateSalesEmailToAutomobileCompany } from "@/actions/get-email-body";

export default function Page() {
  const {
    data: companies = [],
    refetch,
    isLoading,
  } = api.company.all.useQuery();

  const [loadingCompanies, setLoadingCompanies] = useState<
    Record<string, boolean>
  >({});

  const [sendingCompanies, setSendingCompanies] = useState<
    Record<string, boolean>
  >({});

  const handleFetchEmail = async (companyId: string) => {
    try {
      setLoadingCompanies((prev) => ({ ...prev, [companyId]: true }));

      const company = companies.find((c) => c.id === companyId);
      if (!company?.website) return;

      const result = await fetch("/api/firecrawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: company.website }),
      });

      const data = await result.json();

      const extracted = await extractEmailsFromJson(
        JSON.stringify(data.result.data),
      );
      console.log("🚀 ~ handleFetchEmail ~ extracted:", extracted);

      // Handle the case where extractEmailsFromJson might return a string (error) or the expected object
      if (
        typeof extracted === "string" ||
        typeof extracted?.emails === "undefined" ||
        typeof extracted?.info === "undefined"
      ) {
        throw new Error("Invalid response from LLM");
      }

      await saveMails(companyId, extracted.emails, extracted.info);
      refetch();
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setLoadingCompanies((prev) => ({ ...prev, [companyId]: false }));
    }
  };

  const handleSendEmail = async (companyId: string) => {
    try {
      setSendingCompanies((prev) => ({ ...prev, [companyId]: true }));

      const company = companies.find((c) => c.id === companyId);
      if (!company || !company.email?.length || !company.info) return;

      const results: { recipient: string; body: string }[] = [];

      for (const recipientEmail of company.email) {
        const emailBody = await generateSalesEmailToAutomobileCompany(
          recipientEmail,
          company.info,
        );

        results.push({
          recipient: recipientEmail,
          body: emailBody,
        });
      }

      const res = await fetch("/api/send-mail", {
        method: "POST",
        body: JSON.stringify(results),
      });

      alert("Emails sent successfully!");
    } catch (error) {
      console.error("Error sending emails:", error);
      alert("Failed to send emails.");
    } finally {
      setSendingCompanies((prev) => ({ ...prev, [companyId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-10 text-center text-4xl font-extrabold text-blue-700">
          Company Email Fetcher
        </h1>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 font-medium text-blue-600">
              Loading companies...
            </span>
          </div>
        ) : companies.length === 0 ? (
          <p className="text-center text-lg text-gray-600">
            No companies found.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {companies.map((company) => (
              <div
                key={company.id}
                className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {company.name}
                  </h2>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm break-all text-blue-600 hover:underline"
                  >
                    {company.website}
                  </a>

                  {company.email && company.email.length > 0 && (
                    <div className="mt-4">
                      <h3 className="mb-1 text-sm font-semibold text-gray-700">
                        Emails:
                      </h3>
                      <ul className="list-inside list-disc space-y-1 text-sm text-gray-800">
                        {company.email.map((email, idx) => (
                          <li key={idx}>{email}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => handleFetchEmail(company.id)}
                    disabled={loadingCompanies[company.id]}
                    className={`flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition ${
                      loadingCompanies[company.id]
                        ? "cursor-not-allowed bg-blue-300"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {loadingCompanies[company.id] ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Saving...
                      </>
                    ) : (
                      "Fetch Emails"
                    )}
                  </button>
                  <button
                    onClick={() => handleSendEmail(company.id)}
                    disabled={
                      company.email.length === 0 || sendingCompanies[company.id]
                    }
                    className={`flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition ${
                      company.email.length === 0 || sendingCompanies[company.id]
                        ? "cursor-not-allowed bg-gray-300 text-gray-600"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {sendingCompanies[company.id] ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Sending...
                      </>
                    ) : (
                      "Send Email"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
