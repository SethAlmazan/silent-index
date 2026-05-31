"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegistrationForm() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [proofPreviews, setProofPreviews] = useState<
    { id: string; url: string; file: File }[]
  >([]);
  const [inspectionPreviews, setInspectionPreviews] = useState<
    { id: string; url: string; file: File }[]
  >([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      alert("You must login first.");
      router.push("/login");
      return;
    }

    const proofImageUrls: string[] = [];

    if (proofPreviews.length > 0) {
      for (const image of proofPreviews) {
        const file = image.file;
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("proof-ownership")
          .upload(fileName, file);

        if (uploadError) {
          console.error(uploadError);
          setLoading(false);
          alert(uploadError.message);
          return;
        }

        const { data } = supabase.storage
          .from("proof-ownership")
          .getPublicUrl(fileName);

        proofImageUrls.push(data.publicUrl);
      }
    }

    const inspectionImageUrls: string[] = [];

    if (inspectionPreviews.length > 0) {
      for (const image of inspectionPreviews) {
        const file = image.file;
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("inspection-images")
          .upload(fileName, file);

        if (uploadError) {
          console.error(uploadError);
          setLoading(false);
          alert(uploadError.message);
          return;
        }

        const { data } = supabase.storage
          .from("inspection-images")
          .getPublicUrl(fileName);

        inspectionImageUrls.push(data.publicUrl);
      }
    }

    const firstName = String(formData.get("first_name") || "").trim();
    const lastName = String(formData.get("last_name") || "").trim();
    const middleName = String(formData.get("middle_name") || "").trim();

    const expiryDate = String(formData.get("expiry_date") || "");
    const today = new Date();
    const expiry = new Date(expiryDate);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const status = expiry < today ? "expired" : "active";

    const { error } = await supabase.from("permits").insert({
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName || null,

      owner_name: `${firstName} ${lastName}`.trim(),

      complete_address: formData.get("complete_address"),
      municipality: formData.get("municipality"),
      barangay: formData.get("barangay"),
      contact_number: formData.get("contact_number"),
      email: formData.get("email") || null,

      brand: formData.get("brand"),
      model: formData.get("model"),
      serial_number: formData.get("serial_number"),
      year_manufactured: formData.get("year_manufactured") || null,
      power_rating: formData.get("power_rating") || null,
      description: formData.get("description") || null,
      length_of_chainsaw: formData.get("length_of_chainsaw") || null,

      registration_date: formData.get("registration_date"),
      expiry_date: formData.get("expiry_date"),
      status_of_issuance: formData.get("status_of_issuance") || null,

      proof_ownership_images: proofImageUrls,
      inspection_images: inspectionImageUrls,

      status,

      user_id: user.id,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("Registration submitted successfully!");

    form.reset();

    proofPreviews.forEach((image) => URL.revokeObjectURL(image.url));
    inspectionPreviews.forEach((image) => URL.revokeObjectURL(image.url));
    setProofPreviews([]);
    setInspectionPreviews([]);

    router.push("/");
    router.refresh();
  }

  function handleProofImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);

    const imageUrls = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${crypto.randomUUID()}`,
      url: URL.createObjectURL(file),
      file,
    }));

    setProofPreviews((prev) => [...prev, ...imageUrls]);

    e.target.value = "";
  }

  function removeProofImage(id: string) {
    setProofPreviews((prev) => {
      const imageToRemove = prev.find((image) => image.id === id);

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      return prev.filter((image) => image.id !== id);
    });
  }

  function handleInspectionImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);

    const imageUrls = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${crypto.randomUUID()}`,
      url: URL.createObjectURL(file),
      file,
    }));

    setInspectionPreviews((prev) => [...prev, ...imageUrls]);

    e.target.value = "";
  }

  function removeInspectionImage(id: string) {
    setInspectionPreviews((prev) => {
      const imageToRemove = prev.find((image) => image.id === id);

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      return prev.filter((image) => image.id !== id);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* OWNER INFORMATION */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-2xl font-bold">Owner Information</h2>

        <div className="grid grid-cols-3 gap-4">
          <input
            name="first_name"
            placeholder="First Name"
            className="rounded-lg border p-3"
            required
          />

          <input
            name="middle_name"
            placeholder="Middle Name"
            className="rounded-lg border p-3"
          />

          <input
            name="last_name"
            placeholder="Last Name"
            className="rounded-lg border p-3"
            required
          />
        </div>

        <input
          name="complete_address"
          placeholder="Street / Purok / Sitio"
          className="mt-4 w-full rounded-lg border p-3"
          required
        />

        <div className="mt-4 grid grid-cols-3 gap-4">
          <input
            name="municipality"
            placeholder="Municipality"
            className="rounded-lg border p-3"
            required
          />

          <input
            name="barangay"
            placeholder="Barangay"
            className="rounded-lg border p-3"
            required
          />

          <input
            name="contact_number"
            placeholder="Contact Number"
            className="rounded-lg border p-3"
            required
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          className="mt-4 w-full rounded-lg border p-3"
        />
      </div>

      {/* CHAINSAW INFORMATION */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-2xl font-bold">Chainsaw Information</h2>

        <div className="grid grid-cols-3 gap-4">
          <input
            name="brand"
            placeholder="Brand"
            className="rounded-lg border p-3"
            required
          />

          <input
            name="model"
            placeholder="Model"
            className="rounded-lg border p-3"
            required
          />

          <input
            name="serial_number"
            placeholder="Serial Number"
            className="rounded-lg border p-3"
            required
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <input
            name="year_manufactured"
            placeholder="Date of Acquisition"
            className="rounded-lg border p-3"
          />

          <input
            name="power_rating"
            placeholder="Horsepower"
            className="rounded-lg border p-3"
          />

          <input
            name="length_of_chainsaw"
            placeholder="Length of Chainsaw"
            className="rounded-lg border p-3"
          />

          <textarea
            name="description"
            placeholder="Description"
            rows={1}
            className="col-span-3 resize-none rounded-lg border p-3"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-2xl font-bold">Registration Details</h2>

        <div className="grid grid-cols-3 gap-4">
          <input
            type="date"
            name="registration_date"
            className="rounded-lg border p-3"
            required
          />

          <input
            type="date"
            name="expiry_date"
            className="rounded-lg border p-3"
            required
          />

          <select
            name="status_of_issuance"
            className="rounded-lg border p-3 text-slate-500"
            required
          >
            <option value="">Status of Issuance</option>
            <option value="New">New</option>
            <option value="Renewal">Renewal</option>
          </select>
        </div>
      </div>

      {/* PROOF OF OWNERSHIP */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-2xl font-bold">Proof of Ownership</h2>

        <label
          htmlFor="proof_ownership_images"
          className="flex min-h-37.5 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-400 bg-slate-50 p-6 text-center hover:bg-slate-100"
        >
          <span className="text-base font-semibold text-slate-700">
            Drag or choose images from your PC
          </span>

          <span className="mt-1 text-sm text-slate-500">
            Upload proof of ownership images for the chainsaw
          </span>

          <input
            id="proof_ownership_images"
            name="proof_ownership_images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleProofImagesChange}
            className="hidden"
          />
        </label>

        {proofPreviews.length > 0 && (
          <div className="mt-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Selected Images: {proofPreviews.length}
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {proofPreviews.map((image, index) => (
                <div
                  key={image.id}
                  className="relative overflow-hidden rounded-lg border bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => removeProofImage(image.id)}
                    className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow hover:bg-red-700"
                    aria-label="Remove image"
                  >
                    ×
                  </button>

                  <Image
                    src={image.url}
                    alt={`Proof of Ownership ${index + 1}`}
                    width={300}
                    height={128}
                    unoptimized
                    className="h-32 w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* INSPECTION IMAGES */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-2xl font-bold">Inspection Images</h2>

        <label
          htmlFor="inspection_images"
          className="flex min-h-37.5 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-400 bg-slate-50 p-6 text-center hover:bg-slate-100"
        >
          <span className="text-base font-semibold text-slate-700">
            Drag or choose images from your PC
          </span>

          <span className="mt-1 text-sm text-slate-500">
            Upload inspection images for the chainsaw
          </span>

          <input
            id="inspection_images"
            name="inspection_images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleInspectionImagesChange}
            className="hidden"
          />
        </label>

        {inspectionPreviews.length > 0 && (
          <div className="mt-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Selected Images: {inspectionPreviews.length}
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {inspectionPreviews.map((image, index) => (
                <div
                  key={image.id}
                  className="relative overflow-hidden rounded-lg border bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => removeInspectionImage(image.id)}
                    className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow hover:bg-red-700"
                    aria-label="Remove image"
                  >
                    ×
                  </button>

                  <Image
                    src={image.url}
                    alt={`Inspection Image ${index + 1}`}
                    width={300}
                    height={128}
                    unoptimized
                    className="h-32 w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-teal-600 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit Registration"}
      </button>
    </form>
  );
}