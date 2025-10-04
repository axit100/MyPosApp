"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Plus,
  Minus,
  Calendar,
  FileText,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Wallet
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";

type CashNote = {
  _id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
};

type FeedbackState = { message: string; tone: "success" | "info" | "warning" } | null;

const TYPE_OPTIONS: ReadonlyArray<"credit" | "debit"> = ["credit", "debit"] as const;
const PAGE_SIZE = 20;

const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

interface ToastProps {
  feedback: FeedbackState;
  onDismiss: () => void;
}

function Toast({ feedback, onDismiss }: Readonly<ToastProps>) {
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [feedback, onDismiss]);

  if (!feedback) return null;

  const tone = {
    success: {
      bg: "bg-green-500/90",
      border: "border-green-300/70",
      icon: "text-green-50"
    },
    info: {
      bg: "bg-blue-500/90",
      border: "border-blue-300/70",
      icon: "text-blue-50"
    },
    warning: {
      bg: "bg-yellow-500/90",
      border: "border-yellow-300/70",
      icon: "text-yellow-50"
    }
  }[feedback.tone];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <div
        className={`pointer-events-auto rounded-2xl px-4 py-3 shadow-xl border backdrop-blur text-sm text-white flex items-center gap-3 ${tone.bg} ${tone.border}`}
      >
        <Sparkles className={`w-4 h-4 ${tone.icon}`} />
        <span className="flex-1 font-semibold tracking-tight">{feedback.message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs uppercase tracking-wide font-semibold text-white/80 hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}

interface SummaryCardsProps {
  totalCredit: number;
  totalDebit: number;
  netTotal: number;
}

function SummaryCards({ totalCredit, totalDebit, netTotal }: Readonly<SummaryCardsProps>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-green-100 via-green-50 to-white dark:from-green-900 dark:via-green-800/40 dark:to-gray-800 border border-green-200 dark:border-green-700 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-green-600 dark:text-green-300">Total Credit</p>
            <p className="mt-2 text-2xl font-bold text-green-700 dark:text-green-200">{formatCurrency(totalCredit)}</p>
          </div>
          <TrendingUp className="w-10 h-10 text-green-500/70" />
        </div>
      </div>
      <div className="bg-gradient-to-br from-rose-100 via-rose-50 to-white dark:from-rose-900 dark:via-rose-800/40 dark:to-gray-800 border border-rose-200 dark:border-rose-700 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-rose-600 dark:text-rose-300">Total Debit</p>
            <p className="mt-2 text-2xl font-bold text-rose-700 dark:text-rose-200">{formatCurrency(totalDebit)}</p>
          </div>
          <Wallet className="w-10 h-10 text-rose-500/70" />
        </div>
      </div>
      <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-white dark:from-blue-900 dark:via-blue-800/40 dark:to-gray-800 border border-blue-200 dark:border-blue-700 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-600 dark:text-blue-300">Net Balance</p>
            <p className={`mt-2 text-2xl font-bold ${netTotal >= 0 ? "text-blue-700 dark:text-blue-200" : "text-rose-700 dark:text-rose-200"}`}>
              {formatCurrency(netTotal)}
            </p>
          </div>
          <Sparkles className="w-10 h-10 text-blue-500/70" />
        </div>
      </div>
    </div>
  );
}

interface DateRangeFilterProps {
  filterStart: string;
  filterEnd: string;
  onChangeStart: (value: string) => void;
  onChangeEnd: (value: string) => void;
  onClear: () => void;
  isValid: boolean;
}

function DateRangeFilter({ filterStart, filterEnd, onChangeStart, onChangeEnd, onClear, isValid }: Readonly<DateRangeFilterProps>) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-5">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Select date range</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Limit to 12 months for focused insights</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:ml-auto">
          <input
            type="date"
            value={filterStart}
            onChange={event => onChangeStart(event.target.value)}
            className="border rounded-xl px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="md:self-center text-sm text-gray-500">to</span>
          <input
            type="date"
            value={filterEnd}
            onChange={event => onChangeEnd(event.target.value)}
            className="border rounded-xl px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {(filterStart || filterEnd) && (
            <button
              onClick={onClear}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Clear range
            </button>
          )}
        </div>
      </div>
      {!isValid && (
        <p className="mt-3 text-xs text-rose-500">
          Please select a valid range (start before end, maximum 12 months).
        </p>
      )}
    </div>
  );
}

