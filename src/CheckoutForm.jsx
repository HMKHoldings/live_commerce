import React, { useState, useRef } from "react";
import { api } from "./storeApi";
import { useStore } from "./StoreContext";
export default function CheckoutForm({ cart, onComplete }) {
  const requestId = useRef(crypto.randomUUID());
  const { connected, refresh } = useStore();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [order, setOrder] = useState(null);
  if (!connected) return <p>주문 서버가 연결되면 주문을 접수할 수 있습니다.</p>;
  if (order)
    return (
      <div className="help-box" role="status">
        <b>주문이 접수되었습니다.</b>
        <p>주문번호: {order.id}</p>
        <p>미결제 주문입니다. 결제는 진행되지 않았습니다.</p>
      </div>
    );
  return (
    <form
      className="login-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        const customer = Object.fromEntries(new FormData(event.currentTarget));
        try {
          const result = await api("/orders", {
            method: "POST",
            body: {
              requestId: requestId.current,
              customer,
              items: Object.entries(cart)
                .filter(([, quantity]) => quantity > 0)
                .map(([productId, quantity]) => ({ productId, quantity })),
            },
          });
          setOrder(result);
          await refresh();
          onComplete(result);
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3>주문자 정보</h3>
      <label>
        이름
        <input name="name" required maxLength={100} autoComplete="name" />
      </label>
      <label>
        연락처
        <input
          name="phone"
          type="tel"
          required
          maxLength={50}
          autoComplete="tel"
        />
      </label>
      <label>
        배송 주소
        <input
          name="address"
          required
          maxLength={299}
          autoComplete="street-address"
        />
      </label>
      <p>
        주문 접수 시 입력한 정보가 판매자에게 전달됩니다. 온라인 결제는 지원하지
        않습니다.
      </p>
      {error && <p role="alert">{error}</p>}
      <button className="primary" disabled={busy}>
        {busy ? "접수 중…" : "미결제 주문 접수"}
      </button>
    </form>
  );
}
