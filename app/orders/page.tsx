"use client";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  async function load() {
    const res = await fetch('/api/orders');
    if (res.ok) setOrders(await res.json());
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1>Your Orders</h1>
      {orders.length === 0 ? <p>No orders yet.</p> : (
        <ul>
          {orders.map(o => (
            <li key={o.id}>Order {o.id} — ₹{o.amount/100} — {o.status}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
