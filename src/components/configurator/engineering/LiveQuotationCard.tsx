"use client";

import React, { useState } from "react";
import { ProductSystemType, WardrobeShapeType } from "@/hooks/useConfiguratorEngineering";
import {
  PoleState,
  FlexState,
  PoleDesignResult,
  PoleLShapeDesign,
  PolePriceResult,
  PoleLShapePriceResult,
  AddonPriceResult,
  FlexDesignResult,
  FlexPriceResult,
} from "@/lib/engineering/types";
import { Copy, Check, MessageSquare, AlertCircle } from "lucide-react";

interface LiveQuotationCardProps {
  productSystem: ProductSystemType;
  shape: WardrobeShapeType;
  poleState: PoleState;
  poleDesign?: PoleDesignResult;
  poleLShapeDesign?: PoleLShapeDesign;
  poleStraightPrice?: PolePriceResult;
  poleLSPrice?: PoleLShapePriceResult;
  poleAddons?: AddonPriceResult;
  flexState: FlexState;
  flexDesign?: FlexDesignResult;
  flexPrice?: FlexPriceResult;
  quotationText: string;
}

export function LiveQuotationCard({
  productSystem,
  shape,
  poleState,
  poleDesign,
  poleLShapeDesign,
  poleStraightPrice,
  poleLSPrice,
  poleAddons,
  flexState,
  flexDesign,
  flexPrice,
  quotationText,
}: LiveQuotationCardProps) {
  const [copied, setCopied] = useState(false);

  const isPole = productSystem === "pole";

  // Calculate grand total
  let grandTotal = 0;
  let billedFootage = 0;
  let baseRate = 0;
  let topUp = 0;
  let lineItems: { label: string; amount: number }[] = [];
  let warnings: string[] = [];

  if (isPole) {
    if (shape === "lshape" && poleLSPrice) {
      billedFootage = poleLSPrice.feet;
      baseRate = poleLSPrice.baseRate;
      topUp = poleLSPrice.topUp;
      grandTotal = (poleLSPrice.total || 0) + (poleAddons?.total || 0);

      if (poleLSPrice.baseCost) {
        lineItems.push({
          label: `Base wardrobe structure (${billedFootage.toFixed(1)}ft × $${poleLSPrice.rate})`,
          amount: poleLSPrice.baseCost,
        });
      }
      poleLSPrice.hingeLines.forEach((h) => {
        lineItems.push({ label: h, amount: 0 });
      });
      if (poleAddons) {
        poleAddons.lines.forEach((l) => {
          lineItems.push({ label: l.label, amount: l.cost });
        });
      }
    } else if (poleStraightPrice) {
      billedFootage = poleStraightPrice.feet;
      baseRate = poleStraightPrice.baseRate;
      topUp = poleStraightPrice.topUp;
      grandTotal = (poleStraightPrice.total || 0) + (poleAddons?.total || 0);

      if (poleStraightPrice.baseCost) {
        lineItems.push({
          label: `Base wardrobe structure (${billedFootage.toFixed(1)}ft × $${poleStraightPrice.rate})`,
          amount: poleStraightPrice.baseCost,
        });
      }
      poleStraightPrice.finishLines.forEach((f) => {
        lineItems.push({ label: f, amount: 0 });
      });
      poleStraightPrice.hingeLines.forEach((h) => {
        lineItems.push({ label: h, amount: 0 });
      });
      if (poleAddons) {
        poleAddons.lines.forEach((l) => {
          lineItems.push({ label: l.label, amount: l.cost });
        });
      }
    }
  } else if (flexPrice) {
    billedFootage = flexPrice.feet;
    grandTotal = flexPrice.total;
    lineItems = flexPrice.lines.map((l) => ({ label: l.label || l.desc || "Item", amount: l.amt }));
    warnings = flexPrice.warnings || [];
  }

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(quotationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-[#E6E1D8] shadow-sm space-y-3.5">
      {/* Title & Badge */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E6E1D8]">
        <div>
          <span className="text-[10px] font-mono tracking-wider uppercase text-[#A88C69] block">
            Official Quotation Engine
          </span>
          <span className="text-[14px] font-bold text-[#242424]">
            {isPole ? "HausPole System" : "HausFlex System"} (
            {shape === "straight" ? "Straight" : "L-Shaped"})
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-[#777] block">Billed Length</span>
          <span className="text-[13px] font-mono font-bold text-[#242424]">
            {billedFootage.toFixed(1)} ft
          </span>
        </div>
      </div>

      {/* Warnings if any */}
      {warnings.length > 0 && (
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
          {warnings.map((w, idx) => (
            <div key={`warn-${idx}`} className="flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Line Items Breakdown */}
      <div className="space-y-1.5 text-[11px]">
        {lineItems.map((item, idx) => (
          <div key={`line-${idx}`} className="flex justify-between items-baseline gap-2">
            <span className="text-[#555] leading-tight">{item.label}</span>
            {item.amount > 0 ? (
              <span className="font-mono font-bold text-[#242424] shrink-0">
                ${item.amount.toFixed(2)}
              </span>
            ) : (
              <span className="text-[10px] font-mono text-[#888] shrink-0">incl.</span>
            )}
          </div>
        ))}
      </div>

      {/* Grand Total Display */}
      <div className="pt-2.5 border-t border-[#E6E1D8] flex items-baseline justify-between">
        <div>
          <span className="text-[11px] font-mono text-[#777] uppercase block">
            Total Estimated Price (SGD)
          </span>
          <span className="text-[9px] text-[#999]">No hidden fees · Free Singapore delivery</span>
        </div>
        <div className="text-right">
          <span className="text-[22px] font-mono font-bold text-[#242424] tracking-tight">
            ${grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Action Button: Copy WhatsApp Quotation */}
      <button
        onClick={handleCopyQuote}
        className={`w-full py-2.5 px-4 rounded-xl font-medium text-[12px] flex items-center justify-center gap-2 transition-all shadow-sm ${
          copied
            ? "bg-emerald-600 text-white"
            : "bg-[#25D366] hover:bg-[#20BE5B] text-white"
        }`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-white" />
            <span>Quotation Copied to Clipboard!</span>
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4 fill-white" />
            <span className="font-semibold">Copy WhatsApp Quotation</span>
          </>
        )}
      </button>
    </div>
  );
}
