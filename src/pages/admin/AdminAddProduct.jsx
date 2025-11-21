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

// ✅ Validation Schema
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
      label: yup.string().required("Label is required"),
      value: yup.string().required("Value is required"),
    })
  ),
  productDescription: yup.string().optional(),
  variants: yup.array().of(
    yup.object({
      colorCode: yup.string().required("Color is required"),
      color: yup.string(),
      images: yup
        .array()
        .of(yup.string().url("Must be a valid URL"))
        .min(1, "At least one image required for variant"),
      sizes: yup.array().of(
        yup.object({
          size: yup
            .mixed()
            .test(
              "is-valid-size",
              "Size is required",
              (value) =>
                (typeof value === "string" && value.trim() !== "") ||
                (Array.isArray(value) && value.length > 0)
            ),
          mrp: yup
            .number()
            .typeError("MRP must be a number")
            .positive("MRP must be positive")
            .required("MRP is required"),
          price: yup
            .number()
            .typeError("Price must be a number")
            .positive("Price must be positive")
            .required("Price is required"),
          countInStock: yup
            .number()
            .integer("Stock must be integer")
            .min(0, "Stock cannot be negative")
            .required("Stock is required"),
        })
      ),
    })
  ),
});

const AdminAddProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

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
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
    { value: "XL", label: "XL" },
    { value: "XXL", label: "XXL" },
  ];

  // Watch variants to handle dynamic fields
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // 🟢 Fetch for Edit
  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const res = await axiosInstance.get(`/products/${id}`);
          const product = res.data;
          console.log("product", res.data);
          console.log("Fetched product:", product.isFeatured);

          // 🧩 Convert existing sizes into grouped format for React Select
          const formattedVariants = product.variants?.map((variant) => {
            const groupedSizes = [];

            variant.sizes?.forEach((item) => {
              // Try to find existing group with same price, mrp, stock
              const existingGroup = groupedSizes.find(
                (g) =>
                  g.mrp === item.mrp &&
                  g.price === item.price &&
                  g.countInStock === item.countInStock
              );

              if (existingGroup) {
                existingGroup.size.push(item.size); // add size to existing group
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

          const formattedData = {
            ...product,
            isFeatured: product.isFeatured ?? false,
            keyFeatures: product.keyFeatures?.length
              ? product.keyFeatures
              : [{ label: "", value: "" }],
            variants: formattedVariants,
          };

          reset(formattedData);
        } catch (error) {
          console.error("Error fetching product:", error);
        }
      };
      fetchProduct();
    }
  }, [id, reset]);

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      }/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const json = await res.json();
    return json.secure_url;
  };

  // 🟢 Submit
  const onSubmit = async (data) => {
    try {
      // Filter out empty values
      const filteredData = {
        ...data,
        thumbnailImage: data.thumbnailImage,
        isFeatured: !!data.isFeatured,
        keyFeatures: data.keyFeatures.filter(
          (feature) =>
            feature.label.trim() !== "" && feature.value.trim() !== ""
        ),
        variants: data.variants.map((variant) => ({
          ...variant,
          images: variant.images.filter((img) => img && img.trim() !== ""),
          sizes: variant.sizes
            .filter((sizeObj) =>
              Array.isArray(sizeObj.size)
                ? sizeObj.size.length > 0
                : sizeObj.size && sizeObj.size.trim() !== ""
            )
            .flatMap((sizeObj) =>
              Array.isArray(sizeObj.size)
                ? sizeObj.size.map((s) => ({
                    size: s,
                    mrp: sizeObj.mrp,
                    price: sizeObj.price,
                    countInStock: sizeObj.countInStock,
                  }))
                : [sizeObj]
            ),
        })),
      };
      console.log("filteredData", filteredData);
      console.log("filteredData", id);

      if (id) {
        await axiosInstance.put(`/products/${id}`, filteredData);
        toast.success("✅ Product updated successfully!");
      } else {
        await axiosInstance.post("/products", filteredData);
        toast.success("✅ Product added successfully!");
      }
      navigate("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("❌ Something went wrong!");
    }
  };

  const getColorName = (hex) => {
    try {
      const name = ColorNamer(hex).ntc[0].name;
      return name || hex;
    } catch {
      return hex;
    }
  };

  // Helper function to manage variant sizes
  const addSizeToVariant = (vIndex) => {
    const currentSizes = variants[vIndex]?.sizes || [];
    setValue(`variants.${vIndex}.sizes`, [
      ...currentSizes,
      { size: "", price: "", mrp: "", countInStock: 0 },
    ]);
  };

  const removeSizeFromVariant = (vIndex, sIndex) => {
    const currentSizes = variants[vIndex]?.sizes || [];
    const updatedSizes = currentSizes.filter((_, index) => index !== sIndex);
    setValue(`variants.${vIndex}.sizes`, updatedSizes);
  };

  // Helper function to manage variant images
  const addImageToVariant = (vIndex) => {
    const currentImages = variants[vIndex]?.images || [];
    setValue(`variants.${vIndex}.images`, [...currentImages, ""]);
  };

  const removeImageFromVariant = (vIndex, imgIndex) => {
    const currentImages = variants[vIndex]?.images || [];
    const updatedImages = currentImages.filter(
      (_, index) => index !== imgIndex
    );
    setValue(`variants.${vIndex}.images`, updatedImages);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-card rounded-2xl mt-8 font-sans">
      <h2 className="text-3xl font-serif font-semibold mb-8 text-primary text-center">
        {id ? "Edit Product" : "Add New Product"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 🟢 Basic Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-primary">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Product Name *</label>
              <input
                {...register("name")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium">Category *</label>
              <select
                {...register("category")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none bg-white"
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

              {errors.category && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium">MRP (₹) *</label>
              <input
                type="number"
                {...register("mrp")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
              />
              {errors.mrp && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.mrp.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium">Base Price (₹) *</label>
              <input
                type="number"
                {...register("basePrice")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
              />
              {errors.basePrice && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.basePrice.message}
                </p>
              )}
            </div>
          </div>

          {/* Short Description */}
          <div className="mt-4">
            <label className="block mb-1 font-medium">Short Description</label>
            <textarea
              {...register("description")}
              rows="3"
              placeholder="Brief description that appears in product listings..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
            />
          </div>

          {/* Thumbnail Image */}
          <div className="mt-4">
            <label className="block mb-2 font-medium">Thumbnail Image *</label>

            {/* Keep it registered but hidden */}
            <input type="hidden" {...register("thumbnailImage")} />

            {/* Input row */}
            <div className="flex items-center gap-2 mb-2">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  try {
                    setIsUploadingImages(true);
                    const url = await uploadToCloudinary(file);
                    setValue("thumbnailImage", url, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    toast.success("Thumbnail uploaded!");
                  } catch (err) {
                    console.error(err);
                    toast.error("Failed to upload thumbnail");
                  } finally {
                    setIsUploadingImages(false);
                  }
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 flex-1"
              />
              {isUploadingImages && (
                <p className="text-xs text-gray-500 mt-1">Uploading image...</p>
              )}

              {/* Preview button */}
              {watch("thumbnailImage") && (
                <button
                  type="button"
                  onClick={() => setPreviewImage(watch("thumbnailImage"))}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-s hover:bg-gray-100"
                >
                  Preview
                </button>
              )}
            </div>

            {errors.thumbnailImage && (
              <p className="text-red-500 text-sm mt-1">
                {errors.thumbnailImage.message}
              </p>
            )}
          </div>
          {previewImage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="bg-white rounded-2xl p-4 max-w-xl w-[90%] shadow-xl">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Image Preview
                  </h3>
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="max-h-[70vh] overflow-hidden rounded-xl bg-black/5 border">
                  <img
                    src={previewImage}
                    className="w-full h-full object-contain max-h-[70vh]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeatured"
              {...register("isFeatured")}
              className="w-5 h-5 accent-primary cursor-pointer"
            />
            <label
              htmlFor="isFeatured"
              className="text-sm font-medium text-gray-700 select-none"
            >
              Mark as Featured Product
            </label>
          </div>
        </div>

        {/* 🗝️ Key Features */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block mb-2 font-semibold text-primary">
            Key Features
          </label>
          {featureFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 mb-2">
              <input
                {...register(`keyFeatures.${index}.label`)}
                placeholder="Label (e.g., Material, Fit)"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
              />
              <input
                {...register(`keyFeatures.${index}.value`)}
                placeholder="Value (e.g., Cotton, Regular Fit)"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
              />
              {featureFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addFeature({ label: "", value: "" })}
            className="mt-2 bg-primary text-light px-4 py-2 rounded-lg hover:bg-accent hover:text-dark transition"
          >
            + Add Feature
          </button>
        </div>

        {/* 📝 Product Description */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block mb-1 font-medium">Detailed Description</label>
          <textarea
            {...register("productDescription")}
            rows="5"
            placeholder="Full product description with details, features, care instructions..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
          />
        </div>

        {/* 🎨 Variants Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <label className="font-semibold text-primary text-lg">
              Product Variants
            </label>
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
              className="bg-primary text-light px-4 py-2 rounded-lg hover:bg-accent hover:text-dark transition"
            >
              + Add Color Variant
            </button>
          </div>

          {variantFields.map((variant, vIndex) => (
            <div
              key={variant.id}
              className="border border-gray-300 p-4 rounded-lg mb-4 bg-white space-y-4"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-dark">
                  Color Variant {vIndex + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeVariant(vIndex)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Remove Variant
                </button>
              </div>
              {/* Color Info */}
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-800">
                    Color *
                  </label>

                  <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      {/* 🎨 Left: Color Picker */}
                      <div className="flex flex-col items-center">
                        <HexColorPicker
                          color={
                            watch(`variants.${vIndex}.colorCode`) || "#000000"
                          }
                          onChange={(value) => {
                            setValue(`variants.${vIndex}.colorCode`, value);

                            // 🔹 Auto-convert to color name
                            const colorName = getColorName(value);
                            setValue(`variants.${vIndex}.color`, colorName);
                          }}
                          className="w-100 h-40 rounded-lg overflow-hidden border border-gray-300 shadow-inner"
                        />
                        <div
                          className="mt-3 w-20 h-8 rounded-md border border-gray-300"
                          style={{
                            backgroundColor:
                              watch(`variants.${vIndex}.colorCode`) ||
                              "#000000",
                          }}
                        ></div>
                      </div>

                      {/* 🧩 Right: Inputs */}
                      <div className="flex flex-col gap-3">
                        {/* Color Code Input */}
                        <div>
                          <label className="text-sm text-gray-600 mb-1 block">
                            Color Code / Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. red, #f1c00e"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            value={watch(`variants.${vIndex}.colorCode`) || ""}
                            onChange={(e) => {
                              const val = e.target.value.trim().toLowerCase();
                              const temp = document.createElement("div");
                              temp.style.color = val;
                              document.body.appendChild(temp);
                              const computed =
                                window.getComputedStyle(temp).color;
                              document.body.removeChild(temp);

                              if (computed.startsWith("rgb")) {
                                const rgb = computed.match(/\d+/g);
                                const hex = `#${rgb
                                  .map((x) =>
                                    Number(x).toString(16).padStart(2, "0")
                                  )
                                  .join("")}`;
                                setValue(`variants.${vIndex}.colorCode`, hex);
                                const colorName = getColorName(hex);
                                setValue(`variants.${vIndex}.color`, colorName);
                              } else {
                                setValue(`variants.${vIndex}.colorCode`, val);
                                const colorName = getColorName(val);
                                setValue(`variants.${vIndex}.color`, colorName);
                              }
                            }}
                          />
                        </div>

                        {/* Converted Color Name */}
                        <div>
                          <label className="text-sm text-gray-600 mb-1 block">
                            Color Name (auto)
                          </label>
                          <input
                            type="text"
                            disabled
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                            value={watch(`variants.${vIndex}.color`) || ""}
                            placeholder="Auto detected color name"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Variant Images */}
              <div>
                <label className="block font-medium mb-2">
                  Variant Images *
                </label>

                {variants[vIndex]?.images?.map((_, imgIndex) => {
                  const imgValue = watch(
                    `variants.${vIndex}.images.${imgIndex}`
                  );

                  return (
                    <div
                      key={imgIndex}
                      className="mb-4 border p-3 rounded-lg bg-white"
                    >
                      {/* Hidden registered field */}
                      <input
                        type="hidden"
                        {...register(`variants.${vIndex}.images.${imgIndex}`)}
                      />

                      {/* Row: input + X remove + preview */}
                      <div className="flex items-center gap-2">
                        {/* File input */}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            try {
                              setIsUploadingImages(true);
                              const url = await uploadToCloudinary(file);

                              setValue(
                                `variants.${vIndex}.images.${imgIndex}`,
                                url,
                                {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                }
                              );
                              toast.success("Image uploaded!");
                            } catch (err) {
                              console.error(err);
                              toast.error("Failed to upload image");
                            } finally {
                              setIsUploadingImages(false);
                            }
                          }}
                          className="border border-gray-300 rounded-lg px-3 py-2 flex-1"
                        />

                        {/* Remove */}
                        {variants[vIndex]?.images?.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeImageFromVariant(vIndex, imgIndex)
                            }
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            ✕
                          </button>
                        )}

                        {/* Preview */}
                        {imgValue && (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(imgValue)}
                            className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-100"
                          >
                            Preview
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add new image */}
                <button
                  type="button"
                  onClick={() => addImageToVariant(vIndex)}
                  className="mt-1 bg-primary text-light px-3 py-1.5 rounded-lg hover:bg-accent hover:text-dark transition"
                >
                  + Add Variant Image
                </button>
              </div>

              {previewImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                  <div className="bg-white rounded-2xl p-4 max-w-xl w-[90%] shadow-xl">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-semibold text-gray-800">
                        Image Preview
                      </h3>
                      <button
                        onClick={() => setPreviewImage(null)}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="max-h-[70vh] overflow-hidden rounded-xl bg-black/5 border">
                      <img
                        src={previewImage}
                        className="w-full h-full object-contain max-h-[70vh]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sizes for each variant */}
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Sizes & Pricing</label>

                {/* Same Price Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`samePrice-${vIndex}`}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const basicMrp = watch("mrp");
                      const basePrice = watch("basePrice");

                      // Update each size in this variant
                      const updatedSizes = variants[vIndex]?.sizes?.map(
                        (size, sIndex) => {
                          setValue(
                            `variants.${vIndex}.sizes.${sIndex}.mrp`,
                            checked ? basicMrp : ""
                          );
                          setValue(
                            `variants.${vIndex}.sizes.${sIndex}.price`,
                            checked ? basePrice : ""
                          );
                          return size;
                        }
                      );

                      // Store checkbox state
                      setValue(`variants.${vIndex}.samePrice`, checked);
                    }}
                    checked={watch(`variants.${vIndex}.samePrice`) || false}
                    className="cursor-pointer w-4 h-4 accent-primary"
                  />
                  <label
                    htmlFor={`samePrice-${vIndex}`}
                    className="text-sm text-gray-700 select-none"
                  >
                    Same as Basic Price
                  </label>
                </div>
              </div>
              {variants[vIndex]?.sizes?.map((size, sIndex) => {
                const samePrice = watch(`variants.${vIndex}.samePrice`);
                const selectedSizes =
                  watch(`variants.${vIndex}.sizes.${sIndex}.size`) || [];

                return (
                  <div
                    key={sIndex}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-3 p-3 bg-gray-100 rounded-lg"
                  >
                    {/* Size Selector - spans more columns */}
                    <div className="sm:col-span-5">
                      <Select
                        isMulti
                        isClearable={false}
                        closeMenuOnSelect={false}
                        options={(() => {
                          // 1️⃣ Get all selected sizes across this variant (vIndex)
                          const allSelectedSizes =
                            variants[vIndex]?.sizes
                              ?.flatMap((s) => s.size || [])
                              ?.filter(Boolean) || [];

                          // 2️⃣ Get sizes for this current row
                          const currentRowSizes =
                            variants[vIndex]?.sizes?.[sIndex]?.size || [];

                          // 3️⃣ Show only sizes not already selected in other rows
                          return sizeOptions.filter(
                            (opt) =>
                              !allSelectedSizes.includes(opt.value) ||
                              currentRowSizes.includes(opt.value) // keep current row’s selected ones visible
                          );
                        })()}
                        value={
                          Array.isArray(selectedSizes)
                            ? selectedSizes.map((s) => ({ value: s, label: s }))
                            : []
                        }
                        onChange={(selected) =>
                          setValue(
                            `variants.${vIndex}.sizes.${sIndex}.size`,
                            selected.map((s) => s.value)
                          )
                        }
                        className="w-full text-sm"
                        classNames={{
                          control: () =>
                            "border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent",
                        }}
                        styles={{
                          multiValue: (base) => ({
                            ...base,
                            whiteSpace: "nowrap",
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            flexWrap: "nowrap",
                            overflowX: "auto",
                          }),
                        }}
                        placeholder="Select sizes..."
                      />
                    </div>

                    {/* MRP */}
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        {...register(`variants.${vIndex}.sizes.${sIndex}.mrp`)}
                        placeholder="MRP"
                        disabled={samePrice}
                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none ${
                          samePrice ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
                      />
                    </div>

                    {/* Price */}
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        {...register(
                          `variants.${vIndex}.sizes.${sIndex}.price`
                        )}
                        placeholder="Price"
                        disabled={samePrice}
                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none ${
                          samePrice ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
                      />
                    </div>

                    {/* Stock */}
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        {...register(
                          `variants.${vIndex}.sizes.${sIndex}.countInStock`
                        )}
                        placeholder="Stock"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent focus:outline-none"
                      />
                    </div>

                    {/* Remove Button */}
                    <div className="sm:col-span-1 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeSizeFromVariant(vIndex, sIndex)}
                        className="px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => addSizeToVariant(vIndex)}
                className="bg-primary text-light px-4 py-2 rounded-lg hover:bg-accent hover:text-dark transition"
              >
                + Add Size
              </button>
            </div>
          ))}
        </div>

        {/* 🔘 Submit */}
        <button
          type="submit"
          disabled={isSubmitting || isUploadingImages}
          className="w-full bg-primary text-light py-3 rounded-xl hover:bg-accent hover:text-dark transition font-semibold disabled:opacity-50"
        >
          {isUploadingImages
            ? "Uploading images..."
            : isSubmitting
            ? "Saving..."
            : id
            ? "Update Product"
            : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AdminAddProduct;
