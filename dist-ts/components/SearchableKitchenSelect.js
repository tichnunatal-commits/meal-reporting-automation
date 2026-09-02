import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
export const formatKitchenDisplayName = (k) => {
    const clusterPart = k.cluster || k.region || '';
    if (!clusterPart)
        return k.name;
    return `${clusterPart} ${k.name}`;
};
export const SearchableKitchenSelect = ({ kitchens, selectedKitchenId, onChange, label, placeholder = 'חפש תחנה או אשכול...', className = '', themeColor = 'blue', allowAllOption = false, allOptionLabel = 'כל המטבחים שבטיפולי' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);
    const isAllSelected = allowAllOption && selectedKitchenId === 0;
    const selectedKitchen = kitchens.find(k => k.id === selectedKitchenId) || (allowAllOption ? null : kitchens[0]);
    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // Focus input when opened
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);
    const filteredKitchens = kitchens.filter(k => {
        if (!searchQuery.trim())
            return true;
        const q = searchQuery.toLowerCase().trim();
        const cluster = (k.cluster || k.region || '').toLowerCase();
        const name = k.name.toLowerCase();
        const fullName = `${cluster} ${name}`;
        return fullName.includes(q) || name.includes(q) || cluster.includes(q);
    });
    const borderFocusClass = themeColor === 'emerald' ? 'focus-within:ring-emerald-500 focus-within:border-emerald-500' :
        themeColor === 'purple' ? 'focus-within:ring-purple-500 focus-within:border-purple-500' :
            'focus-within:ring-blue-500 focus-within:border-blue-500';
    const activeOptionBgClass = themeColor === 'emerald' ? 'bg-emerald-50 text-emerald-900 font-bold' :
        themeColor === 'purple' ? 'bg-purple-50 text-purple-900 font-bold' :
            'bg-blue-50 text-blue-900 font-bold';
    const checkColorClass = themeColor === 'emerald' ? 'text-emerald-600' :
        themeColor === 'purple' ? 'text-purple-600' :
            'text-blue-600';
    return (_jsxs("div", { className: `relative ${className}`, ref: containerRef, dir: "rtl", children: [label && _jsx("label", { className: "block text-xs font-medium text-slate-600 mb-1", children: label }), _jsxs("button", { type: "button", onClick: () => setIsOpen(!isOpen), className: `w-full flex items-center justify-between gap-2 bg-slate-50 hover:bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 transition shadow-2xs text-right cursor-pointer focus:outline-hidden focus:ring-2 ${themeColor === 'emerald' ? 'focus:ring-emerald-500' :
                    themeColor === 'purple' ? 'focus:ring-purple-500' :
                        'focus:ring-blue-500'}`, children: [_jsx("span", { className: "truncate font-semibold text-slate-900", children: isAllSelected ? allOptionLabel : (selectedKitchen ? formatKitchenDisplayName(selectedKitchen) : 'בחר תחנה...') }), _jsx(ChevronDown, { className: `w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}` })] }), isOpen && (_jsxs("div", { className: "absolute right-0 top-full mt-1.5 w-full min-w-[280px] sm:min-w-[340px] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-80 animate-in fade-in zoom-in-95 duration-150", children: [_jsx("div", { className: "p-2 border-b border-slate-100 bg-slate-50/70", children: _jsxs("div", { className: `flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs ${borderFocusClass}`, children: [_jsx(Search, { className: "w-3.5 h-3.5 text-slate-400 shrink-0" }), _jsx("input", { ref: searchInputRef, type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: placeholder, className: "w-full text-xs bg-transparent border-none focus:outline-hidden text-slate-800 placeholder:text-slate-400" }), searchQuery && (_jsx("button", { type: "button", onClick: () => setSearchQuery(''), className: "text-slate-400 hover:text-slate-600 p-0.5", children: _jsx(X, { className: "w-3 h-3" }) }))] }) }), _jsxs("div", { className: "overflow-y-auto divide-y divide-slate-50 p-1 flex-1", children: [allowAllOption && !searchQuery && (_jsxs("button", { type: "button", onClick: () => {
                                    onChange(0);
                                    setIsOpen(false);
                                    setSearchQuery('');
                                }, className: `w-full text-right px-3 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-2 transition cursor-pointer mb-1 border border-slate-200/80 ${isAllSelected ? activeOptionBgClass : 'hover:bg-slate-50 text-slate-800 font-bold bg-slate-50/50'}`, children: [_jsxs("span", { className: "truncate", children: ["\uD83C\uDFDB\uFE0F ", allOptionLabel, " (", kitchens.length, ")"] }), isAllSelected && _jsx(Check, { className: `w-4 h-4 shrink-0 ${checkColorClass}` })] })), filteredKitchens.length === 0 ? (_jsxs("div", { className: "p-4 text-center text-xs text-slate-400", children: ["\u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D5 \u05EA\u05D7\u05E0\u05D5\u05EA \u05EA\u05D5\u05D0\u05DE\u05D5\u05EA \u05DC-\"", _jsx("strong", { children: searchQuery }), "\""] })) : (filteredKitchens.map(k => {
                                const isSelected = k.id === selectedKitchenId;
                                const displayName = formatKitchenDisplayName(k);
                                return (_jsxs("button", { type: "button", onClick: () => {
                                        onChange(k.id);
                                        setIsOpen(false);
                                        setSearchQuery('');
                                    }, className: `w-full text-right px-3 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-2 transition cursor-pointer ${isSelected ? activeOptionBgClass : 'hover:bg-slate-50 text-slate-700'}`, children: [_jsx("span", { className: "truncate", children: displayName }), isSelected && _jsx(Check, { className: `w-4 h-4 shrink-0 ${checkColorClass}` })] }, k.id));
                            }))] }), _jsxs("div", { className: "px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between", children: [_jsxs("span", { children: ["\u05DE\u05D5\u05E6\u05D2\u05D5\u05EA ", filteredKitchens.length, " \u05DE\u05EA\u05D5\u05DA ", kitchens.length, " \u05EA\u05D7\u05E0\u05D5\u05EA"] }), searchQuery && _jsx("span", { className: "text-slate-500", children: "\u05E1\u05D9\u05E0\u05D5\u05DF \u05E4\u05E2\u05D9\u05DC" })] })] }))] }));
};
