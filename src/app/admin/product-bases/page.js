import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProductBasesPage() {
    const productBases = await prisma.productBase.findMany({
        orderBy: [
            {
                name: "asc",
            },
        ],

        include: {
            supplier: true,
            collections: {
                include: {
                    collection: true,
                },
                orderBy: {
                    sortOrder: "asc",
                },
            },
            variants: true,
        },
    });

    return (
        <main
            style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "32px 24px 80px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "30px",
                }}
            >
                <div>
                    <p
                        style={{
                            color: "#d9b56d",
                            fontWeight: "800",
                            marginBottom: "6px",
                        }}
                    >
                        ADMIN
                    </p>

                    <h1
                        style={{
                            margin: 0,
                            fontSize: "40px",
                        }}
                    >
                        Product Bases
                    </h1>
                </div>

                <Link
                    href="/admin/product-bases/new"
                    style={{
                        padding: "12px 22px",
                        borderRadius: "12px",
                        background: "#d9b56d",
                        color: "#111",
                        textDecoration: "none",
                        fontWeight: "900",
                    }}
                >
                    + New Product Base
                </Link>
            </div>

            <div
                style={{
                    display: "grid",
                    gap: "16px",
                }}
            >
                {productBases.map((product) => (
                    <Link
                        key={product.id}
                        href={`/admin/product-bases/${product.id}`}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "18px",
                            borderRadius: "14px",
                            border: "1px solid rgba(255,255,255,.12)",
                            textDecoration: "none",
                            color: "inherit",
                        }}
                    >
                        <div>
                            <h3
                                style={{
                                    margin: 0,
                                }}
                            >
                                {product.name}
                            </h3>

                            <div
                                style={{
                                    marginTop: "6px",
                                    color: "#9aa5a0",
                                    fontSize: "14px",
                                }}
                            >
                                {product.collections.length > 0
                                    ? product.collections
                                        .map((link) => link.collection.name)
                                        .join(", ")
                                    : "No Collection"}
                                {" • "}
                                {product.material || "Unknown Material"}
                                {" • "}
                                {product.variants.length} Variant
                                {product.variants.length !== 1 && "s"}
                            </div>
                        </div>

                        <div
                            style={{
                                color: "#d9b56d",
                                fontWeight: "700",
                            }}
                        >
                            Edit →
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}