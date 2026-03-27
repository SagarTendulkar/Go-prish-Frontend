import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import Select from "react-select";
import { HexColorPicker } from "react-colorful";
import ColorNamer from "color-namer";
import toast from "react-hot-toast";
import { Plus, X, ChevronLeft, Upload, Eye, Trash2, Star } from "lucide-react";

// ── Validation schema (unchanged) ────────────────────────────
const schema = yup.object().shape({
  name: yup.string().required("Product name is required"),
  description: yup.string().optional(),
  category: yup.string().required("Category is required"),
  mrp: yup.number().positive().required("MRP is required"),
  basePrice: yup.number().positive().required("Base price is required"),
  thumbnailImage: yup
    .string()
    .url("Enter valid image URL")
    .required("Thumbnail image required"),
  isFeatured: yup.boolean().default(false),
  keyFeatures: yup.array().of(
    yup.object({
      label: yup.string().required("Label required"),
      value: yup.string().required("Value required"),
    }),
  ),
  productDescription: yup.string().optional(),
  variants: yup.array().of(
    yup.object({
      colorCode: yup.string().required("Color is required"),
      color: yup.string(),
      images: yup
        .array()
        .of(yup.string().url("Must be a valid URL"))
        .min(1, "At least one image required"),
      sizes: yup.array().of(
        yup.object({
          size: yup
            .mixed()
            .test(
              "is-valid-size",
              "Size is required",
              (v) =>
                (typeof v === "string" && v.trim() !== "") ||
                (Array.isArray(v) && v.length > 0),
            ),
          mrp: yup
            .number()
            .typeError("MRP must be a number")
            .positive()
            .required("MRP is required"),
          price: yup
            .number()
            .typeError("Price must be a number")
            .positive()
            .required("Price is required"),
          countInStock: yup
            .number()
            .integer()
            .min(0)
            .required("Stock is required"),
        }),
      ),
    }),
  ),
});

// ── Reusable section wrapper ──────────────────────────────────
const Section = ({ title, children, action }) => (
  <div className="bg-surface-card rounded-2xl border border-warm/15 overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4 border-b border-warm/10">
      <p className="text-[13px] font-medium text-ink">{title}</p>
      {action}
    </div>
    <div className="p-5 space-y-4">{children}</div>
  </div>
);

