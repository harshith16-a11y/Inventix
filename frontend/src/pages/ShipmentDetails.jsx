import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { shipmentService } from '../services/shipmentService';
import ShipmentTimeline from '../components/ShipmentTimeline';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft,
  Truck,
  Flame,
  Clock,
  Layers,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function ShipmentDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShipment();
  }, [id]);

  const fetchShipment = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await shipmentService.getById(id);
      setData(res);
    } catch (err) {
      setError('Shipment not found or unauthorized.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving shipment details..." />;
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Shipment Not Found</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <Link to="/my-shipments" className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold inline-block">
          Back to Shipments
        </Link>
      </div>
    );
  }

  const { shipment, queuePosition } = data;
  const isPriority = shipment.type === 'PRIORITY';
  const isWaiting = shipment.status === 'WAITING';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <Link
        to="/my-shipments"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Shipments
      </Link>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-8">
        
        {/* Header Information */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-base font-extrabold px-3 py-1 bg-slate-100 rounded-xl text-slate-900 border border-slate-200">
                {shipment.shipmentId}
              </span>
              {isPriority ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  Priority Dispatch ({shipment.priority})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  <Truck className="w-3.5 h-3.5 text-sky-500" />
                  Standard Normal Dispatch (FIFO)
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Placed on {new Date(shipment.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 font-medium">Total Shipment Value</span>
            <p className="text-2xl font-extrabold text-slate-900">₹{Number(shipment.totalValue).toFixed(2)}</p>
          </div>
        </div>

        {/* Real Queue Position Banner if Waiting */}
        {isWaiting && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white text-sky-600 shadow-xs border border-sky-100">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {isPriority
                    ? `Priority Queue: Urgency Level ${shipment.priority}`
                    : `Normal FIFO Queue: Position #${queuePosition > 0 ? queuePosition : 1}`}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {isPriority
                    ? 'Handled in PriorityShipmentQueue binary heap before lower urgency orders.'
                    : `You are currently #${queuePosition > 0 ? queuePosition : 1} in the normal shipment queue.`}
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-sky-600 text-white shadow-2xs">
              WAITING
            </span>
          </div>
        )}

        {/* 5-Step Visual Timeline */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Progression</h3>
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            <ShipmentTimeline status={shipment.status} />
          </div>
        </div>

        {/* Shipment Items Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Manifest Items</h3>
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Product ID</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shipment.items && shipment.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{item.productId}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.productName}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-700">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-slate-600">₹{Number(item.unitPrice).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">₹{Number(item.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
