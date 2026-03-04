"use client";

import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActionToast, { ToastType } from "@/app/components/ActionToast";
import { getApiErrorMessage } from "@/app/lib/apiError";

const API_URL = "http://localhost:3000/api/v1/actors";
const NATIONALITIES = [
  "American",
  "Spanish",
  "Danish",
  "Colombian",
  "French",
  "Mexican",
  "Argentinian",
];

export default function ActorCreateForm() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [nationality, setNationality] = useState("");
  const [birthday, setBirthday] = useState("");
  const [biography, setBiography] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setToast(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          photo,
          nationality,
          birthDate: birthday,
          biography,
        }),
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, "no se pudo crear el actor"));
      }

      await response.json();

      setName("");
      setPhoto("");
      setNationality("");
      setBirthday("");
      setBiography("");

      navigate("/actors", {
        state: {
          toast: {
            type: "success",
            message: "Actor creado correctamente.",
          },
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ocurrio un error inesperado";
      setError(message);
      setToast({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl">
      {toast ? <ActionToast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-sm text-slate-400">Actors &nbsp;&gt;&nbsp; Add New Actor</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">Add New Actor</h1>
          <p className="mt-1 text-base text-slate-500">
            Provide the professional details and media for the new actor profile.
          </p>
        </div>

        <div className="grid gap-6 px-6 py-6 md:grid-cols-[1fr_170px]">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Leonardo DiCaprio"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="birthday" className="mb-1 block text-sm font-semibold text-slate-700">
                  Date of Birth
                </label>
                <input
                  id="birthday"
                  type="date"
                  value={birthday}
                  onChange={(event) => setBirthday(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                  required
                />
              </div>
              <div>
                <label htmlFor="nationality" className="mb-1 block text-sm font-semibold text-slate-700">
                  Nationality
                </label>
                <select
                  id="nationality"
                  value={nationality}
                  onChange={(event) => setNationality(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                  required
                >
                  <option value="">Select country</option>
                  {NATIONALITIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="photo" className="mb-1 block text-sm font-semibold text-slate-700">
              Profile Image
            </label>
            <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-400">
              Click to upload portrait
            </div>
            <input
              id="photo"
              type="url"
              value={photo}
              onChange={(event) => setPhoto(event.target.value)}
              placeholder="Paste image URL"
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-300"
              required
            />
          </div>
        </div>

        <div className="px-6 pb-6">
          <label htmlFor="biography" className="mb-1 block text-sm font-semibold text-slate-700">
            Biography
          </label>
          <textarea
            id="biography"
            value={biography}
            onChange={(event) => setBiography(event.target.value)}
            rows={4}
            placeholder="Write a short professional biography..."
            className="w-full rounded-md border border-slate-200 px-3 py-3 text-slate-700 outline-none focus:border-blue-300"
            required
          />
        </div>

        <div className="border-t border-slate-200 px-6 py-4">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/actors")}
              className="rounded-md px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Actor"}
            </button>
          </div>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </div>
      </form>
    </section>
  );
}
