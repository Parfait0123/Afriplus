import { Suspense } from "react";
import ConfirmationContent from "./ConfirmationContent";

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div style={{ background: "#F5F3EE", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="aa-loader-ring" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}