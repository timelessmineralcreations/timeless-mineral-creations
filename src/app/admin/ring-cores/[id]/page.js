import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function saveRingCore(formData) {
  "use server";

  const id = formData.get("id");

  await prisma.ringCore.update({
    where: { id },

    data: {
      name: formData.get("name"),
      slug: formData.get("slug"),
      material: formData.get("material"),
      finish: formData.get("finish"),
      color: formData.get("color"),

      supplier: formData.get("supplier"),
      supplierUrl: formData.get("supplierUrl"),

      supplierCostCents: Math.round(
        Number(formData.get("supplierCost")) * 100
      ),

      widthsJson: formData.get("widthsJson"),
      sizesJson: formData.get("sizesJson"),
      channelDimensionsJson: formData.get("channelDimensionsJson"),
      notes: formData.get("notes"),

      imageUrl: formData.get("imageUrl"),

      active: formData.get("active") === "on",
      featured: formData.get("featured") === "on",
    },
  });

  redirect("/admin/ring-cores");
}

async function deleteRingCore(formData) {
  "use server";

  await prisma.ringCore.delete({
    where: {
      id: formData.get("id"),
    },
  });

  redirect("/admin/ring-cores");
}

export default async function EditRingCorePage({ params }) {
  const { id } = await params;

  const core = await prisma.ringCore.findUnique({
    where: {
      id,
    },
  });

  if (!core) {
    notFound();
  }

  return (
    <main style={{ maxWidth: 900, margin: "50px auto" }}>
      <h1>Edit Ring Core</h1>

      <form action={saveRingCore}>

        <input type="hidden" name="id" value={core.id} />

        <p>Name</p>
        <input
          name="name"
          defaultValue={core.name}
        />

        <p>Slug</p>
        <input
          name="slug"
          defaultValue={core.slug}
        />

        <p>Material</p>
        <input
          name="material"
          defaultValue={core.material}
        />

        <p>Finish</p>
        <input
          name="finish"
          defaultValue={core.finish || ""}
        />

        <p>Color</p>
        <input
          name="color"
          defaultValue={core.color || ""}
        />

        <p>Supplier</p>
        <input
          name="supplier"
          defaultValue={core.supplier || ""}
        />

        <p>Supplier URL</p>
        <input
          name="supplierUrl"
          defaultValue={core.supplierUrl || ""}
        />

        <p>Supplier Cost</p>
        <input
          type="number"
          step="0.01"
          name="supplierCost"
          defaultValue={(core.supplierCostCents / 100).toFixed(2)}
        />

        <p>Widths</p>
        <textarea
          rows={2}
          name="widthsJson"
          defaultValue={core.widthsJson || ""}
        />

        <p>Sizes</p>
        <textarea
          rows={2}
          name="sizesJson"
          defaultValue={core.sizesJson || ""}
        />

        <p>Channel Dimensions</p>
        <textarea
          rows={2}
          name="channelDimensionsJson"
          defaultValue={core.channelDimensionsJson || ""}
        />

        <p>Image URL</p>
        <input
          name="imageUrl"
          defaultValue={core.imageUrl || ""}
        />

        <p>Notes</p>
        <textarea
          rows={4}
          name="notes"
          defaultValue={core.notes || ""}
        />

        <br />

        <label>
          <input
            type="checkbox"
            name="active"
            defaultChecked={core.active}
          />
          Active
        </label>

        <br />

        <label>
          <input
            type="checkbox"
            name="featured"
            defaultChecked={core.featured}
          />
          Featured
        </label>

        <br />
        <br />

        <button type="submit">
          Save Changes
        </button>

      </form>

      <hr style={{ margin: "40px 0" }} />

      <form action={deleteRingCore}>
        <input
          type="hidden"
          name="id"
          value={core.id}
        />

        <button
          type="submit"
          style={{
            background: "red",
            color: "white",
            padding: "10px 20px",
          }}
        >
          Delete Ring Core
        </button>
      </form>

    </main>
  );
}