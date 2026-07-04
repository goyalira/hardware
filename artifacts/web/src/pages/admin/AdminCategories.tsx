import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { categoryApi } from "@/api/services";
import type { Category } from "@/types";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    categoryApi.list().then(setCategories).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setName("");
    setDescription("");
    setEditingId(null);
    setError(null);
    setShowForm(true);
  }

  function openEdit(c: Category) {
    setName(c.name);
    setDescription(c.description ?? "");
    setEditingId(c._id);
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await categoryApi.update(editingId, { name, description });
      } else {
        await categoryApi.create({ name, description });
      }
      setShowForm(false);
      load();
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message ?? "Failed to save category.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    try {
      await categoryApi.remove(id);
      load();
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      alert(message ?? "Failed to delete category.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Categories</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-orange-400"
        >
          <Plus className="h-4 w-4" /> New category
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">{editingId ? "Edit category" : "New category"}</h2>
            <button onClick={() => setShowForm(false)}>
              <X className="h-5 w-5 text-neutral-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-3">
            <input
              required
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
              rows={2}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              className="rounded-md bg-neutral-900 py-2.5 text-sm font-semibold text-white hover:bg-orange-500"
            >
              {editingId ? "Save changes" : "Create category"}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-neutral-500">
                  Loading...
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c._id} className="border-b border-neutral-100">
                  <td className="px-4 py-3 font-medium text-neutral-900">{c.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{c.description}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="text-neutral-500 hover:text-neutral-900">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(c._id)} className="text-neutral-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
