"use client";

import * as React from "react";

export type AdvisorLite = { id: string; name: string };

export default function AdvisorPicker({
  advisors,
  value,
  onChange,
  placeholder = "Search for an advisor",
  className = "",
}: {
  advisors: AdvisorLite[];
  value: string; // advisor id
  onChange: (id: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  // When the selected value changes externally, don't force text into the input.
  // We keep the input "clean" so it always just shows the placeholder.
  React.useEffect(() => {
    // intentionally no sync into query — we want the box to stay empty
  }, [value]);

  // normalize "Last, First" -> "First Last"
  const toFirstLast = (name: string) => {
    if (!name) return "";
    const trimmed = name.trim();
    if (trimmed.includes(",")) {
      const [last, first, ...rest] = trimmed.split(",").map((s) => s.trim());
      return [first, last, ...rest].filter(Boolean).join(" ");
    }
    return trimmed;
  };

  // filter against both original and normalized shapes
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return advisors;

    return advisors.filter((a) => {
      const raw = a.name.toLowerCase();
      const norm = toFirstLast(a.name).toLowerCase();
      return raw.includes(q) || norm.includes(q);
    });
  }, [advisors, query]);

  // make the menu reliably open on focus/click
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // close on outside click
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // keyboard navigation
  const [activeIndex, setActiveIndex] = React.useState(0);
  React.useEffect(() => {
    setActiveIndex(0);
  }, [open, query]);

  function selectAdvisor(a: AdvisorLite) {
    onChange(a.id);
    setOpen(false);
    setQuery(""); // keep input clean; placeholder remains
    // Optionally re-focus input so user can immediately search again:
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className="flex items-center gap-2 rounded-2xl border border-blue-300 bg-white px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500"
        onClick={() => {
          // if user clicks the container, ensure input gets focus (and menu opens)
          inputRef.current?.focus();
          setOpen(true);
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="text-slate-400"
        >
          <path
            d="M21 21l-4.2-4.2M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}          // <— open every focus
          onClick={() => setOpen(true)}          // <— open on click even if already selected
          placeholder={placeholder}
          className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <ul
            role="listbox"
            className="max-h-72 overflow-auto py-1"
            onMouseLeave={() => setActiveIndex(-1)}
          >
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-slate-500">No results</li>
            )}

            {filtered.map((a, i) => {
              const full = toFirstLast(a.name);
              const selected = a.id === value;
              const active = i === activeIndex;
              return (
                <li
                  key={a.id}
                  role="option"
                  aria-selected={selected}
                  onMouseDown={(e) => e.preventDefault()} // keep input focus
                  onClick={() => selectAdvisor(a)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={[
                    "cursor-pointer px-3 py-2 text-sm",
                    active ? "bg-slate-100" : "",
                    selected ? "font-semibold text-slate-900" : "text-slate-700",
                  ].join(" ")}
                >
                  {full}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Keyboard handlers */}
      <input
        // hidden input to capture key events if needed
        aria-hidden
        className="sr-only"
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            const pick = filtered[activeIndex];
            if (pick) selectAdvisor(pick);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
    </div>
  );
}
