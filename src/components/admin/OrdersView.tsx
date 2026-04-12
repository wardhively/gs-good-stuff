"use client";

import { useState } from "react";
import { ChevronLeft, Package, User, Hash, AlertTriangle, ArrowRight, Printer, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useOrders } from "@/hooks/useOrders";
import type { Order } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

export default function OrdersView() {
  const { orders, loading, saveOrder } = useOrders();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all');

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-bloom';
      case 'packing': return 'bg-petal';
      case 'shipped': return 'bg-creek';
      case 'fulfilled': return 'bg-leaf';
      case 'refunded': return 'bg-frost';
      default: return 'bg-stone-c';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const advanceOrder = async (order: Order, nextStatus: Order['status']) => {
    const updates: Partial<Order> = { status: nextStatus };
    if (nextStatus === 'shipped') {
      const tracking = window.prompt("Enter Tracking Number:");
      if (!tracking) return; // cancel
      updates.tracking_number = tracking;
      updates.shipped_at = Timestamp.now();
    }
    await saveOrder(order.id, updates);
  };

  if (loading) return <div className="p-8 text-center text-stone-c font-bold animate-pulse no-print">Loading active orders...</div>;

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  return (
    <div className="min-h-screen bg-cream relative pb-24">
      {/* NO-PRINT: STANDARD UI */}
      <div className="no-print">
        <div className="sticky top-0 bg-cream/95 backdrop-blur z-40 px-4 pt-6 pb-4 border-b border-fence shadow-sm">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <Link href="/more" className="p-2 -ml-2 text-stone-c hover:text-root transition-colors">
                 <ChevronLeft className="w-6 h-6" />
               </Link>
               <h1 className="font-bitter text-3xl font-bold text-root">Orders</h1>
             </div>
             <span className="text-sm font-bold bg-white px-3 py-1 rounded-full border border-fence-lt shadow-sm">
               {orders.length} Total
             </span>
          </div>
          
          <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
             {['all', 'pending', 'packing', 'shipped', 'fulfilled', 'refunded'].map(status => (
                <button 
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                    filterStatus === status ? 'bg-root text-white' : 'bg-white text-stone-c border border-fence hover:border-soil'
                  }`}
                >
                  {status}
                </button>
             ))}
          </div>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-stone-c font-dm-sans">No orders mapping to this filter constraint.</div>
          ) : filteredOrders.map(order => {
            const isExpanded = expandedId === order.id;
            const isRefunded = order.status === 'refunded';

            return (
              <div key={order.id} className={`bg-white rounded-xl border border-fence-lt shadow-sm transition-all overflow-hidden ${isExpanded ? 'ring-2 ring-soil border-transparent' : 'hover:border-soil'}`}>
                
                {/* Header row (always visible) */}
                <div 
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer" 
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                   <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${getStatusColor(order.status)}`}>
                            {order.status}
                         </span>
                         <span className="text-[10px] text-stone-c font-dm-sans font-bold uppercase flex items-center gap-1">
                            <Hash className="w-3 h-3" /> {order.stripe_session_id?.substring(8, 16) || order.source || 'manual'}
                         </span>
                      </div>
                      <h3 className="font-bold text-root text-lg leading-tight flex items-center gap-2">
                        {order.customer_name}
                      </h3>
                      <p className="text-xs text-stone-c font-dm-sans mt-0.5">
                        {order.created_at ? new Date(order.created_at.seconds * 1000).toLocaleDateString() : 'Unknown Date'}
                      </p>
                   </div>
                   
                   <div className="flex flex-row md:flex-col items-center md:items-end justify-between">
                      <p className="font-bitter text-xl font-bold text-root">${order.total.toFixed(2)}</p>
                      <p className="text-xs text-stone-c font-dm-sans font-bold">{order.items.reduce((sum, i) => sum + i.quantity, 0)} items</p>
                   </div>
                </div>

                {/* EXPANDED VIEW */}
                {isExpanded && (
                  <div className="border-t border-fence-lt bg-linen p-4 md:p-6 animate-in fade-in slide-in-from-top-2">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        
                        {/* Customer Info */}
                        <div className="space-y-4">
                           <div>
                              <h4 className="text-[10px] uppercase font-bold text-stone-c tracking-widest flex items-center gap-1 mb-2"><User className="w-3 h-3"/> Customer</h4>
                              <p className="font-bold text-root">{order.customer_name}</p>
                              {order.customer_email && <p className="text-sm text-stone-c">{order.customer_email}</p>}
                              {order.source && <p className="text-[10px] uppercase font-bold text-creek mt-1">{order.source}</p>}
                           </div>

                           {order.shipping_address && (
                           <div>
                              <h4 className="text-[10px] uppercase font-bold text-stone-c tracking-widest flex items-center gap-1 mb-2"><Package className="w-3 h-3"/> Shipping Address</h4>
                              <p className="font-bold text-root">{order.shipping_address.line1}</p>
                              {order.shipping_address.line2 && <p className="font-bold text-root">{order.shipping_address.line2}</p>}
                              <p className="font-bold text-root">{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</p>
                           </div>
                           )}

                           {order.tracking_number && (
                              <div className="bg-white p-3 rounded-lg border border-fence inline-block">
                                 <p className="text-[10px] uppercase font-bold text-creek tracking-widest mb-1">Tracking Number</p>
                                 <p className="font-bold text-root">{order.tracking_number}</p>
                              </div>
                           )}
                        </div>

                        {/* Order Items */}
                        <div>
                           <h4 className="text-[10px] uppercase font-bold text-stone-c tracking-widest mb-3">Line Items</h4>
                           <div className="bg-white border border-fence shadow-sm rounded-xl overflow-hidden">
                              <table className="w-full text-left text-sm font-dm-sans">
                                <thead className="bg-clay/30 border-b border-fence text-stone-c text-xs uppercase">
                                  <tr>
                                    <th className="px-4 py-2 font-bold">Item</th>
                                    <th className="px-4 py-2 font-bold text-center">Qty</th>
                                    <th className="px-4 py-2 font-bold text-right">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.items.map((item, i) => (
                                    <tr key={i} className="border-b border-fence last:border-0">
                                      <td className="px-4 py-3 font-bold text-root">{item.name}</td>
                                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                                      <td className="px-4 py-3 text-right">${(item.quantity * item.unit_price).toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div className="bg-clay/10 p-4 border-t border-fence space-y-2 text-sm">
                                 <div className="flex justify-between text-stone-c"><span>Subtotal:</span><span>${order.subtotal.toFixed(2)}</span></div>
                                 <div className="flex justify-between text-stone-c"><span>Shipping:</span><span>${order.shipping_cost.toFixed(2)}</span></div>
                                 {order.discount && order.discount > 0 && <div className="flex justify-between text-petal font-bold"><span>Discount:</span><span>-${order.discount.toFixed(2)}</span></div>}
                                 <div className="flex justify-between font-bold text-root text-lg pt-2 border-t border-fence-lt mt-2">
                                    <span>Total:</span><span>${order.total.toFixed(2)}</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                     </div>
                     
                     {/* Workflow Actions */}
                     <div className="flex flex-wrap gap-3 items-center justify-between border-t border-fence-lt pt-6 mt-2">
                        
                        <div className="flex gap-2">
                           {order.status === 'pending' && (
                              <button onClick={() => advanceOrder(order, 'packing')} className="px-6 py-2.5 bg-petal text-white font-bold rounded-lg hover:bg-petal-dk transition-colors shadow-sm text-sm">
                                Move to Packing
                              </button>
                           )}
                           {order.status === 'packing' && (
                              <button onClick={() => advanceOrder(order, 'shipped')} className="px-6 py-2.5 bg-creek text-white font-bold rounded-lg hover:bg-root transition-colors shadow-sm text-sm">
                                Mark as Shipped
                              </button>
                           )}
                           {order.status === 'shipped' && (
                              <button onClick={() => advanceOrder(order, 'fulfilled')} className="px-6 py-2.5 bg-leaf text-white font-bold rounded-lg hover:bg-leaf-dk transition-colors shadow-sm text-sm">
                                Mark Fulfilled
                              </button>
                           )}
                        </div>

                        <div className="flex gap-2 ml-auto">
                           {!isRefunded && (
                              <button onClick={() => advanceOrder(order, 'refunded')} className="px-4 py-2.5 bg-white border border-frost text-frost font-bold rounded-lg hover:bg-frost/10 transition-colors shadow-sm text-sm flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4"/> Refund
                              </button>
                           )}
                           
                           {/* Print slip trigger */}
                           <button onClick={handlePrint} className="px-6 py-2.5 bg-soil text-white font-bold rounded-lg hover:bg-root transition-colors shadow-sm text-sm flex items-center gap-2">
                             <Printer className="w-4 h-4"/> Packing Slip
                           </button>
                        </div>
                     </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* PRINT-ONLY UI: PACKING SLIP */}
      {/* We uniquely render the expanded slip via CSS to strictly control the mapping format bypassing web layers natively. */}
      {expandedId && (
         <div className="hidden print-only p-8 bg-white h-screen w-full">
            {orders.filter(o => o.id === expandedId).map(order => (
               <div key={order.id} className="max-w-3xl mx-auto font-dm-sans text-black">
                  
                  {/* Header */}
                  <div className="flex justify-between items-end border-b-2 border-black pb-6 mb-8">
                     <div>
                        <h1 className="font-bitter text-4xl font-bold mb-1">G&S Good Stuff</h1>
                        <p className="text-sm">Farm Fresh Dahlia Tubers · Addison, NY</p>
                     </div>
                     <div className="text-right">
                        <h2 className="text-2xl font-bold uppercase tracking-widest mb-1">Packing Slip</h2>
                        <p className="text-sm">Order ID: {order.stripe_session_id?.substring(8, 16) || order.id?.substring(0, 8) || 'N/A'}</p>
                        <p className="text-sm">Date: {order.created_at ? new Date(order.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                     </div>
                  </div>

                  {/* Customer Block */}
                  <div className="mb-12">
                     <h3 className="text-sm font-bold uppercase tracking-widest mb-2 border-b border-gray-300 pb-1 inline-block">Ship To:</h3>
                     <p className="text-xl font-bold mt-2">{order.customer_name}</p>
                     {order.shipping_address && (
                       <>
                         <p className="text-lg">{order.shipping_address.line1}</p>
                         {order.shipping_address.line2 && <p className="text-lg">{order.shipping_address.line2}</p>}
                         <p className="text-lg">{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</p>
                       </>
                     )}
                     {order.customer_email && <p className="text-md mt-2 text-gray-600">{order.customer_email}</p>}
                  </div>

                  {/* Items Table */}
                  <table className="w-full text-left border-collapse mb-12">
                     <thead>
                        <tr className="border-b-2 border-black">
                           <th className="py-3 font-bold uppercase tracking-widest w-2/3">Variety Overview</th>
                           <th className="py-3 font-bold uppercase tracking-widest text-center w-1/3">Quantity to Pack</th>
                        </tr>
                     </thead>
                     <tbody>
                        {order.items.map((item, i) => (
                           <tr key={i} className="border-b border-gray-300">
                              <td className="py-4 text-lg">{item.name}</td>
                              <td className="py-4 text-2xl font-bold text-center">
                                 <span className="border-2 border-black px-4 py-1 rounded-md">{item.quantity}</span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>

                  {/* Footer */}
                  <div className="text-center mt-24 pt-8 border-t border-gray-300">
                     <p className="text-xl font-bitter font-bold mb-2">Thank you for your order!</p>
                     <p className="text-sm">We hope these tubers provide immense beauty to your fields. Tag us on Instagram when they bloom!</p>
                  </div>

               </div>
            ))}
         </div>
      )}
    </div>
  );
}
