"use client";

import { useState } from "react";

import ProductionProgressCard from "./ProductionProgressCard";
import ProductionChecklist from "./ProductionChecklist";

export default function ProductionWorkspace({
  orderId,
  initialValues,
}) {
  const [values, setValues] = useState(initialValues);

  return (
    <>
      <ProductionProgressCard
        initialValues={values}
      />

      <ProductionChecklist
        orderId={orderId}
        initialValues={values}
        onChange={setValues}
      />
    </>
  );
}