import React, { useState } from 'react';
import { Kitchen, KitchenTariff, Supplier, User } from '../types';
import { Settings, Shield, Plus, Building, UserPlus, FileKey, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminViewProps {
  currentUser: User;
  kitchens: Kitchen[];
  suppliers: Supplier[];
  tariffs: KitchenTariff[];
  users: User[];
  onToggleKitchenActive: (kitchenId: number) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  kitchens,
  suppliers,
  tariffs,
  users,
  onToggleKitchenActive
}) => {
  const [activeTab, setActiveTab] = useState<'kitchens' | 'suppliers' | 'tariffs' | 'users'>('kitchens');

  const sortedKitchens = [...kitchens].sort((a, b) => {
    const clusterComp = (a.cluster || a.region || '').localeCompare(b.cluster || b.region || '', 'he');
    if (clusterComp !== 0) return clusterComp;
    return a.name.localeCompare(b.name, 'he');
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
                      <td className="p-3 font-mono font-bold text-slate-700">{k.kitchenCode}</td>
                      <td className="p-3 font-bold text-slate-900">{k.name}</td>
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-slate-800 text-sm mb-4">מחירונים חוזיים לפי מטבח וסוג ארוחה</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">מטבח</th>
                  <th className="p-3">סוג ארוחה</th>
                  <th className="p-3 text-center">מחיר מנה (בש"ח)</th>
                  <th className="p-3">תוקף החל מ-</th>
                  <th className="p-3">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tariffs.map(t => {
                  const kitchen = kitchens.find(k => k.id === t.kitchenId);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{kitchen?.name}</td>
                      <td className="p-3 text-slate-700">צהריים בשרי / מנה חמה</td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-700 text-sm">
                        ₪{t.priceNis.toFixed(2)}
                      </td>
                      <td className="p-3 text-slate-500 font-mono">{t.effectiveFrom}</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          בתוקף
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
