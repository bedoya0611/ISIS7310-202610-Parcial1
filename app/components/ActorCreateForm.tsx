"use client";

import { FormEvent, useId, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActionToast, { ToastType } from "@/app/components/ActionToast";
import { getApiErrorMessage } from "@/app/lib/apiError";
import { useLocale } from "@/app/lib/locale";

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
  const { isSpanish, translateNationality } = useLocale();
  const formDescriptionId = useId();
  const photoHelpId = useId();
  const errorId = useId();

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [nationality, setNationality] = useState("");
  const [birthday, setBirthday] = useState("");
  const [biography, setBiography] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const text = useMemo(
    () =>
      isSpanish
        ? {
            createFallback: "no se pudo crear el actor",
            unexpectedError: "Ocurrio un error inesperado",
            success: "Actor creado correctamente.",
            breadcrumb: "Actores > Crear actor",
            title: "Crear actor",
            description: "Ingresa los datos profesionales y la imagen del nuevo actor.",
            fullName: "Nombre completo",
            dateOfBirth: "Fecha de nacimiento",
            nationality: "Nacionalidad",
            selectCountry: "Selecciona un pais",
            profileImage: "Imagen de perfil",
            imageHint: "Vista previa de la imagen del actor",
            photoHelp: "Pega una URL directa de la imagen del actor.",
            photoPlaceholder: "Pega la URL de la imagen",
            biography: "Biografia",
            biographyPlaceholder: "Escribe una breve biografia profesional...",
            cancel: "Cancelar",
            saveActor: "Guardar actor",
            saving: "Guardando...",
            savingStatus: "Guardando actor...",
          }
        : {
            createFallback: "could not create the actor",
            unexpectedError: "An unexpected error occurred",
            success: "Actor created successfully.",
            breadcrumb: "Actors > Add actor",
            title: "Add actor",
            description: "Provide the professional details and image for the new actor.",
            fullName: "Full name",
            dateOfBirth: "Date of birth",
            nationality: "Nationality",
            selectCountry: "Select a country",
            profileImage: "Profile image",
            imageHint: "Actor image preview",
            photoHelp: "Paste a direct image URL for the actor.",
            photoPlaceholder: "Paste image URL",
            biography: "Biography",
            biographyPlaceholder: "Write a short professional biography...",
            cancel: "Cancel",
            saveActor: "Save actor",
            saving: "Saving...",
            savingStatus: "Saving actor...",
          },
    [isSpanish],
  );

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
        throw new Error(await getApiErrorMessage(response, text.createFallback));
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
            message: text.success,
          },
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : text.unexpectedError;
      setError(message);
      setToast({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl" aria-labelledby="actor-create-title">
      {toast ? <ActionToast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        aria-busy={submitting}
        aria-describedby={error ? `${formDescriptionId} ${errorId}` : formDescriptionId}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-sm text-slate-400" aria-hidden="true">
            {text.breadcrumb}
          </p>
          <h1 id="actor-create-title" className="mt-2 text-4xl font-bold text-slate-900">
            {text.title}
          </h1>
          <p id={formDescriptionId} className="mt-1 text-base text-slate-500">
            {text.description}
          </p>
        </div>

        <div className="grid gap-6 px-6 py-6 md:grid-cols-[1fr_170px]">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-semibold text-slate-700">
                {text.fullName}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Leonardo DiCaprio"
                autoComplete="name"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="birthday" className="mb-1 block text-sm font-semibold text-slate-700">
                  {text.dateOfBirth}
                </label>
                <input
                  id="birthday"
                  type="date"
                  value={birthday}
                  onChange={(event) => setBirthday(event.target.value)}
                  autoComplete="bday"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                  required
                />
              </div>
              <div>
                <label htmlFor="nationality" className="mb-1 block text-sm font-semibold text-slate-700">
                  {text.nationality}
                </label>
                <select
                  id="nationality"
                  value={nationality}
                  onChange={(event) => setNationality(event.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-700 outline-none focus:border-blue-300"
                  required
                >
                  <option value="">{text.selectCountry}</option>
                  {NATIONALITIES.map((country) => (
                    <option key={country} value={country}>
                      {translateNationality(country)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="photo" className="mb-1 block text-sm font-semibold text-slate-700">
              {text.profileImage}
            </label>
            <div
              className="flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-400"
              aria-hidden="true"
            >
              {text.imageHint}
            </div>
            <p id={photoHelpId} className="mt-2 text-xs text-slate-500">
              {text.photoHelp}
            </p>
            <input
              id="photo"
              type="url"
              value={photo}
              onChange={(event) => setPhoto(event.target.value)}
              placeholder={text.photoPlaceholder}
              inputMode="url"
              autoComplete="url"
              aria-describedby={photoHelpId}
              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-300"
              required
            />
          </div>
        </div>

        <div className="px-6 pb-6">
          <label htmlFor="biography" className="mb-1 block text-sm font-semibold text-slate-700">
            {text.biography}
          </label>
          <textarea
            id="biography"
            value={biography}
            onChange={(event) => setBiography(event.target.value)}
            rows={4}
            placeholder={text.biographyPlaceholder}
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
              {text.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? text.saving : text.saveActor}
            </button>
          </div>
          {submitting ? (
            <p className="mt-3 text-sm text-slate-500" role="status" aria-live="polite">
              {text.savingStatus}
            </p>
          ) : null}
          {error ? (
            <p id={errorId} className="mt-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
