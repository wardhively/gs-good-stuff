"use client";

import { useState, useRef, useEffect } from 'react';
import { X, Calendar, Database, Hash, Leaf, DollarSign, Save, ArrowLeft, Camera, ImageIcon } from 'lucide-react';
import type { Variety } from '@/lib/types';
import { STATUS_COLORS, StatusEnum } from '@/lib/constants';
import { advanceVarietyStatus, getNextStatus } from '@/lib/inventory-utils';
import { useZones } from '@/hooks/useZones';
import { useInventory } from '@/hooks/useInventory';
import { useOrders } from '@/hooks/useOrders';
import { cacheFileOffline, syncPendingFiles } from '@/lib/storage-sync';
import { get } from 'idb-keyval';
import Checklist from '@/components/admin/Checklist';
import { VARIETY_CHECKLIST_DEFAULTS } from '@/lib/constants';
import type { ChecklistItem } from '@/lib/types';

interface VarietyDetailSheetProps {
  variety: Variety;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Variety>) => Promise<void>;
}

export default function VarietyDetailSheet({ variety, onClose, onSave }: VarietyDetailSheetProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [splitQty, setSplitQty] = useState(1);
  const [splitAction, setSplitAction] = useState<'sell' | 'split'>('sell');
  const [saleSource, setSaleSource] = useState<'manual' | 'market' | 'wholesale'>('manual');
  const [customerName, setCustomerName] = useState('');
  const { zones } = useZones();
  const { createVariety } = useInventory();
  const { createOrder } = useOrders();

  // Edit form state
  const [name, setName] = useState(variety.name);
  const [count, setCount] = useState(variety.count);
  const [price, setPrice] = useState(variety.price || 0);
  const [grade, setGrade] = useState(variety.grade || '');
  const [bloomForm, setBloomForm] = useState(variety.bloom_form || '');
  const [bloomSize, setBloomSize] = useState(variety.bloom_size || '');
  const [height, setHeight] = useState(variety.height || '');
  const [season, setSeason] = useState(variety.season || '');
  const [notes, setNotes] = useState(variety.notes || '');
  const [zoneId, setZoneId] = useState(variety.zone_id || '');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPhotoUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const pendingUrl = await cacheFileOffline(variety.id, file, 'variety');
        newUrls.push(pendingUrl);
      }
      const existingUrls = variety.photo_urls || [];
      await onSave(variety.id, { photo_urls: [...existingUrls, ...newUrls] });
      syncPendingFiles();
    } finally {
      setPhotoUploading(false);
    }
  };

  const badgeColor = STATUS_COLORS[variety.status] || '#8B7D6B';
  const nextStatus = getNextStatus(variety.status);

  const handleAdvance = async () => {
    if (!nextStatus) return;
    const updated = advanceVarietyStatus(variety, nextStatus, "Advanced via Detail view");
    await onSave(variety.id, updated);
    onClose();
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await onSave(variety.id, {
        name, count, price, grade: grade as any, bloom_form: bloomForm,
        bloom_size: bloomSize, height, season, notes, zone_id: zoneId,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col justify-end">
      <div className="absolute inset-0 bg-root/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-linen rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.2)] max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-linen/95 backdrop-blur z-10 border-b border-fence px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="font-bitter text-2xl font-bold text-root">
              {editing ? 'Edit Variety' : variety.name}
            </h2>
            <div className="flex gap-2 items-center mt-1">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                style={{ backgroundColor: badgeColor }}
              >
                {variety.status}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-clay rounded-full text-stone-c hover:text-root transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {editing ? (
            /* ─── Edit Mode ─── */
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Count</label>
                  <input type="number" value={count} onChange={e => setCount(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Price ($)</label>
                  <input type="number" step="0.01" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Bloom Form</label>
                  <input value={bloomForm} onChange={e => setBloomForm(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Bloom Size</label>
                  <input value={bloomSize} onChange={e => setBloomSize(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Height</label>
                  <select value={height} onChange={e => setHeight(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal">
                    <option value="">-</option>
                    <option>Short</option>
                    <option>Medium</option>
                    <option>Tall</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Season</label>
                  <select value={season} onChange={e => setSeason(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal">
                    <option value="">-</option>
                    <option>Early</option>
                    <option>Mid</option>
                    <option>Late</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Grade</label>
                  <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal">
                    <option value="">-</option>
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Zone</label>
                <select value={zoneId} onChange={e => setZoneId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal">
                  <option value="">Unassigned</option>
                  {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-fence bg-cream text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-3 rounded-xl font-bold border border-fence text-stone-c hover:bg-clay transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl font-bold bg-soil text-white hover:bg-root transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            /* ─── View Mode ─── */
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-cream p-4 rounded-xl border border-fence-lt flex flex-col items-center justify-center">
                  <Hash className="w-5 h-5 text-ash mb-1" />
                  <p className="text-[10px] uppercase text-stone-c tracking-wider font-bold">Count</p>
                  <p className="text-2xl font-bold text-root">{variety.count}</p>
                </div>
                <div className="bg-cream p-4 rounded-xl border border-fence-lt flex flex-col items-center justify-center">
                  <Database className="w-5 h-5 text-ash mb-1" />
                  <p className="text-[10px] uppercase text-stone-c tracking-wider font-bold">Zone</p>
                  <p className="text-lg font-bold text-root truncate w-full text-center">{zones.find(z => z.id === variety.zone_id)?.name || 'Unassigned'}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="font-bold text-root text-sm uppercase tracking-wider border-b border-fence pb-1">Details</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm font-dm-sans">
                  <div><strong className="text-stone-c block text-[10px] uppercase">Bloom Form</strong> {variety.bloom_form || '-'}</div>
                  <div><strong className="text-stone-c block text-[10px] uppercase">Bloom Size</strong> {variety.bloom_size || '-'}</div>
                  <div><strong className="text-stone-c block text-[10px] uppercase">Height</strong> {variety.height || '-'}</div>
                  <div><strong className="text-stone-c block text-[10px] uppercase">Season</strong> {variety.season || '-'}</div>
                  <div><strong className="text-stone-c block text-[10px] uppercase">Grade</strong> {variety.grade || '-'}</div>
                  <div>
                    <strong className="text-stone-c block text-[10px] uppercase flex items-center gap-1">
                      Price <DollarSign className="w-3 h-3" />
                    </strong>
                    {variety.price ? `$${variety.price.toFixed(2)}` : '-'}
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="font-bold text-root text-sm uppercase tracking-wider border-b border-fence pb-1">Milestones</h3>
                <div className="flex flex-col gap-2 font-dm-sans text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-c flex items-center gap-2"><Calendar className="w-4 h-4"/> Jugged</span>
                    <span className="font-bold">{variety.jugged_date ? new Date((variety.jugged_date as any).seconds * 1000).toLocaleDateString() : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-c flex items-center gap-2"><Leaf className="w-4 h-4"/> Planted</span>
                    <span className="font-bold">{variety.planted_date ? new Date((variety.planted_date as any).seconds * 1000).toLocaleDateString() : '-'}</span>
                  </div>
                  <div className="flex justify-between bg-bloom-lt/50 -mx-2 px-2 py-1 rounded">
                    <span className="text-bloom-dk font-bold flex items-center gap-2">Expected Dig</span>
                    <span className="font-bold text-bloom-dk">{variety.expected_dig_date ? new Date((variety.expected_dig_date as any).seconds * 1000).toLocaleDateString() : '-'}</span>
                  </div>
                </div>
              </div>

              {/* Checklist — tasks for current lifecycle stage */}
              <div className="space-y-2 mb-6">
                <h3 className="font-bold text-root text-sm uppercase tracking-wider border-b border-fence pb-1">Tasks</h3>
                <Checklist
                  items={variety.checklist || []}
                  presetItems={VARIETY_CHECKLIST_DEFAULTS[variety.status] || []}
                  onChange={(items: ChecklistItem[]) => onSave(variety.id, { checklist: items } as any)}
                />
              </div>

              {/* Photos */}
              <div className="space-y-2 mb-6">
                <h3 className="font-bold text-root text-sm uppercase tracking-wider border-b border-fence pb-1">Photos</h3>
                {variety.photo_urls && variety.photo_urls.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {variety.photo_urls.map((url, i) => (
                      <PhotoThumb key={i} url={url} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ash italic">No photos yet</p>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={e => handlePhotoUpload(e.target.files)} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoUploading}
                  className="flex items-center gap-2 px-3 py-2 border border-dashed border-fence rounded-lg text-sm text-stone-c hover:bg-clay transition-colors disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" /> {photoUploading ? 'Uploading...' : 'Add Photo'}
                </button>
              </div>

              {nextStatus && (
                <button
                  onClick={handleAdvance}
                  className="w-full py-4 rounded-xl font-bold bg-soil text-white hover:bg-root transition-colors shadow-lg flex justify-center items-center gap-2"
                >
                  Advance to {nextStatus}
                </button>
              )}

              {/* Publish / Unpublish from store */}
              {variety.status === 'listed' ? (
                <button
                  onClick={async () => { await onSave(variety.id, { status: StatusEnum.DIVIDED } as any); onClose(); }}
                  className="w-full py-3 mt-3 rounded-xl font-bold border border-frost-lt text-frost hover:bg-frost-lt transition-colors"
                >
                  Remove from Store
                </button>
              ) : variety.status === 'divided' ? (
                <button
                  onClick={async () => { await onSave(variety.id, { status: StatusEnum.LISTED } as any); onClose(); }}
                  className="w-full py-3 mt-3 rounded-xl font-bold bg-bloom text-white hover:bg-bloom/80 transition-colors"
                >
                  Publish to Store
                </button>
              ) : null}

              {/* Sell / Split */}
              {variety.count > 0 && (
                <div className="mt-3">
                  {!showSplit ? (
                    <button
                      onClick={() => setShowSplit(true)}
                      className="w-full py-3 rounded-xl font-bold bg-petal text-white hover:bg-petal/80 transition-colors"
                    >
                      Sell / Split Inventory
                    </button>
                  ) : (
                    <div className="bg-cream rounded-xl border border-fence-lt p-4 space-y-3">
                      {/* Action toggle */}
                      <div className="flex gap-2">
                        <button onClick={() => setSplitAction('sell')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${splitAction === 'sell' ? 'bg-soil text-white' : 'bg-clay text-stone-c'}`}>
                          Record Sale
                        </button>
                        <button onClick={() => setSplitAction('split')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${splitAction === 'split' ? 'bg-soil text-white' : 'bg-clay text-stone-c'}`}>
                          Split Record
                        </button>
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Quantity ({variety.count} available)</label>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setSplitQty(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-lg bg-clay text-root font-bold text-lg flex items-center justify-center active:scale-90">−</button>
                          <span className="text-2xl font-bold text-root w-12 text-center">{splitQty}</span>
                          <button onClick={() => setSplitQty(q => Math.min(variety.count, q + 1))} className="w-10 h-10 rounded-lg bg-clay text-root font-bold text-lg flex items-center justify-center active:scale-90">+</button>
                        </div>
                      </div>

                      {/* Sale-specific fields */}
                      {splitAction === 'sell' && (
                        <>
                          <div>
                            <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Sale Type</label>
                            <div className="flex gap-1.5">
                              {(['manual', 'market', 'wholesale'] as const).map(s => (
                                <button key={s} onClick={() => setSaleSource(s)} className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-colors ${saleSource === s ? 'bg-petal text-white' : 'bg-clay text-stone-c'}`}>
                                  {s === 'manual' ? 'Direct' : s}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase text-stone-c tracking-wider font-bold block mb-1">Customer Name</label>
                            <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Walk-in customer" className="w-full px-3 py-2 rounded-lg border border-fence bg-linen text-root text-sm focus:outline-none focus:ring-2 focus:ring-petal" />
                          </div>
                          <div className="bg-petal-lt/50 rounded-lg p-3 text-xs text-root space-y-1">
                            <div className="flex justify-between"><span className="text-stone-c">Unit price</span><span className="font-bold">${variety.price?.toFixed(2) || '0.00'}</span></div>
                            <div className="flex justify-between"><span className="text-stone-c">Quantity</span><span className="font-bold">× {splitQty}</span></div>
                            <div className="flex justify-between border-t border-petal/20 pt-1 mt-1"><span className="font-bold">Total</span><span className="font-bold text-petal">${((variety.price || 0) * splitQty).toFixed(2)}</span></div>
                          </div>
                        </>
                      )}

                      {splitAction === 'split' && (
                        <p className="text-xs text-stone-c">Create a new "{variety.name}" record with {splitQty}. Original keeps {variety.count - splitQty}.</p>
                      )}

                      <div className="flex gap-2">
                        <button onClick={() => { setShowSplit(false); setSplitQty(1); setCustomerName(''); }} className="flex-1 py-2 rounded-lg font-bold border border-fence text-stone-c text-sm">Cancel</button>
                        <button
                          onClick={async () => {
                            const remaining = variety.count - splitQty;
                            const zoneName = zones.find(z => z.id === variety.zone_id)?.name || '';

                            if (splitAction === 'sell') {
                              // 1. Create Order document
                              const unitPrice = variety.price || 0;
                              const subtotal = unitPrice * splitQty;
                              await createOrder({
                                source: saleSource,
                                customer_name: customerName || 'Walk-in',
                                items: [{
                                  variety_id: variety.id,
                                  zone_id: variety.zone_id,
                                  name: variety.name,
                                  quantity: splitQty,
                                  unit_price: unitPrice,
                                }],
                                subtotal,
                                shipping_cost: 0,
                                total: subtotal,
                                status: 'fulfilled',
                                notes: `Manual sale from ${zoneName || 'unknown zone'}`,
                              } as any);

                              // 2. Decrement variety count
                              await onSave(variety.id, {
                                count: remaining,
                                ...(remaining <= 0 ? { status: StatusEnum.SOLD } : {}),
                              } as any);
                            } else {
                              // Split: reduce original, create new variety record
                              await onSave(variety.id, { count: remaining } as any);
                              await createVariety({
                                name: variety.name,
                                zone_id: variety.zone_id,
                                count: splitQty,
                                status: variety.status,
                                bloom_form: variety.bloom_form,
                                bloom_size: variety.bloom_size,
                                height: variety.height,
                                season: variety.season,
                                grade: variety.grade,
                                price: variety.price,
                                color_hex: variety.color_hex,
                                notes: `Split from ${variety.name} (${splitQty} of ${variety.count})`,
                              } as any);
                            }
                            setShowSplit(false);
                            setSplitQty(1);
                            setCustomerName('');
                            onClose();
                          }}
                          disabled={splitQty < 1 || splitQty > variety.count}
                          className="flex-1 py-2 rounded-lg font-bold bg-petal text-white text-sm disabled:opacity-30"
                        >
                          {splitAction === 'sell' ? `Sell ${splitQty} · $${((variety.price || 0) * splitQty).toFixed(2)}` : `Split ${splitQty}`}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setEditing(true)}
                className="w-full py-3 mt-3 rounded-xl font-bold border border-fence text-stone-c hover:bg-clay transition-colors"
              >
                Edit Variety
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PhotoThumb({ url }: { url: string }) {
  const [src, setSrc] = useState<string>('');

  useEffect(() => {
    if (url.startsWith('pending://')) {
      const uuid = url.replace('pending://', '');
      get(`file_${uuid.replace('variety_', '').replace('zone_', '').replace('photo_', '')}`).then((payload: any) => {
        if (payload?.blob) setSrc(URL.createObjectURL(payload.blob));
      });
    } else {
      setSrc(url);
    }
    return () => { if (src.startsWith('blob:')) URL.revokeObjectURL(src); };
  }, [url]);

  if (!src) return <div className="w-20 h-20 rounded-lg bg-clay animate-pulse flex-shrink-0" />;
  return <img src={src} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-fence-lt" />;
}
