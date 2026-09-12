import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { easypost } from "@/lib/easypost";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  try {
    const session = await auth();

    const sessionEmail =
      session?.user?.email?.toLowerCase();

    const adminEmail =
      process.env.ADMIN_EMAIL?.toLowerCase();

    if (
      !sessionEmail ||
      !adminEmail ||
      sessionEmail !== adminEmail
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const body = await request.json();

    const weightOz = Number(body?.weightOz);
    const length = Number(body?.length);
    const width = Number(body?.width);
    const height = Number(body?.height);

    if (
      !Number.isFinite(weightOz) ||
      weightOz <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid package weight greater than 0 ounces.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(length) ||
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      length <= 0 ||
      width <= 0 ||
      height <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Enter valid package dimensions greater than 0 inches.",
        },
        { status: 400 }
      );
    }

    const order =
      await prisma.order.findUnique({
        where: {
          id,
        },

        select: {
          id: true,

          customerName: true,
          customerPhone: true,

          shippingName: true,
          shippingAddress1: true,
          shippingAddress2: true,
          shippingCity: true,
          shippingState: true,
          shippingPostal: true,
          shippingCountry: true,
        },
      });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    if (
      !order.shippingAddress1 ||
      !order.shippingCity ||
      !order.shippingState ||
      !order.shippingPostal
    ) {
      return NextResponse.json(
        {
          error:
            "This order does not have a complete shipping address.",
        },
        { status: 400 }
      );
    }

    const destinationCountry =
      String(
        order.shippingCountry || "US"
      )
        .trim()
        .toUpperCase();

    if (
      destinationCountry !== "US" &&
      destinationCountry !== "USA"
    ) {
      return NextResponse.json(
        {
          error:
            "Website shipping is currently limited to U.S. addresses.",
        },
        { status: 400 }
      );
    }

    const requiredFromFields = [
      process.env.EASYPOST_FROM_STREET1,
      process.env.EASYPOST_FROM_CITY,
      process.env.EASYPOST_FROM_STATE,
      process.env.EASYPOST_FROM_ZIP,
    ];

    if (
      requiredFromFields.some(
        (value) => !value
      )
    ) {
      return NextResponse.json(
        {
          error:
            "The EasyPost return address is not fully configured.",
        },
        { status: 500 }
      );
    }

    const shipment =
      await easypost.Shipment.create({
        from_address: {
          company:
            process.env.EASYPOST_FROM_NAME ||
            "Timeless Mineral Creations",

          street1:
            process.env.EASYPOST_FROM_STREET1,

          street2:
            process.env.EASYPOST_FROM_STREET2 ||
            undefined,

          city:
            process.env.EASYPOST_FROM_CITY,

          state:
            process.env.EASYPOST_FROM_STATE,

          zip:
            process.env.EASYPOST_FROM_ZIP,

          country:
            process.env.EASYPOST_FROM_COUNTRY ||
            "US",

          phone:
            process.env.EASYPOST_FROM_PHONE ||
            undefined,
        },

        to_address: {
          name:
            order.shippingName ||
            order.customerName ||
            "Customer",

          street1:
            order.shippingAddress1,

          street2:
            order.shippingAddress2 ||
            undefined,

          city:
            order.shippingCity,

          state:
            order.shippingState,

          zip:
            order.shippingPostal,

          country: "US",

          phone:
            order.customerPhone ||
            undefined,
        },

        parcel: {
          length,
          width,
          height,
          weight: weightOz,
        },

        options: {
          label_size: "4x6",
          label_format: "PDF",
        },

        reference:
          order.id,
      });

    const shipmentMode =
      shipment.mode === "production"
        ? "production"
        : "test";

    const groundAdvantageRates = (
      shipment.rates || []
    )
      .filter(
        (rate) =>
          rate.carrier === "USPS" &&
          rate.service ===
            "GroundAdvantage"
      )
      .sort(
        (a, b) =>
          Number(a.rate) -
          Number(b.rate)
      )
      .map((rate) => ({
        id:
          rate.id,

        carrier:
          rate.carrier,

        service:
          rate.service,

        rate:
          rate.rate,

        currency:
          rate.currency,

        deliveryDays:
          rate.delivery_days ??
          rate.est_delivery_days ??
          null,
      }));

    if (
      groundAdvantageRates.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "USPS Ground Advantage did not return a rate for this package.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      shipmentId:
        shipment.id,

      mode:
        shipmentMode,

      testMode:
        shipmentMode === "test",

      weightOz,

      dimensions: {
        length,
        width,
        height,
      },

      label: {
        size: "4x6",
        format: "PDF",
      },

      rates:
        groundAdvantageRates,
    });
  } catch (error) {
    console.error(
      "EasyPost shipping rate error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to retrieve shipping rates.",
      },
      { status: 500 }
    );
  }
}