// ── Reusable form field ───────────────────────────────────────
const Field = ({ label, required, error, children }) => (
  <div>
    <label className="text-[11px] font-medium tracking-[1px] uppercase text-ink-muted block mb-1.5">
      {label} {required && <span className="text-brand">*</span>}
    </label>
    {children}
    {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
  </div>
);

const inputCls =
  "w-full px-3.5 py-2.5 text-[13px] text-ink bg-surface border border-warm/25 rounded-xl outline-none placeholder-ink-faint focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all";

// ─────────────────────────────────────────────────────────────
const AdminAddProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      thumbnailImage: "",
      keyFeatures: [{ label: "", value: "" }],
      variants: [
        {
          colorCode: "",
          images: [""],
          sizes: [{ size: [], mrp: "", price: "", countInStock: "" }],
        },
      ],
      isFeatured: false,
    },
  });

  const sizeOptions = [
    { value: "XS", label: "XS" },
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
    { value: "XL", label: "XL" },
    { value: "XXL", label: "XXL" },
  ];
  const selectPortalTarget =
    typeof document !== "undefined" ? document.body : null;

  const variants = watch("variants");

  const {
    fields: featureFields,
    append: addFeature,
    remove: removeFeature,
  } = useFieldArray({ control, name: "keyFeatures" });
  const {
    fields: variantFields,
    append: addVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: "variants" });

  // ── Fetch categories ──────────────────────────────────────
  useEffect(() => {
    axiosInstance
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // ── Fetch product for edit ────────────────────────────────
  useEffect(() => {
    if (!id) return;
    axiosInstance
      .get(`/products/${id}`)
      .then((res) => {
        const product = res.data;
        const formattedVariants = product.variants?.map((variant) => {
          const groupedSizes = [];
          variant.sizes?.forEach((item) => {
            const existing = groupedSizes.find(
              (g) =>
                g.mrp === item.mrp &&
                g.price === item.price &&
                g.countInStock === item.countInStock,
            );
            if (existing) {
              existing.size.push(item.size);
            } else {
              groupedSizes.push({
                size: [item.size],
                mrp: item.mrp,
                price: item.price,
                countInStock: item.countInStock,
              });
            }
          });
          return {
            ...variant,
            images: variant.images?.length ? variant.images : [""],
            sizes: groupedSizes.length
              ? groupedSizes
              : [{ size: [], mrp: "", price: "", countInStock: "" }],
          };
        });
        reset({
          ...product,
          isFeatured: product.isFeatured ?? false,
          keyFeatures: product.keyFeatures?.length
            ? product.keyFeatures
            : [{ label: "", value: "" }],
          variants: formattedVariants,
        });
      })
      .catch((err) => console.error("Error fetching product:", err));
  }, [id, reset]);

  // ── Cloudinary upload ─────────────────────────────────────
  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: data },
    );
    const json = await res.json();
    return json.secure_url;
  };

  const handleFileUpload = async (file, fieldPath) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setValue(fieldPath, url, { shouldValidate: true, shouldDirty: true });
      toast.success("Image uploaded!");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  // ── Submit ────────────────────────────────────────────────
  const onSubmit = async (data) => {
    try {
      const filteredData = {
        ...data,
        isFeatured: !!data.isFeatured,
        keyFeatures: data.keyFeatures.filter(
          (f) => f.label.trim() && f.value.trim(),
        ),
        variants: data.variants.map((variant) => ({
          ...variant,
          images: variant.images.filter((img) => img?.trim()),
          sizes: variant.sizes
            .filter((s) =>
              Array.isArray(s.size) ? s.size.length > 0 : s.size?.trim(),
            )
            .flatMap((s) =>
              Array.isArray(s.size)
                ? s.size.map((sz) => ({
                    size: sz,
                    mrp: s.mrp,
                    price: s.price,
                    countInStock: s.countInStock,
                  }))
                : [s],
            ),
        })),
      };

      if (id) {
        await axiosInstance.put(`/products/${id}`, filteredData);
        toast.success("Product updated!");
      } else {
        await axiosInstance.post("/products", filteredData);
        toast.success("Product added!");
      }
      navigate("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Something went wrong");
    }
  };

  const getColorName = (hex) => {
    try {
      return ColorNamer(hex).ntc[0].name || hex;
    } catch {
      return hex;
    }
  };

  const addSizeToVariant = (vIndex) =>
    setValue(`variants.${vIndex}.sizes`, [
      ...(variants[vIndex]?.sizes || []),
      { size: "", price: "", mrp: "", countInStock: 0 },
    ]);
  const removeSizeFromVariant = (vIndex, sIndex) =>
    setValue(
      `variants.${vIndex}.sizes`,
      (variants[vIndex]?.sizes || []).filter((_, i) => i !== sIndex),
    );
  const addImageToVariant = (vIndex) =>
    setValue(`variants.${vIndex}.images`, [
      ...(variants[vIndex]?.images || []),
      "",
    ]);
  const removeImageFromVariant = (vIndex, iIdx) =>
    setValue(
      `variants.${vIndex}.images`,
      (variants[vIndex]?.images || []).filter((_, i) => i !== iIdx),
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-5">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/products")}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-warm/20 text-ink-muted hover:border-brand hover:text-brand transition-all"
        >
          <ChevronLeft size={15} />
        </button>
        <div>
          <p className="text-[10px] font-medium tracking-[2.5px] uppercase text-brand mb-0.5">
            {id ? "Edit" : "New"} Product
          </p>
          <h1 className="font-serif text-2xl text-ink">
            {id ? "Edit Product" : "Add New Product"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* ── Basic Info ──────────────────────────────────── */}
        <Section title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Product Name" required error={errors.name?.message}>
              <input
                {...register("name")}
                className={inputCls}
                placeholder="e.g. Classic Cotton T-Shirt"
              />
            </Field>

            <Field label="Category" required error={errors.category?.message}>
              <select
                {...register("category")}
                className={`${inputCls} cursor-pointer`}
                defaultValue=""
              >
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.parentCategory
                      ? `${cat.parentCategory.name} → ${cat.name}`
                      : cat.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="MRP (₹)" required error={errors.mrp?.message}>
              <input
                type="number"
                {...register("mrp")}
                className={inputCls}
                placeholder="e.g. 999"
              />
            </Field>

            <Field
              label="Base Price (₹)"
              required
              error={errors.basePrice?.message}
            >
              <input
                type="number"
                {...register("basePrice")}
                className={inputCls}
                placeholder="e.g. 699"
              />
            </Field>
          </div>

          <Field label="Short Description" error={errors.description?.message}>
            <textarea
              {...register("description")}
              rows={2}
              className={inputCls}
              placeholder="Brief description for product listings…"
            />
          </Field>

          {/* Thumbnail upload */}
          <Field
            label="Thumbnail Image"
            required
            error={errors.thumbnailImage?.message}
          >
            <input type="hidden" {...register("thumbnailImage")} />
            <div className="flex items-center gap-3">
              <label
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-warm/30 text-[13px] text-ink-muted cursor-pointer hover:border-brand hover:text-brand transition-all ${isUploading ? "opacity-60 pointer-events-none" : ""}`}
              >
                <Upload size={14} />
                {isUploading ? "Uploading…" : "Upload Image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileUpload(e.target.files[0], "thumbnailImage")
                  }
                />
              </label>

              {watch("thumbnailImage") && (
                <div className="flex items-center gap-2">
                  <img
                    src={watch("thumbnailImage")}
                    className="w-12 h-12 rounded-xl object-cover border border-warm/20"
                    alt="Thumbnail"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewImage(watch("thumbnailImage"))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-warm/20 text-ink-muted hover:border-brand hover:text-brand transition-all"
                  >
                    <Eye size={13} />
                  </button>
                </div>
              )}
            </div>
          </Field>

          {/* Featured toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer w-fit">
            <div
              className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${watch("isFeatured") ? "bg-brand" : "bg-warm/30"}`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${watch("isFeatured") ? "left-4" : "left-0.5"}`}
              />
              <input
                type="checkbox"
                {...register("isFeatured")}
                className="sr-only"
              />
            </div>
            <span className="flex items-center gap-1.5 text-[13px] text-ink-secondary">
              <Star
                size={13}
                className={
                  watch("isFeatured")
                    ? "text-brand fill-brand"
                    : "text-ink-faint"
                }
              />
              Mark as Featured
            </span>
          </label>
        </Section>

        {/* ── Key Features ────────────────────────────────── */}
        <Section
          title="Key Features"
          action={
            <button
              type="button"
              onClick={() => addFeature({ label: "", value: "" })}
              className="flex items-center gap-1.5 text-[12px] font-medium text-brand hover:underline"
            >
              <Plus size={13} /> Add Feature
            </button>
          }
        >
          {featureFields.map((field, index) => (
            <div key={field.id} className="flex gap-2.5 items-start">
              <input
                {...register(`keyFeatures.${index}.label`)}
                placeholder="Label (e.g. Material)"
                className={`${inputCls} flex-1`}
              />
              <input
                {...register(`keyFeatures.${index}.value`)}
                placeholder="Value (e.g. 100% Cotton)"
                className={`${inputCls} flex-1`}
              />
              {featureFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="w-9 h-10 flex items-center justify-center rounded-xl border border-warm/20 text-ink-faint hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </Section>

        {/* ── Detailed Description ─────────────────────────── */}
        <Section title="Detailed Description">
          <textarea
            {...register("productDescription")}
            rows={4}
            className={inputCls}
            placeholder="Full product description with details, features, care instructions…"
          />
        </Section>

        {/* ── Variants ─────────────────────────────────────── */}
        <Section
          title="Product Variants"
          action={
            <button
              type="button"
              onClick={() =>
                addVariant({
                  color: "",
                  colorCode: "",
                  images: [""],
                  sizes: [],
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-dark text-white rounded-xl text-[12px] font-medium hover:bg-brand transition-all"
            >
              <Plus size={13} /> Add Variant
            </button>
          }
        >
          {variantFields.map((variant, vIndex) => (
            <div
              key={variant.id}
              className="border border-warm/20 rounded-2xl overflow-hidden"
            >
              {/* Variant header */}
              <div className="flex items-center justify-between px-4 py-3 bg-surface-raised border-b border-warm/10">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-5 h-5 rounded-full border-2 border-warm/30 shrink-0"
                    style={{
                      backgroundColor:
                        watch(`variants.${vIndex}.colorCode`) || "#ccc",
                    }}
                  />
                  <p className="text-[13px] font-medium text-ink">
                    {watch(`variants.${vIndex}.color`) ||
                      `Variant ${vIndex + 1}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(vIndex)}
                  className="flex items-center gap-1.5 text-[11px] text-red-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Color picker */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div className="flex flex-col items-center gap-3">
                    <HexColorPicker
                      color={watch(`variants.${vIndex}.colorCode`) || "#c97a4a"}
                      onChange={(val) => {
                        setValue(`variants.${vIndex}.colorCode`, val);
                        setValue(`variants.${vIndex}.color`, getColorName(val));
                      }}
                      style={{
                        width: "100%",
                        maxWidth: 220,
                        height: 160,
                        borderRadius: 12,
                      }}
                    />
                    <div
                      className="w-full max-w-[220px] h-8 rounded-xl border border-warm/20 transition-all"
                      style={{
                        backgroundColor:
                          watch(`variants.${vIndex}.colorCode`) || "#ccc",
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <Field label="Color Code / Hex">
                      <input
                        type="text"
                        placeholder="#c97a4a or red"
                        className={inputCls}
                        value={watch(`variants.${vIndex}.colorCode`) || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setValue(`variants.${vIndex}.colorCode`, val);

                          const trimmed = val.trim().toLowerCase();

                          // ── Hex values: only resolve when fully complete (7 chars: #rrggbb)
                          // Never convert mid-typing hex to avoid overwriting user input
                          if (trimmed.startsWith("#")) {
                            if (
                              trimmed.length === 7 &&
                              /^#[0-9a-f]{6}$/.test(trimmed)
                            ) {
                              // Full valid hex — get color name
                              setValue(
                                `variants.${vIndex}.color`,
                                getColorName(trimmed),
                              );
                            } else {
                              // Incomplete hex — clear name, don't touch colorCode
                              setValue(`variants.${vIndex}.color`, "");
                            }
                            return;
                          }

                          // ── Named colors (e.g. "green", "red", "navy")
                          // Only try to parse if at least 3 chars
                          if (trimmed.length < 3) {
                            setValue(`variants.${vIndex}.color`, "");
                            return;
                          }

                          // Test if browser recognizes it as a valid named color
                          const temp = document.createElement("div");
                          temp.style.color = "";
                          temp.style.color = trimmed;
                          document.body.appendChild(temp);
                          const computed = window.getComputedStyle(temp).color;
                          document.body.removeChild(temp);

                          const wasRecognized = temp.style.color !== "";

                          if (wasRecognized && computed.startsWith("rgb")) {
                            // Convert named color → hex → store
                            const rgb = computed.match(/\d+/g);
                            const hex = `#${rgb.map((x) => Number(x).toString(16).padStart(2, "0")).join("")}`;
                            setValue(`variants.${vIndex}.colorCode`, hex);
                            setValue(
                              `variants.${vIndex}.color`,
                              getColorName(hex),
                            );
                          } else {
                            setValue(`variants.${vIndex}.color`, "");
                          }
                        }}
                      />
                    </Field>
                    <Field label="Color Name (auto)">
                      <input
                        type="text"
                        disabled
                        className={`${inputCls} opacity-60 cursor-not-allowed`}
                        value={watch(`variants.${vIndex}.color`) || ""}
                        placeholder="Auto-detected"
                      />
                    </Field>
                  </div>
                </div>

                {/* Variant images */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[11px] font-medium tracking-[1px] uppercase text-ink-muted">
                      Variant Images *
                    </p>
                    <button
                      type="button"
                      onClick={() => addImageToVariant(vIndex)}
                      className="flex items-center gap-1 text-[11px] text-brand hover:underline"
                    >
                      <Plus size={11} /> Add Image
                    </button>
                  </div>
                  <div className="space-y-2">
                    {variants[vIndex]?.images?.map((_, imgIndex) => {
                      const imgVal = watch(
                        `variants.${vIndex}.images.${imgIndex}`,
                      );
                      return (
                        <div key={imgIndex} className="flex items-center gap-2">
                          <input
                            type="hidden"
                            {...register(
                              `variants.${vIndex}.images.${imgIndex}`,
                            )}
                          />
                          <label
                            className={`flex items-center gap-2 flex-1 px-3.5 py-2 rounded-xl border border-warm/25 bg-surface text-[13px] text-ink-muted cursor-pointer hover:border-brand transition-all ${isUploading ? "opacity-60 pointer-events-none" : ""}`}
                          >
                            <Upload size={13} className="shrink-0" />
                            {imgVal ? "Replace image" : "Upload image"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleFileUpload(
                                  e.target.files[0],
                                  `variants.${vIndex}.images.${imgIndex}`,
                                )
                              }
                            />
                          </label>
                          {imgVal && (
                            <>
                              <img
                                src={imgVal}
                                className="w-9 h-9 rounded-xl object-cover border border-warm/20 shrink-0"
                              />
                              <button
                                type="button"
                                onClick={() => setPreviewImage(imgVal)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl border border-warm/20 text-ink-faint hover:border-brand hover:text-brand transition-all shrink-0"
                              >
                                <Eye size={13} />
                              </button>
                            </>
                          )}
                          {variants[vIndex]?.images?.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeImageFromVariant(vIndex, imgIndex)
                              }
                              className="w-9 h-9 flex items-center justify-center rounded-xl border border-warm/20 text-ink-faint hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sizes & Pricing */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[11px] font-medium tracking-[1px] uppercase text-ink-muted">
                      Sizes & Pricing
                    </p>
                    <div className="flex items-center gap-3">
                      {/* Same price toggle */}
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            watch(`variants.${vIndex}.samePrice`) || false
                          }
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const basicMrp = watch("mrp");
                            const basePrice = watch("basePrice");
                            variants[vIndex]?.sizes?.forEach((_, sIndex) => {
                              setValue(
                                `variants.${vIndex}.sizes.${sIndex}.mrp`,
                                checked ? basicMrp : "",
                              );
                              setValue(
                                `variants.${vIndex}.sizes.${sIndex}.price`,
                                checked ? basePrice : "",
                              );
                            });
                            setValue(`variants.${vIndex}.samePrice`, checked);
                          }}
                          className="w-3.5 h-3.5 accent-brand cursor-pointer"
                        />
                        <span className="text-[11px] text-ink-muted">
                          Same as basic price
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => addSizeToVariant(vIndex)}
                        className="flex items-center gap-1 text-[11px] text-brand hover:underline"
                      >
                        <Plus size={11} /> Add Size
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Header row */}
                    <div className="grid grid-cols-12 gap-2 px-1">
                      {["Sizes", "MRP ₹", "Price ₹", "Stock", ""].map(
                        (h, i) => (
                          <p
                            key={i}
                            className={`text-[10px] font-medium uppercase text-ink-faint ${i === 0 ? "col-span-5" : i === 4 ? "col-span-1" : "col-span-2"}`}
                          >
                            {h}
                          </p>
                        ),
                      )}
                    </div>

                    {variants[vIndex]?.sizes?.map((size, sIndex) => {
                      const samePrice = watch(`variants.${vIndex}.samePrice`);
                      const selectedSizes =
                        watch(`variants.${vIndex}.sizes.${sIndex}.size`) || [];
                      const allSelected =
                        variants[vIndex]?.sizes
                          ?.flatMap((s) => s.size || [])
                          .filter(Boolean) || [];
                      const currentRow =
                        variants[vIndex]?.sizes?.[sIndex]?.size || [];

                      return (
                        <div
                          key={sIndex}
                          className="grid grid-cols-12 gap-2 items-center bg-surface-raised rounded-xl p-2 border border-warm/10"
                        >
                          <div className="col-span-5 z-20">
                            <Select
                              isMulti
                              isClearable={false}
                              closeMenuOnSelect={false}
                              menuPortalTarget={selectPortalTarget}
                              menuPosition="fixed"
                              options={sizeOptions.filter(
                                (o) =>
                                  !allSelected.includes(o.value) ||
                                  currentRow.includes(o.value),
                              )}
                              value={
                                Array.isArray(selectedSizes)
                                  ? selectedSizes.map((s) => ({
                                      value: s,
                                      label: s,
                                    }))
                                  : []
                              }
                              onChange={(sel) =>
                                setValue(
                                  `variants.${vIndex}.sizes.${sIndex}.size`,
                                  sel.map((s) => s.value),
                                )
                              }
                              placeholder="Sizes…"
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  border: "1.5px solid rgba(210,170,145,0.3)",
                                  borderRadius: 10,
                                  fontSize: 12,
                                  minHeight: 36,
                                  boxShadow: "none",
                                }),
                                multiValue: (base) => ({
                                  ...base,
                                  background: "#c97a4a15",
                                  borderRadius: 6,
                                }),
                                multiValueLabel: (base) => ({
                                  ...base,
                                  color: "#3d2b1f",
                                  fontSize: 11,
                                }),
                                placeholder: (base) => ({
                                  ...base,
                                  color: "#b89a88",
                                  fontSize: 12,
                                }),
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 9999,
                                }),
                                menu: (base) => ({
                                  ...base,
                                  zIndex: 9999,
                                }),
                              }}
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              {...register(
                                `variants.${vIndex}.sizes.${sIndex}.mrp`,
                              )}
                              placeholder="MRP"
                              disabled={samePrice}
                              className={`${inputCls} ${samePrice ? "opacity-50 cursor-not-allowed" : ""}`}
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              {...register(
                                `variants.${vIndex}.sizes.${sIndex}.price`,
                              )}
                              placeholder="Price"
                              disabled={samePrice}
                              className={`${inputCls} ${samePrice ? "opacity-50 cursor-not-allowed" : ""}`}
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              {...register(
                                `variants.${vIndex}.sizes.${sIndex}.countInStock`,
                              )}
                              placeholder="Stock"
                              className={inputCls}
                            />
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <button
                              type="button"
                              onClick={() =>
                                removeSizeFromVariant(vIndex, sIndex)
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-lg border border-warm/20 text-ink-faint hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {variantFields.length === 0 && (
            <p className="text-[13px] text-ink-faint text-center py-4">
              No variants added yet. Click "Add Variant" to start.
            </p>
          )}
        </Section>

        {/* ── Submit ──────────────────────────────────────── */}
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-dark text-white rounded-2xl text-[14px] font-medium transition-all duration-300 hover:bg-brand hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,122,74,0.35)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isUploading
            ? "Uploading images…"
            : isSubmitting
              ? "Saving…"
              : id
                ? "Update Product"
                : "Add Product"}
        </button>
      </form>

      {/* ── Image preview modal ──────────────────────────── */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-surface-card rounded-2xl border border-warm/15 p-4 max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-medium text-ink">Image Preview</p>
              <button
                onClick={() => setPreviewImage(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-warm/20 text-ink-muted hover:border-red-300 hover:text-red-500 transition-all"
              >
                <X size={13} />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-surface-raised max-h-[70vh] flex items-center justify-center">
              <img
                src={previewImage}
                className="w-full h-full object-contain max-h-[70vh]"
                alt="Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAddProduct;
