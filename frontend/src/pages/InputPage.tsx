// src/pages/InputPage.tsx
import type { FormEvent, ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SearchParams, SearchLog } from "../types";
import { estimateRent, getHistory } from "../api";

const defaultValues: SearchParams = {
  minPrice: 200000,
  maxPrice: 500000,
  area: "",
  bedrooms: 2,
  minSqft: 600,
  maxSqft: 1500,
};

function InputPage() {
  const [form, setForm] = useState<SearchParams>(defaultValues);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [history, setHistory] = useState<SearchLog[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const navigate = useNavigate();

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "area" ? value : Number(value),
    }));
  }
  

  function validateForm(): string | null {
    if (!form.area.trim()) return "Area is required.";
    if (form.minPrice <= 0 || form.maxPrice <= 0)
      return "Price must be positive.";
    if (form.minPrice > form.maxPrice)
      return "Min price cannot be greater than max price.";
    if (form.minSqft <= 0 || form.maxSqft <= 0)
      return "Sqft must be positive.";
    if (form.minSqft > form.maxSqft)
      return "Min sqft cannot be greater than max sqft.";
    if (form.bedrooms <= 0) return "Bedrooms must be at least 1.";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);

      // 🔹 First step: only get the averageRent
      const rentResult = await estimateRent(form);

      // Pass parameters + initialAverageRent to results page
      navigate("/results", {
        state: {
          searchParams: form,
          initialAverageRent: rentResult.averageRent,
        },
      });
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "Something went wrong while contacting backend."
      );
    } finally {
      setIsLoading(false);
    }
  }

  // 🔹 Load recent history on first page
  useEffect(() => {
    async function loadHistory() {
      try {
        setHistoryLoading(true);
        setHistoryError(null);
        const items = await getHistory(5);
        setHistory(items);
      } catch (err: any) {
        console.error("Failed to load history", err);
        setHistoryError(
          err?.message || "Failed to load recent evaluations."
        );
      } finally {
        setHistoryLoading(false);
      }
    }

    loadHistory();
  }, []);

  // Optional: click a history item to refill form quickly
  function applyFromHistory(h: SearchLog) {
    setForm(h.params);
  }

  return (
    <div className="card">
      <header className="card-header">
        <h1 className="card-title">Real Estate Investment Tool</h1>
        <p className="card-subtitle">
          Enter your criteria to estimate rental potential using the LLM agent.
        </p>
      </header>

      <div className="chip-row">
        <span className="chip">Step 1 · Input Criteria</span>
        <span className="chip">Step 2 · View Rent & Yields</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Area */}
        <div>
          <label className="label" htmlFor="area">
            Area (city / neighborhood / ZIP)
          </label>
          <input
            id="area"
            name="area"
            type="text"
            value={form.area}
            onChange={handleChange}
            className="input"
            placeholder="e.g. Brooklyn, NY"
          />
        </div>

        {/* Price range */}
        <div className="form-grid-2">
          <div>
            <label className="label" htmlFor="minPrice">
              Min Price
            </label>
            <input
              id="minPrice"
              name="minPrice"
              type="number"
              value={form.minPrice}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="maxPrice">
              Max Price
            </label>
            <input
              id="maxPrice"
              name="maxPrice"
              type="number"
              value={form.maxPrice}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="label" htmlFor="bedrooms">
            Bedrooms
          </label>
          <input
            id="bedrooms"
            name="bedrooms"
            type="number"
            min={1}
            value={form.bedrooms}
            onChange={handleChange}
            className="input"
          />
        </div>

        {/* Sqft range */}
        <div className="form-grid-2">
          <div>
            <label className="label" htmlFor="minSqft">
              Min Sqft
            </label>
            <input
              id="minSqft"
              name="minSqft"
              type="number"
              value={form.minSqft}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="maxSqft">
              Max Sqft
            </label>
            <input
              id="maxSqft"
              name="maxSqft"
              type="number"
              value={form.maxSqft}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? "Contacting rent agent..." : "Get Rent Estimate"}
        </button>
      </form>

      {/* 🔹 Recent evaluations section */}
      <div style={{ marginTop: 32 }}>
        <h2 className="card-title" style={{ fontSize: 18 }}>
          Recent evaluations
        </h2>

        {historyLoading && <p>Loading recent evaluations…</p>}
        {historyError && <div className="error-box">{historyError}</div>}

        {!historyLoading && !historyError && history.length === 0 && (
          <p className="card-subtitle">No previous searches yet.</p>
        )}

        {history.length > 0 && (
          <div className="results-tags" style={{ marginTop: 8 }}>
            {history.map((h) => (
              <div
                key={h.id}
                style={{
                  marginBottom: 10,
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.08)",
                  cursor: "pointer",
                }}
                onClick={() => applyFromHistory(h)}
                title="Click to reuse these criteria"
              >
                <div>
                  <strong>{h.params.area}</strong> ·{" "}
                  {h.params.bedrooms}br ·{" "}
                  {h.params.minPrice.toLocaleString()}–
                  {h.params.maxPrice.toLocaleString()} USD
                </div>
                <div>
                  Avg rent: ${h.averageRent.toLocaleString()} · Properties:{" "}
                  {h.propertiesCount}
                  {h.bestYield != null && (
                    <>
                      {" "}
                      · Best yield: {(h.bestYield * 100).toFixed(2)}%
                    </>
                  )}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {new Date(h.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InputPage;
