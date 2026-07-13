import { useMemo, useRef, useState } from "react";
import {
  CARD_LOCATIONS,
  CATEGORIES,
  DIFFICULTIES,
  type Card,
  type Category,
} from "../types";
import { Button, CATEGORY_ICON } from "../components/ui";
import { makeId, sanitizeCards } from "../storage/localStorage";

type Draft = Omit<Card, "id"> & { id?: string };

function blankDraft(category: Category): Draft {
  return {
    title: "",
    description: "",
    category,
    difficulty: "Easy",
    location: "All",
    enabled: true,
  };
}

export function CardEditorScreen({
  cards,
  onChange,
  onBack,
  onToast,
}: {
  cards: Card[];
  onChange: (cards: Card[]) => void;
  onBack: () => void;
  onToast: (message: string, error?: boolean) => void;
}) {
  const [filter, setFilter] = useState<Category>("Truth");
  const [draft, setDraft] = useState<Draft | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const visible = useMemo(
    () => cards.filter((c) => c.category === filter),
    [cards, filter],
  );

  const upsert = (value: Draft) => {
    if (!value.title.trim() || !value.description.trim()) {
      onToast("Title and description are required", true);
      return;
    }
    if (value.id) {
      onChange(
        cards.map((c) =>
          c.id === value.id ? ({ ...value, id: value.id } as Card) : c,
        ),
      );
    } else {
      onChange([...cards, { ...value, id: makeId() } as Card]);
    }
    setDraft(null);
    onToast("Card saved");
  };

  const remove = (id: string) => {
    onChange(cards.filter((c) => c.id !== id));
    onToast("Card deleted");
  };

  const duplicate = (card: Card) => {
    const copy: Card = { ...card, id: makeId(), title: `${card.title} (copy)` };
    const index = cards.findIndex((c) => c.id === card.id);
    const next = cards.slice();
    next.splice(index + 1, 0, copy);
    onChange(next);
    onToast("Card duplicated");
  };

  const toggleEnabled = (id: string) => {
    onChange(
      cards.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)),
    );
  };

  const exportCards = () => {
    const blob = new Blob([JSON.stringify(cards, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "risk-it-cards.json";
    a.click();
    URL.revokeObjectURL(url);
    onToast("Cards exported");
  };

  const importCards = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = sanitizeCards(JSON.parse(text));
      if (!parsed) {
        onToast("No valid cards in that file", true);
        return;
      }
      onChange(parsed);
      onToast(`Imported ${parsed.length} cards`);
    } catch {
      onToast("Could not read that file", true);
    }
  };

  if (draft) {
    return (
      <CardForm
        draft={draft}
        onSave={upsert}
        onCancel={() => setDraft(null)}
      />
    );
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <h2>Card Editor</h2>
      </div>

      <div className="chip-row">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={"chip" + (filter === cat ? " chip--active" : "")}
            onClick={() => setFilter(cat)}
            title={cat}
          >
            {CATEGORY_ICON[cat]}
          </button>
        ))}
      </div>

      <Button variant="primary" block onClick={() => setDraft(blankDraft(filter))}>
        + Add {filter}
      </Button>

      <div className="stack--sm">
        {visible.length === 0 && (
          <p className="muted">No {filter} cards yet.</p>
        )}
        {visible.map((card) => (
          <div
            key={card.id}
            className={"list-item" + (card.enabled ? "" : " list-item--disabled")}
          >
            <div className="list-item__body">
              <div className="list-item__title">{card.title}</div>
              <div className="list-item__meta">
                {card.difficulty} · {card.location}
                {card.enabled ? "" : " · disabled"}
              </div>
            </div>
            <button
              className="icon-btn"
              onClick={() => toggleEnabled(card.id)}
              title={card.enabled ? "Disable" : "Enable"}
            >
              {card.enabled ? "👁" : "🚫"}
            </button>
            <button
              className="icon-btn"
              onClick={() => setDraft(card)}
              title="Edit"
            >
              ✎
            </button>
            <button
              className="icon-btn"
              onClick={() => duplicate(card)}
              title="Duplicate"
            >
              ⧉
            </button>
            <button
              className="icon-btn"
              onClick={() => remove(card.id)}
              title="Delete"
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      <div className="spacer" />
      <div className="section-title">Backup</div>
      <div className="btn-row">
        <Button variant="secondary" onClick={exportCards}>
          ⇩ Export
        </Button>
        <Button variant="secondary" onClick={() => fileInput.current?.click()}>
          ⇧ Import
        </Button>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void importCards(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function CardForm({
  draft,
  onSave,
  onCancel,
}: {
  draft: Draft;
  onSave: (draft: Draft) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState<Draft>(draft);
  const set = <K extends keyof Draft>(key: K, v: Draft[K]) =>
    setValue((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" onClick={onCancel} aria-label="Cancel">
          ←
        </button>
        <h2>{draft.id ? "Edit Card" : "New Card"}</h2>
      </div>

      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={value.title}
          maxLength={40}
          onChange={(e) => set("title", e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="desc">Description</label>
        <textarea
          id="desc"
          value={value.description}
          maxLength={240}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="cat">Category</label>
        <select
          id="cat"
          value={value.category}
          onChange={(e) => set("category", e.target.value as Category)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="diff">Difficulty</label>
        <select
          id="diff"
          value={value.difficulty}
          onChange={(e) =>
            set("difficulty", e.target.value as Draft["difficulty"])
          }
        >
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="loc">Location</label>
        <select
          id="loc"
          value={value.location}
          onChange={(e) => set("location", e.target.value as Draft["location"])}
        >
          {CARD_LOCATIONS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <button
        className="toggle"
        onClick={() => set("enabled", !value.enabled)}
        aria-pressed={value.enabled}
      >
        <span>Enabled</span>
        <span
          className={`toggle__state toggle__state--${value.enabled ? "on" : "off"}`}
        >
          {value.enabled ? "ON" : "OFF"}
        </span>
      </button>

      <div className="spacer" />
      <div className="btn-row">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onSave(value)}>
          Save
        </Button>
      </div>
    </div>
  );
}
