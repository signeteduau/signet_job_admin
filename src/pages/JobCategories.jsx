import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

import { Plus, Trash2, Pencil, X } from "lucide-react";

export default function JobCategories() {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  // Load categories
  const loadCategories = async () => {
    const snap = await getDocs(collection(db, "jobCategories"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setCategories(list);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setCategoryName("");
    setEditCategory(null);
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setCategoryName(cat.name);
    setEditCategory(cat);
    setModalOpen(true);
  };

  const saveCategory = async () => {
    if (!categoryName.trim()) return alert("Name required!");

    if (editCategory) {
      await updateDoc(doc(db, "jobCategories", editCategory.id), {
        name: categoryName,
      });
    } else {
      await addDoc(collection(db, "jobCategories"), {
        name: categoryName,
        createdAt: serverTimestamp(),
      });
    }

    setModalOpen(false);
    loadCategories();
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    await deleteDoc(doc(db, "jobCategories", id));
    loadCategories();
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Job Categories</h1>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--purple))] text-white rounded-lg shadow hover:opacity-90"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[rgb(var(--card-border))] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[rgb(var(--card))]">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr
                key={cat.id}
                className="border-t border-[rgb(var(--card-border))]"
              >
                <td className="px-4 py-3">{cat.name}</td>
                <td className="px-4 py-3 flex gap-3">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-2 rounded-md hover:bg-[rgb(var(--foreground))/10%]"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-2 rounded-md hover:bg-red-500/20 text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-[rgb(var(--card))] p-6 rounded-xl w-96 border border-[rgb(var(--card-border))] shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">
                {editCategory ? "Edit Category" : "Add Category"}
              </h2>

              <button onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Category name"
              className="w-full px-3 py-2 rounded-lg border border-[rgb(var(--card-border))] bg-[rgb(var(--background))]"
            />

            <button
              onClick={saveCategory}
              className="mt-4 w-full px-4 py-2 bg-[rgb(var(--purple))] text-white rounded-lg hover:opacity-90"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
