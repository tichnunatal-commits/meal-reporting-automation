import React, { useState } from 'react';
import { Kitchen, KitchenTariff, Supplier, User } from '../types';
import { Settings, Shield, Plus, Building, UserPlus, FileKey, CheckCircle2, AlertCircle, Search, X, Edit2, Check } from 'lucide-react';
import { formatKitchenDisplayName } from './SearchableKitchenSelect';

interface AdminViewProps {
  currentUser: User;
  kitchens: Kitchen[];
  suppliers: Supplier[];
  tariffs: KitchenTariff[];
  users: User[];
  onToggleKitchenActive: (kitchenId: number) => void;
  onUpdateTariff?: (tariffId: number, newPriceNis: number) => Promise<void> | void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  kitchens,
  suppliers,
  tariffs,
  users,
  onToggleKitchenActive,
  onUpdateTariff
}) => {
  const [activeTab, setActiveTab] = useState<'kitchens' | 'suppliers' | 'tariffs' | 'users'>('kitchens');
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<string>('all');
  const [selectedKitchenFilter, setSelectedKitchenFilter] = useState<string>('all');
  const [selectedMealTypeFilter, setSelectedMealTypeFilter] = useState<string>('all');
  const [kitchenSearchQuery, setKitchenSearchQuery] = useState<string>('');

  const [editingTariffId, setEditingTariffId] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isSavingTariff, setIsSavingTariff] = useState<boolean>(false);

  const startEditTariff = (tariff: KitchenTariff) => {
    setEditingTariffId(tariff.id);
    setEditingPrice(String(tariff.priceNis));
  };

  const cancelEditTariff = () => {
    setEditingTariffId(null);
    setEditingPrice('');
  };

  const saveTariff = async (tariffId: number) => {
    const numVal = Number(editingPrice);
    if (isNaN(numVal) || numVal < 0) return;

    setIsSavingTariff(true);
    try {
      if (onUpdateTariff) {
        await onUpdateTariff(tariffId, numVal);
      }
      setSuccessToast('המחיר עודכן ונשמר בהצלחה במסד הנתונים');
      setEditingTariffId(null);
      setEditingPrice('');
      setTimeout(() => setSuccessToast(null), 6000);
    } catch (err) {
      console.error('Error saving tariff:', err);
    } finally {
      setIsSavingTariff(false);
    }
  };

  const sortedKitchens = [...kitchens].sort((a, b) => {
    const clusterComp = (a.cluster || a.region || '').localeCompare(b.cluster || b.region || '', 'he');
    if (clusterComp !== 0) return clusterComp;
    return a.name.localeCompare(b.name, 'he');
  });

  const availableClusters = Array.from(new Set(
    tariffs.map(t => t.clusterName || kitchens.find(k => k.id === t.kitchenId)?.cluster || '').filter(Boolean)
  )).sort((a, b) => a.localeCompare(b, 'he'));

  const availableMealTypes = Array.from(new Set(
    tariffs.map(t => t.mealTypeName || '').filter(Boolean)
  )).sort((a, b) => a.localeCompare(b, 'he'));

  // תלות סינון: מטבחי האשכול הנבחר בלבד
  const clusterKitchens = sortedKitchens.filter(k => 
    selectedClusterFilter === 'all' || (k.cluster || k.region) === selectedClusterFilter
  );

  const searchedClusterKitchens = clusterKitchens.filter(k => {
    if (!kitchenSearchQuery.trim()) return true;
    const q = kitchenSearchQuery.toLowerCase().trim();
    return k.name.toLowerCase().includes(q) || (k.cluster || '').toLowerCase().includes(q);
  });

  const filteredTariffs = tariffs.filter(t => {
    const k = kitchens.find(k => k.id === t.kitchenId);
    const cluster = t.clusterName || k?.cluster || '';
    if (selectedClusterFilter !== 'all' && cluster !== selectedClusterFilter) return false;
    if (selectedKitchenFilter !== 'all' && String(t.kitchenId) !== selectedKitchenFilter) return false;
    if (selectedMealTypeFilter !== 'all' && t.mealTypeName !== selectedMealTypeFilter) return false;
    if (kitchenSearchQuery.trim()) {
      const q = kitchenSearchQuery.toLowerCase().trim();
      const kName = (t.kitchenName || k?.name || '').toLowerCase();
      const cName = cluster.toLowerCase();
      const mName = (t.mealTypeName || '').toLowerCase();
      if (!kName.includes(q) && !cName.includes(q) && !mName.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Admin Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            ניהול מערכת ואדמין (זאב נאורי / חוליית התייעלות)
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-1">הגדרות תשתית, מטבחים ומחירונים</h2>
          <p className="text-xs text-slate-500">אכיפת אילוצי מסד DR-01..DR-05, תוקף תאריכי וניהול הרשאות</p>
        </div>

        {/* Admin Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('kitchens')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'kitchens' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            מטבחים ({kitchens.length})
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'suppliers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ספקים ({suppliers.length})
          </button>
          <button
            onClick={() => setActiveTab('tariffs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'tariffs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            מחירונים ({tariffs.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            משתמשים ({users.length})
          </button>
        </div>
      </div>

      {/* Constraints Notice Banner */}
      <div className="bg-purple-900 text-white p-4 rounded-xl shadow-xs border border-purple-800 text-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-purple-300 shrink-0" />
          <div>
            <strong>אילוצי מסד נתונים פעילים:</strong> DR-01 (מפתח זהות נפרד משם) • DR-02 (אין מחיקת מטבחים - דגל פעיל בלבד) • DR-04 (השבתה עתידית) • DR-05 (1 ספק בלבד למטבח).
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      {activeTab === 'kitchens' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">רשימת מטבחי המשטרה והגדרות חוקי חישוב</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">קוד</th>
                  <th className="p-3">שם המטבח</th>
                  <th className="p-3">מחוז / מרחב</th>
                  <th className="p-3">ספק מפעיל</th>
                  <th className="p-3">חוקי חישוב מיוחדים</th>
                  <th className="p-3 text-center">מינימום רבעוני</th>
                  <th className="p-3 text-center">סטטוס פעילות</th>
                  <th className="p-3 text-center">פעולה (DR-02/04)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedKitchens.map(k => {
                  const supplier = suppliers.find(s => s.id === k.supplierId);
                  return (
                    <tr key={k.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{formatKitchenDisplayName(k)}</td>
                      <td className="p-3 text-slate-600">{k.region}</td>
                      <td className="p-3 text-slate-800">{supplier?.name || '-'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {k.appliesR1Machmesh && (
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              R1 מכמש (קיצוץ 10%)
                            </span>
                          )}
                          {k.appliesR2Tzohar && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              R2 צוחר (תוספת 30%)
                            </span>
                          )}
                          {!k.appliesR1Machmesh && !k.appliesR2Tzohar && (
                            <span className="text-slate-400">רגיל</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center font-mono">
                        {k.hasQuarterlyMinimum ? (
                          <span className="text-emerald-700 font-bold">{k.quarterlyMinimumMeals?.toLocaleString()} מנות</span>
                        ) : '-'}
                      </td>
                      <td className="p-3 text-center">
                        {k.isActive ? (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            פעיל
                          </span>
                        ) : (
                          <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-medium">
                            לא פעיל
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onToggleKitchenActive(k.id)}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded transition ${
                            k.isActive 
                              ? 'text-rose-600 hover:bg-rose-50 border border-rose-200' 
                              : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          {k.isActive ? 'השבת מטבח (סוף חודש)' : 'הפעל מטבח'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tariffs' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">מחירונים חוזיים לפי 11 אשכולות, מטבחים וסוגי ארוחה</h3>
              <p className="text-xs text-slate-500">מטריצת תעריפי המכרז הרשמיים, ארוחות שבת, בולים ושינוע</p>
            </div>
            <div className="text-xs font-semibold bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200">
              מוצגים {filteredTariffs.length.toLocaleString()} תעריפים מתוך {tariffs.length.toLocaleString()}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
            {/* Cluster Filter */}
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-700">סינון לפי אשכול:</label>
              <select
                value={selectedClusterFilter}
                onChange={(e) => {
                  setSelectedClusterFilter(e.target.value);
                  setSelectedKitchenFilter('all');
                  setKitchenSearchQuery('');
                }}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="all">כל 11 האשכולות ({availableClusters.length})</option>
                {availableClusters.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Kitchen Filter - strictly dependent on selected cluster */}
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-700">סינון לפי מטבח:</label>
              <select
                value={selectedKitchenFilter}
                onChange={(e) => setSelectedKitchenFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none max-w-[240px]"
              >
                <option value="all">
                  {selectedClusterFilter === 'all' 
                    ? `כל התחנות והמטבחים (${sortedKitchens.length})` 
                    : `כל מטבחי ${selectedClusterFilter} (${clusterKitchens.length})`}
                </option>
                {searchedClusterKitchens.map(k => (
                  <option key={k.id} value={String(k.id)}>
                    {formatKitchenDisplayName(k)}
                  </option>
                ))}
              </select>
            </div>

            {/* Meal Type Filter */}
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-700">סוג ארוחה:</label>
              <select
                value={selectedMealTypeFilter}
                onChange={(e) => setSelectedMealTypeFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none max-w-[200px]"
              >
                <option value="all">כל סוגי הארוחות ({availableMealTypes.length})</option>
                {availableMealTypes.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Live Search Input inside Cluster Kitchens */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-purple-500">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={kitchenSearchQuery}
                onChange={(e) => setKitchenSearchQuery(e.target.value)}
                placeholder={selectedClusterFilter === 'all' ? "חיפוש תחנה / אשכול..." : `חיפוש באשכול ${selectedClusterFilter}...`}
                className="w-36 sm:w-44 text-xs bg-transparent border-none focus:outline-hidden text-slate-800 placeholder:text-slate-400"
              />
              {kitchenSearchQuery && (
                <button
                  type="button"
                  onClick={() => setKitchenSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {(selectedClusterFilter !== 'all' || selectedKitchenFilter !== 'all' || selectedMealTypeFilter !== 'all' || kitchenSearchQuery !== '') && (
              <button
                onClick={() => {
                  setSelectedClusterFilter('all');
                  setSelectedKitchenFilter('all');
                  setSelectedMealTypeFilter('all');
                  setKitchenSearchQuery('');
                }}
                className="text-purple-700 hover:text-purple-900 font-bold underline px-2 py-1 cursor-pointer"
              >
                איפוס סינונים
              </button>
            )}
          </div>

          {/* Toast Notification Banner */}
          {successToast && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl mb-4 flex items-center justify-between text-xs font-bold shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <span>{successToast}</span>
              </div>
              <button
                onClick={() => setSuccessToast(null)}
                className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10 shadow-xs">
                <tr>
                  <th className="p-3">שם התחנה המלא</th>
                  <th className="p-3">אשכול מכרז</th>
                  <th className="p-3">מחוז</th>
                  <th className="p-3">סוג ארוחה / פריט</th>
                  <th className="p-3 text-center">מחיר מנה (בש"ח)</th>
                  <th className="p-3">תוקף החל מ-</th>
                  <th className="p-3 text-center">סטטוס</th>
                  <th className="p-3 text-center">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTariffs.slice(0, 300).map(t => {
                  const kitchen = kitchens.find(k => k.id === t.kitchenId);
                  const clusterName = t.clusterName || kitchen?.cluster || '-';
                  const kitchenName = t.kitchenName || kitchen?.name || '-';
                  const region = t.region || kitchen?.region || '-';
                  const mealTypeName = t.mealTypeName || 'ארוחה תקנית';
                  const fullDisplayName = formatKitchenDisplayName({ name: kitchenName, cluster: clusterName, region });
                  const isEditing = editingTariffId === t.id;

                  return (
                    <tr key={t.id} className={isEditing ? 'bg-amber-50/70' : 'hover:bg-slate-50'}>
                      <td className="p-3 font-bold text-slate-900">{fullDisplayName}</td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {clusterName}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{region}</td>
                      <td className="p-3 font-semibold text-slate-800">{mealTypeName}</td>
                      
                      {/* Editable Price cell */}
                      <td className="p-3 text-center font-mono font-bold text-emerald-700 text-sm">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-slate-500 text-xs">₪</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editingPrice}
                              onChange={(e) => setEditingPrice(e.target.value)}
                              className="w-24 bg-white border-2 border-emerald-500 rounded px-2 py-1 text-center font-bold text-slate-900 focus:outline-none"
                              autoFocus
                            />
                          </div>
                        ) : (
                          `₪${Number(t.priceNis).toFixed(2)}`
                        )}
                      </td>
                      
                      <td className="p-3 text-slate-500 font-mono">{t.effectiveFrom || '2026-06-01'}</td>
                      
                      <td className="p-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          בתוקף
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="p-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => saveTariff(t.id)}
                              disabled={isSavingTariff}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-xs disabled:opacity-50"
                              title="שמור מחיר מעודכן"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>שמור</span>
                            </button>
                            <button
                              onClick={cancelEditTariff}
                              className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs transition cursor-pointer"
                              title="בטל עריכה"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditTariff(t)}
                            className="inline-flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                            title="ערוך מחיר מנה"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>ערוך</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredTariffs.length > 300 && (
            <p className="text-[11px] text-slate-400 text-center mt-2">
              (מוצגות 300 השורות הראשונות מתוך {filteredTariffs.length} — השתמש בסינון לפי אשכול/מטבח לצפייה ממוקדת)
            </p>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-800 text-sm mb-4">משתמשי המערכת והרשאות RBAC</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">שם מלא</th>
                  <th className="p-3">שם משתמש</th>
                  <th className="p-3">תפקיד במערכת</th>
                  <th className="p-3">דוא"ל</th>
                  <th className="p-3">טלפון</th>
                  <th className="p-3 text-center">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{u.fullName}</td>
                    <td className="p-3 font-mono text-slate-600">{u.username}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'system_admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'food_dept_reviewer' ? 'bg-blue-100 text-blue-800' :
                        u.role === 'police_ramtal' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 font-mono">{u.email}</td>
                    <td className="p-3 text-slate-600 font-mono">{u.phone || '-'}</td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        פעיל
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-800 text-sm mb-4">ספקי הסעדה מורשים</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suppliers.map(s => (
              <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{s.supplierCode}</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>איש קשר: <strong>{s.contactPerson}</strong></div>
                  <div>דוא"ל: <span className="font-mono">{s.contactEmail}</span></div>
                  <div>טלפון: <span className="font-mono">{s.contactPhone}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
