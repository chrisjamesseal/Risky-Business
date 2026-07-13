import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  CARD_LOCATIONS,
  CATEGORIES,
  DIFFICULTIES,
  isScoringCategory,
  type Card,
  type Category,
} from "../types";
import {
  Button,
  CATEGORY_COLOR,
  CATEGORY_ICON,
  CATEGORY_SHORT,
  DifficultyBadge,
} from "../components/ui";
import { GameCard } from "../components/GameCard";
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
    setDraft(null);
    onToast("Card deleted");
  };

  const duplicate = (card: Draft) => {
    if (!card.id) return;
    const copy: Card = {
      ...(card as Card),
      id: makeId(),
      title: `${card.title} (copy)`,
    };
    const index = cards.findIndex((c) => c.id === card.id);
    const next = cards.slice();
    next.splice(index + 1, 0, copy);
    onChange(next);
    setDraft(null);
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
        onDelete={draft.id ? () => remove(draft.id!) : undefined}
        onDuplicate={draft.id ? () => duplicate(draft) : undefined}
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

      <div className="cat-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={"cat-tab" + (filter === cat ? " cat-tab--active" : "")}
            onClick={() => setFilter(cat)}
            aria-pressed={filter === cat}
          >
            <span className="cat-tab__icon">{CATEGORY_ICON[cat]}</span>
            <span className="cat-tab__label">{CATEGORY_SHORT[cat]}</span>
          </button>
        ))}
      </div>

      <Button variant="primary" block onClick={() => setDraft(blankDraft(filter))}>
        + Add {filter}
      </Button>

      <div className="stack--sm">
        {visible.length === 0 && <p className="muted">No {filter} cards yet.</p>}
        {visible.map((card) => (
          <div
            key={card.id}
            className={
              "editor-item" + (card.enabled ? "" : " editor-item--off")
            }
          >
            <button
              className="editor-item__main"
              onClick={() => setDraft(card)}
            >
              <span
                className="editor-item__icon"
                style={{ color: CATEGORY_COLOR[card.category] }}
              >
                {CATEGORY_ICON[card.category]}
              </span>
              <span className="editor-item__body">
                <span className="editor-item__titlerow">
                  <span className="editor-item__title">{card.title}</span>
                  <span className="editor-item__edit">✎ Edit</span>
                </span>
                <span className="editor-item__desc">{card.description}</span>
                <span className="editor-item__meta">
                  {isScoringCategory(card.category) ? (
                    <DifficultyBadge difficulty={card.difficulty} />
                  ) : (
                    <span className="editor-item__nopts">No points</span>
                  )}
                  <span className="editor-item__loc">{card.location}</span>
                </span>
              </span>
            </button>
            <button
              className={
                "editor-item__toggle editor-item__toggle--" +
                (card.enabled ? "on" : "off")
              }
              onClick={() => toggleEnabled(card.id)}
              aria-pressed={card.enabled}
              title={card.enabled ? "Enabled — tap to disable" : "Disabled — tap to enable"}
            >
              {card.enabled ? "ON" : "OFF"}
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
  onDelete,
  onDuplicate,
}: {
  draft: Draft;
  onSave: (draft: Draft) => void;
  onCancel: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}) {
  const [value, setValue] = useState<Draft>(draft);
  const set = <K extends keyof Draft>(key: K, v: Draft[K]) =>
    setValue((prev) => ({ ...prev, [key]: v }));

  // Grow the description box to fit its text so the whole prompt is visible.
  const descRef = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = descRef.current;
    if (!el) return;
    el.style.height = "auto";
    // scrollHeight excludes borders; add them back (border-box sizing).
    const borders = el.offsetHeight - el.clientHeight;
    el.style.height = `${el.scrollHeight + borders}px`;
  }, [value.description]);

  // A card to render in the live preview — fall back to placeholders while empty.
  const preview: Card = {
    id: value.id ?? "preview",
    title: value.title.trim() || "Card title",
    description: value.description.trim() || "Card description shows here…",
    category: value.category,
    difficulty: value.difficulty,
    location: value.location,
    enabled: value.enabled,
  };

  const confirmDelete = () => {
    if (onDelete && window.confirm(`Delete "${value.title || "this card"}"?`)) {
      onDelete();
    }
  };

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" onClick={onCancel} aria-label="Cancel">
          ←
        </button>
        <h2>{draft.id ? "Edit Card" : "New Card"}</h2>
      </div>

      <div className="section-title">Preview</div>
      <GameCard card={preview} />

      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={value.title}
          maxLength={40}
          autoFocus
          onChange={(e) => set("title", e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="desc">Description</label>
        <textarea
          id="desc"
          ref={descRef}
          className="textarea--grow"
          value={value.description}
          maxLength={240}
          onChange={(e) => set("description", e.target.value)}
        />
        <span className="field__count">{value.description.length}/240</span>
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

      {isScoringCategory(value.category) ? (
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
      ) : (
        <p className="muted" style={{ fontSize: 12 }}>
          {value.category} cards award no points — everyone just joins in.
        </p>
      )}

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
        <span>Enabled in games</span>
        <span
          className={`toggle__state toggle__state--${value.enabled ? "on" : "off"}`}
        >
          {value.enabled ? "ON" : "OFF"}
        </span>
      </button>

      {(onDuplicate || onDelete) && (
        <div className="btn-row">
          {onDuplicate && (
            <Button variant="secondary" onClick={onDuplicate}>
              ⧉ Duplicate
            </Button>
          )}
          {onDelete && (
            <Button variant="danger" onClick={confirmDelete}>
              🗑 Delete
            </Button>
          )}
        </div>
      )}

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