interface NoteFormProps {
  mode: "add" | "edit";
  noteType: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
  onTypeChange: (next: "credit" | "debit") => void;
  onAmountChange: (value: number) => void;
  onDescriptionChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

function NoteForm({
  mode,
  noteType,
  amount,
  description,
  date,
  onTypeChange,
  onAmountChange,
  onDescriptionChange,
  onDateChange,
  onSubmit,
  onCancel
}: Readonly<NoteFormProps>) {
  const title = mode === "add" ? "Capture new movement" : "Edit note details";
  const subtitle = mode === "add" ? "Add cash note" : "Update cash note";
  const primaryLabel = mode === "add" ? "Add movement" : "Save changes";
  const primaryGradient = mode === "add" ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" : "bg-blue-600 hover:bg-blue-700";

  return (
    <div className={`mx-auto w-full  rounded-2xl border shadow-sm p-5 sm:p-6 bg-gradient-to-br from-gray-50 via-white to-white dark:from-gray-900 dark:via-gray-800/80 dark:to-gray-800 border-gray-200 dark:border-gray-700 ${mode === "edit" ? "ring-2 ring-blue-400" : ""}`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{subtitle}</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg">
          <FileText className="w-5 h-5" />
        </div>
      </div>

      {/* First row: cash in/out, amount, entry date */}
      <div className="flex flex-col md:flex-row gap-3 mb-3">
        <div className="flex w-full gap-2 md:w-auto md:min-w-[220px]">
          {TYPE_OPTIONS.map(option => {
            const Icon = option === "credit" ? Plus : Minus;
            const isActive = noteType === option;
            const activeClasses = option === "credit"
              ? "bg-emerald-500 text-white border-emerald-500 shadow-lg"
              : "bg-rose-500 text-white border-rose-500 shadow-lg";
            const idleClasses = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400";
            let iconColor = option === "credit" ? "text-emerald-500" : "text-rose-500";
            if (isActive) {
              iconColor = "text-white";
            }

            return (
              <button
                key={option}
                type="button"
                onClick={() => onTypeChange(option)}
                className={`group flex-1 md:flex-none rounded-xl border px-4 py-3 text-left transition-all ${isActive ? activeClasses : idleClasses}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide opacity-70">{option === "credit" ? "Cash in" : "Cash out"}</p>
                    <p className="text-base font-semibold">{option === "credit" ? "Credit" : "Debit"}</p>
                  </div>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
              </button>
            );
          })}
        </div>
        <div className="w-full md:w-32">
          <label className="block">
            <span className="text-xs uppercase font-semibold text-gray-500">Amount (₹)</span>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={event => onAmountChange(Number(event.target.value))}
              className="mt-1 w-full border rounded-xl px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </label>
        </div>
        <div className="w-full md:w-40">
          <label className="block">
            <span className="text-xs uppercase font-semibold text-gray-500">Entry date</span>
            <input
              type="date"
              value={date}
              onChange={event => onDateChange(event.target.value)}
              className="mt-1 w-full border rounded-xl px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Second row: description and add movement button */}
      <div className="flex flex-col md:flex-row gap-3 items-end">
        <div className="w-full md:flex-1">
          <label className="block">
            <span className="text-xs uppercase font-semibold text-gray-500">Description</span>
            <textarea
              value={description}
              onChange={event => onDescriptionChange(event.target.value)}
              className="mt-1 w-full border rounded-xl px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none md:min-h-[44px]"
              rows={2}
              placeholder="Reason, reference or note"
            />
          </label>
        </div>
        <div className="flex flex-row gap-2 w-full md:w-auto">
          <button
            onClick={onSubmit}
            className={`flex-1 ${primaryGradient} text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-shadow hover:shadow-lg`}
          >
            <Sparkles className="w-4 h-4" /> {primaryLabel}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-xl font-semibold transition-shadow hover:shadow-md"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface NotesTableProps {
  notes: CashNote[];
  totalRecords: number;
  paginationEnabled: boolean;
  page: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onEdit: (note: CashNote) => void;
  onDelete: (id: string) => void;
}

function NotesTable({
  notes,
  totalRecords,
  paginationEnabled,
  page,
  totalPages,
  onPrevPage,
  onNextPage,
  onEdit,
  onDelete
}: Readonly<NotesTableProps>) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Cash Notes</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {totalRecords} record{totalRecords === 1 ? "" : "s"} in selected range
          </p>
        </div>
        {paginationEnabled && <span className="text-xs text-blue-500">Pagination enabled</span>}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide text-xs">Date</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide text-xs">Type</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide text-xs">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide text-xs">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {notes.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400 dark:text-gray-500">
                  No cash notes found for this range. Try adjusting the dates or add a new movement above.
                </td>
              </tr>
            ) : (
              notes.map(note => (
                <tr key={note._id} className="hover:bg-blue-50/60 dark:hover:bg-blue-900/20 transition-colors">
                  <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">{formatDate(note.date)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${note.type === "credit" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/15 text-rose-700 dark:text-rose-300"}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current"></span>
                      {note.type === "credit" ? "Credit" : "Debit"}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-semibold ${note.type === "credit" ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}`}>
                    {formatCurrency(note.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {note.description || <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => onEdit(note)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 hover:dark:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => onDelete(note._id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 hover:dark:bg-rose-900/30 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {paginationEnabled && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={onPrevPage}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page === totalPages}
              onClick={onNextPage}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CashManagementPage() {
  const [notes, setNotes] = useState<CashNote[]>([]);
  const [type, setType] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [editNote, setEditNote] = useState<CashNote | null>(null);
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [page, setPage] = useState(1);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const isValidRange = useMemo(() => {
    if (!filterStart || !filterEnd) return true;
    const start = new Date(filterStart);
    const end = new Date(filterEnd);
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return diffMonths <= 12 && start <= end;
  }, [filterStart, filterEnd]);

  const filteredNotes = useMemo(() => {
    // Filtering is now handled by the backend API, so just sort here
    return [...notes].sort((a, b) => b.date.localeCompare(a.date));
  }, [notes]);

  const totalRecords = filteredNotes.length;
  const paginationEnabled = totalRecords > 200;
  const totalPages = paginationEnabled ? Math.ceil(totalRecords / PAGE_SIZE) : 1;

  const paginatedNotes = useMemo(() => {
    if (!paginationEnabled) return filteredNotes;
    const startIdx = (page - 1) * PAGE_SIZE;
    return filteredNotes.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredNotes, page, paginationEnabled]);

  const totals = useMemo(() => {
    return filteredNotes.reduce(
      (acc, note) => {
        if (note.type === "credit") {
          acc.credit += note.amount;
        } else {
          acc.debit += note.amount;
        }
        return acc;
      },
      { credit: 0, debit: 0 }
    );
  }, [filteredNotes]);

  const resetAddForm = () => {
    setType("credit");
    setAmount(0);
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
  };

  const handleAddNote = async () => {
    if (!amount || amount <= 0) return;
    try {
      const res = await fetch("/api/cash-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, amount, description, date }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      const newNote = await res.json();
      setNotes(prev => [newNote, ...prev]);
      resetAddForm();
      setFeedback({ message: `${type === "credit" ? "Credit" : "Debit"} note added`, tone: "success" });
    } catch (e) {
      console.error('Failed to add note:', e);
      setFeedback({ message: "Failed to add note", tone: "warning" });
    }
  };

  const handleEditNote = (note: CashNote) => {
    setEditNote(note);
    setFeedback({ message: "Editing note", tone: "info" });
  };

  const handleSaveEdit = async () => {
    if (!editNote) return;
    try {
      const res = await fetch(`/api/cash-notes/${editNote._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: editNote.type,
          amount: editNote.amount,
          description: editNote.description,
          date: editNote.date,
        }),
      });
      if (!res.ok) throw new Error("Failed to update note");
      const updated = await res.json();
      setNotes(prev => prev.map(note => (note._id === updated._id ? updated : note)));
      setEditNote(null);
      setFeedback({ message: "Changes saved", tone: "success" });
    } catch (e) {
      console.error('Failed to update note:', e);
      setFeedback({ message: "Failed to update note", tone: "warning" });
    }
  };

  const handleDeleteNote = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/cash-notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
      setNotes(prev => prev.filter(note => note._id !== id));
      setFeedback({ message: "Note deleted", tone: "success" });
    } catch (e) {
      console.error('Failed to delete note:', e);
      setFeedback({ message: "Failed to delete note", tone: "warning" });
    }
  }, []);

  const handleCancelEdit = () => {
    setEditNote(null);
    setFeedback(null);
  };

  const handleDismissFeedback = () => setFeedback(null);

  const handleRangeClear = () => {
    setFilterStart("");
    setFilterEnd("");
    setPage(1);
  };

  const handlePrevPage = () => setPage(current => Math.max(1, current - 1));
  const handleNextPage = () => setPage(current => Math.min(totalPages, current + 1));

  // Fetch notes from API
  useEffect(() => {
    const fetchNotes = async () => {
      let url = `/api/cash-notes?page=1&pageSize=1000`;
      if (filterStart) url += `&start=${filterStart}`;
      if (filterEnd) url += `&end=${filterEnd}`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch notes");
        const data = await res.json();
        setNotes(data.notes);
      } catch (e) {
        console.error('Failed to load notes:', e);
        setFeedback({ message: "Failed to load notes", tone: "warning" });
      }
    };
    fetchNotes();
  }, [filterStart, filterEnd]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <DashboardHeader title="Cash Management" subtitle="Manage cash flow and transactions" showBackButton />
      <Toast feedback={feedback} onDismiss={handleDismissFeedback} />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <SummaryCards totalCredit={totals.credit} totalDebit={totals.debit} netTotal={totals.credit - totals.debit} />
        <DateRangeFilter
          filterStart={filterStart}
          filterEnd={filterEnd}
          onChangeStart={value => {
            setFilterStart(value);
            setPage(1);
          }}
          onChangeEnd={value => {
            setFilterEnd(value);
            setPage(1);
          }}
          onClear={handleRangeClear}
          isValid={isValidRange}
        />

        <div className="grid grid-cols-1">
          {editNote ? (
            <NoteForm
              mode="edit"
              noteType={editNote.type}
              amount={editNote.amount}
              description={editNote.description}
              date={editNote.date}
              onTypeChange={next => setEditNote(prev => (prev ? { ...prev, type: next } : prev))}
              onAmountChange={value => setEditNote(prev => (prev ? { ...prev, amount: value } : prev))}
              onDescriptionChange={value => setEditNote(prev => (prev ? { ...prev, description: value } : prev))}
              onDateChange={value => setEditNote(prev => (prev ? { ...prev, date: value } : prev))}
              onSubmit={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          ) : (
            <NoteForm
              mode="add"
              noteType={type}
              amount={amount}
              description={description}
              date={date}
              onTypeChange={setType}
              onAmountChange={setAmount}
              onDescriptionChange={setDescription}
              onDateChange={setDate}
              onSubmit={handleAddNote}
            />
          )}
        </div>

        <NotesTable
          notes={paginatedNotes}
          totalRecords={totalRecords}
          paginationEnabled={paginationEnabled}
          page={page}
          totalPages={totalPages}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
        />
      </div>
    </div>
  );
}
