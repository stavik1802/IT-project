// src/api.ts

import type {
  SearchParams,
  EvaluationResponse,
  RentOnlyResponse,
  SearchLog,
} from "./types";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function estimateRent(
  params: SearchParams
): Promise<RentOnlyResponse> {
  const res = await fetch(`${API_BASE}/api/estimate-rent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Rent API error (${res.status}): ${text || res.statusText}`
    );
  }

  return res.json();
}

// This is still available if you want the 1-shot debug mode.
export async function evaluateInvestment(
  params: SearchParams
): Promise<EvaluationResponse> {
  const res = await fetch(`${API_BASE}/api/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Evaluate API error (${res.status}): ${text || res.statusText}`
    );
  }

  return res.json();
}

// 🔹 2-step flow: reuse same averageRent from the first call
export async function evaluateInvestmentWithRent(
  params: SearchParams,
  averageRent: number
): Promise<EvaluationResponse> {
  const res = await fetch(`${API_BASE}/api/evaluate-with-rent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ params, averageRent }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Evaluate-with-rent API error (${res.status}): ${
        text || res.statusText
      }`
    );
  }

  return res.json();
}

// 🔹 History for first page
export async function getHistory(limit = 5): Promise<SearchLog[]> {
  const res = await fetch(
    `${API_BASE}/api/history?limit=${encodeURIComponent(limit)}`,
    { method: "GET" }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `History API error (${res.status}): ${text || res.statusText}`
    );
  }

  return res.json();
}
