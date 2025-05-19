import { Suspense } from "react";
import PaymentSuccessClientContent from "./PaymentSuccessClientContent";

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-12 px-4 text-center min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
          <p>Loading payment details...</p>
        </div>
      }
    >
      <PaymentSuccessClientContent />
    </Suspense>
  );
}
