import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();

  const invoice = useMemo(() => {
    const fromState = location?.state?.invoice;
    if (fromState) return fromState;

    const stored = sessionStorage.getItem("latestInvoice");
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }, [location.state]);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-latte px-6 md:px-12 py-12">
      <div className="bg-beige p-6 md:p-10 rounded-2xl max-w-4xl mx-auto shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <img
            src="/images/digitalWardrobe.png"
            alt="Digital Wardrobe"
            className="h-10 w-auto"
          />
          <p className="text-xl font-serif text-cocoa">Digital Wardrobe</p>
        </div>
        <h1 className="text-4xl font-serif text-cocoa mb-2">Order Confirmed</h1>
        <p className="text-cocoa mb-6 leading-relaxed">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        {invoice ? (
          <section className="rounded-xl border border-cocoa/20 bg-latte p-5 md:p-6 mb-6">
            <div className="flex flex-wrap gap-4 justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-cocoa/60">Invoice Number</p>
                <p className="text-cocoa font-medium">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-cocoa/60">Order ID</p>
                <p className="text-cocoa font-medium break-all">{invoice.orderId || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-cocoa/60">Date</p>
                <p className="text-cocoa font-medium">{formatDate(invoice.createdAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-cocoa/60">Billed To</p>
                <p className="text-cocoa">{invoice.customerName || "-"}</p>
                {invoice.customerEmail && (
                  <p className="text-cocoa/80 text-sm">{invoice.customerEmail}</p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-cocoa/60">Payment Method</p>
                <p className="text-cocoa capitalize">{invoice.paymentMethod || "-"}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-cocoa border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-cocoa/70">
                    <th className="text-left font-medium">Item</th>
                    <th className="text-left font-medium">Size</th>
                    <th className="text-left font-medium">Qty</th>
                    <th className="text-right font-medium">Price</th>
                    <th className="text-right font-medium">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.items || []).map((item, index) => (
                    <tr key={`${item.productId || item.name}-${index}`} className="bg-beige">
                      <td className="px-2 py-2 rounded-l-md">{item.name}</td>
                      <td className="px-2 py-2">{item.size || "-"}</td>
                      <td className="px-2 py-2">{Number(item.quantity || 1)}</td>
                      <td className="px-2 py-2 text-right">${Number(item.price || 0).toFixed(2)}</td>
                      <td className="px-2 py-2 text-right rounded-r-md">
                        ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-cocoa/15 flex justify-end">
              <p className="text-cocoa font-semibold">
                Total: ${Number(invoice.totalAmount || 0).toFixed(2)}
              </p>
            </div>
          </section>
        ) : (
          <p className="text-cocoa/80 mb-6">
            Invoice preview is not available for this order.
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => window.print()}
            className="border border-mocha text-mocha px-6 py-3 rounded-md text-sm hover:bg-mocha hover:text-latte transition"
          >
            Print Invoice
          </button>
          <button
            onClick={() => navigate("/shop")}
            className="bg-mocha text-latte px-8 py-3 rounded-md text-sm hover:opacity-90 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
