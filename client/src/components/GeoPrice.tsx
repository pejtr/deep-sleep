import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

interface GeoPriceProps {
  productId?: "main" | "oto1" | "oto2";
  showCurrency?: boolean;
  className?: string;
}

export default function GeoPrice({
  productId = "main",
  showCurrency = false,
  className = "",
}: GeoPriceProps) {
  const [price, setPrice] = useState("$5");
  const [currency, setCurrency] = useState("USD");

  // Fetch geo-pricing
  const { data: geoPricing } = trpc.pricing.getForGeo.useQuery({});

  useEffect(() => {
    if (geoPricing) {
      const productPrice = geoPricing.prices[productId];
      setPrice(productPrice.geoAdjustedDisplay);
      setCurrency(geoPricing.currency);
    }
  }, [geoPricing, productId]);

  return (
    <span className={className}>
      {price}
      {showCurrency && currency !== "USD" && <span className="text-xs ml-1">({currency})</span>}
    </span>
  );
}
