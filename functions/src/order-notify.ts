import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { broadcastAlert } from "./notifications";

/**
 * Triggers when a new order is created in Firestore.
 * Sends push notification to users with orders preference enabled.
 */
export const notifyNewOrder = onDocumentCreated("orders/{orderId}", async (event) => {
  const order = event.data?.data();
  if (!order) return;

  const customerName = order.customer_name || 'Customer';
  const total = order.total || 0;
  const itemCount = order.items?.length || 0;
  const source = order.source || 'online';
  const occasion = order.occasion || '';
  const deliveryMethod = order.delivery_method || 'ship';

  let body = `$${total.toFixed(2)} from ${customerName}`;
  if (itemCount > 0) body += ` (${itemCount} item${itemCount > 1 ? 's' : ''})`;
  if (occasion) body += ` · ${occasion}`;
  if (deliveryMethod === 'pickup') body += ' · Farm Pickup';
  else if (deliveryMethod === 'local_delivery') body += ' · Local Delivery';

  // Only notify for online orders (manual/market are already in-person)
  if (source === 'online') {
    await broadcastAlert("New Order!", body, false);
  }
});
