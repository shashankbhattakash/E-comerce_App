import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { capturePayment } from "@/store/shop/order-slice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

function PaypalReturnPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const paymentId = params.get("paymentId");
  const payerId = params.get("PayerID");

  useEffect(() => {
    if (paymentId && payerId) {
      const orderId = localStorage.getItem("currentOrderId"); // ✅ unified storage
      if (!orderId) {
        alert("⚠️ Order not found. Please try again.");
        navigate("/shop/cart");
        return;
      }

      dispatch(capturePayment({ paymentId, payerId, orderId }))
        .unwrap()
        .then((data) => {
          if (data?.success) {
            localStorage.removeItem("currentOrderId");
            navigate("/shop/payment-success");
          } else {
            alert("❌ Payment failed. Please try again.");
            navigate("/shop/cart");
          }
        })
        .catch((err) => {
          console.error("Capture error:", err);
          alert("❌ Something went wrong while confirming payment.");
          navigate("/shop/cart");
        });
    }
  }, [paymentId, payerId, dispatch, navigate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Payment... Please wait!</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default PaypalReturnPage;
