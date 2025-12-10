"use client";











import { useState, useEffect, useRef, type KeyboardEvent } from "react";





import Image from "next/image";





import * as XLSX from "xlsx";





import {





  Package,





  Search,





  Plus,





  Edit,





  Save,





  X,





  Eye,





  EyeOff,





  Play,





  DollarSign,





  Clock,





  Calendar,





  CheckCircle,





  Upload,





  Download,





  FileText,





  AlertCircle,





  RefreshCw,





  Shield





} from "lucide-react";





import { ToyData } from "@/lib/toys-data";











interface InventoryItem extends ToyData {





  isVisible: boolean;





  isEditing: boolean;





  hasChanges: boolean;





  rentalPriceDaily?: number;





  rentalPriceWeekly?: number;





  rentalPriceMonthly?: number;





  depositAmount?: number;





  sku?: string;





  backendId?: string;





}











const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://louaab.ma/api';











const normalizeHeader = (value: string) =>





  value





    .normalize('NFD')





    .replace(/[\u0300-\u036f]/g, '')





    .trim()





    .toLowerCase();











const REQUIRED_IMPORT_HEADERS = [





  'id',





  'nom',





  'categorie',





  'age',





  'prix',





  'stock',





  'description',





  'visible',





  'image',





  'video url',





];











const extractApiItems = <T,>(data: unknown): T[] => {





  if (Array.isArray(data)) {





    return data as T[];





  }





  if (data && typeof data === 'object') {





    const maybeItems = (data as { items?: unknown }).items;





    if (Array.isArray(maybeItems)) {





      return maybeItems as T[];





    }





  }





  return [];





};











const parsePriceValue = (value?: string | number | null) => {





  if (typeof value === 'number' && Number.isFinite(value)) {





    return value;





  }





  if (typeof value === 'string') {





    const numeric = parseFloat(value.replace(/[^\d.]/g, ''));





    return Number.isFinite(numeric) ? numeric : 0;





  }





  return 0;





};











const getToyBasePrice = (toy: InventoryItem, base: 'daily' | 'weekly' | 'monthly') => {





  if (base === 'daily') {





    return parsePriceValue((toy as any).rentalPriceDaily ?? toy.rentalPriceDaily);





  }





  if (base === 'weekly') {





    return parsePriceValue((toy as any).rentalPriceWeekly ?? toy.rentalPriceWeekly);





  }





  if (base === 'monthly') {





    return parsePriceValue((toy as any).rentalPriceMonthly ?? toy.rentalPriceMonthly);





  }





  return 0;





};











const computeDepositValue = (toy: InventoryItem, percentage: number, base: 'daily' | 'weekly' | 'monthly') => {





  const basePrice = getToyBasePrice(toy, base) || parsePriceValue(toy.price);





  if (!basePrice) return 0;





  const deposit = (basePrice * (percentage || 0)) / 100;





  return Number(deposit.toFixed(2));





};











const normalize = (value: unknown) =>





  (value ?? "")





    .toString()





    .normalize("NFD")





    .replace(/[\u0300-\u036f]/g, "")





    .toLowerCase()





    .replace(/\s+/g, " ")





    .trim();











const formatPriceDisplay = (value?: number | string | null) => {





  const amount = parsePriceValue(value ?? 0);





  if (!amount) return 'N/A';





  return `${amount.toFixed(2)} MAD`;





};











const readFileRows = async (file: File): Promise<string[][]> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'xls' || extension === 'xlsx') {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, { header: 1, raw: false });
    return rows
      .map((row) => row.map((cell) => (cell === null || cell === undefined ? '' : String(cell).trim())))
      .filter((row) => row.some((cell) => cell && cell.trim().length > 0));
  }

  const text = await file.text();
  return text
    .split(/\r?\n/)
    .map((line) =>
      line
        .split(',')
        .map((value) => value.trim().replace(/^"|"$/g, '')),
    )
    .filter((row) => row.some((cell) => cell && cell.trim().length > 0));
};











export default function InventoryPage() {





  const [toys, setToys] = useState<InventoryItem[]>([]);





  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);





  const defaultAgeOptions = [





    '0-6 mois',





    '6-12 mois',





    '1-2 ans',





    '2-3 ans',





    '3-4 ans',





    '4-5 ans',





    '5-6 ans',





    '6-8 ans',





    '8-10 ans',





    '10-12 ans',





    '12+ ans',





    'Tous ges',





  ];





  const [ageOptions, setAgeOptions] = useState<string[]>(defaultAgeOptions);





  const [loading, setLoading] = useState(true);





  const [searchQuery, setSearchQuery] = useState("");





  const [filterCategory, setFilterCategory] = useState("all");





  const [filterVisibilitéy, setFilterVisibilitéy] = useState("all");





  const [showAddForm, setShowAddForm] = useState(false);





  const [editingToy, setEditingToy] = useState<InventoryItem | null>(null);





  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());





  const [suggestions, setSuggestions] = useState<string[]>([]);











  const [showPricingModal, setShowPricingModal] = useState(false);





  const [selectedToyForPricing, setSelectedToyForPricing] = useState<InventoryItem | null>(null);





  const [editedPrices, setEditedPrices] = useState({





    daily: 0,





    weekly: 0,





    monthly: 0,





  });











  const [showStockModal, setShowStockModal] = useState(false);





  const [selectedToyForStock, setSelectedToyForStock] = useState<InventoryItem | null>(null);





  const [editedStock, setEditedStock] = useState<number>(0);











  const [showImportModal, setShowImportModal] = useState(false);





  const [importFile, setImportFile] = useState<File | null>(null);





  const [importing, setImporting] = useState(false);





  const [exporting, setExporting] = useState(false);





  const [backendConnected, setBackendConnected] = useState(false);





  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');





  const [highlightedToyId, setHighlightedToyId] = useState<string | number | null>(null);





  const [isSaving, setIsSaving] = useState(false);





  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);











  const [notification, setNotification] = useState<{





    show: boolean;





    message: string;





    type: 'success' | 'error';





  }>({





    show: false,





    message: '',





    type: 'success'





  });





  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());





  const [bulkDeleting, setBulkDeleting] = useState(false);





  const [newToy, setNewToy] = useState<Partial<InventoryItem>>({





    name: '',





    category: '',





    age: '',





    description: '',





    image: '/toys/placeholders/toy-placeholder.svg',





    hasImage: false,





    isVisible: true,





    isEditing: false,





    hasChanges: false,





    hasVideo: false,





    videoUrl: '',





  });





  const [showDepositModal, setShowDepositModal] = useState(false);





  const [selectedToyForDeposit, setSelectedToyForDeposit] = useState<InventoryItem | null>(null);





  const [depositPercent, setDepositPercent] = useState<number>(600);





  const [depositBase, setDepositBase] = useState<'daily' | 'weekly' | 'monthly'>('weekly');











  const depositBasePrice = selectedToyForDeposit





    ? getToyBasePrice(selectedToyForDeposit, depositBase) || parsePriceValue(selectedToyForDeposit.price)





    : 0;





  const depositPreviewValue = selectedToyForDeposit





    ? computeDepositValue(selectedToyForDeposit, depositPercent, depositBase)





    : 0;











  const generateToyId = () => {





    return Date.now() + Math.floor(Math.random() * 1000);





  };











  const generateSlug = (name: string) => {





    return name





      .toLowerCase()





      .replace(/[\u0300-\u036f]/g, '')

      .toLowerCase()

      .replace(/[^a-z0-9]+/g, '-')

      .replace(/^-+|-+$/g, '')

      .substring(0, 50);





  };











  const formatAgeRange = (min?: number | string | null, max?: number | string | null) => {





    const nMin = Number(min);





    const nMax = Number(max);





    if (!Number.isFinite(nMin) && !Number.isFinite(nMax)) return '';





    if (Number.isFinite(nMin) && Number.isFinite(nMax)) {





      if (nMin === 0 && nMax === 18) return 'Tous ges';





      if (nMin === nMax) return `${nMin}+ ans`;





      return `${nMin}-${nMax} ans`;





    }





    if (Number.isFinite(nMin)) return `${nMin}+ ans`;





    if (Number.isFinite(nMax)) return `0-${nMax} ans`;





    return '';





  };











  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {





    setNotification({





      show: true,





      message,





      type





    });





    setTimeout(() => {





      setNotification(prev => ({ ...prev, show: false }));





    }, 3000);





  };











  const triggerRevalidation = async () => {





    try {





      await Promise.resolve() /* revalidate removed */;





      console.log('Revalidation triggered successfully');





    } catch (e) {





      console.error('Revalidation failed:', e);





    }





  };











  const checkBackendConnection = async () => {





    try {





      setBackendStatus('checking');





      const response = await fetch(`${API_BASE_URL}/health`, {





        method: 'GET',





        headers: { 'Content-Type': 'application/json' },





      });





      if (response.ok) {





        setBackendConnected(true);





        setBackendStatus('connected');





      } else {





        setBackendConnected(false);





        setBackendStatus('error');





      }





    } catch (error) {





      console.error('Erreur de connexion au backend:', error);





      setBackendConnected(false);





      setBackendStatus('error');





    }





  };











  const loadInventory = async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;





    try {





      if (!silent) {
        setLoading(true);
      }











      // Fetch Backend Data Only





      try {





        const response = await fetch(`${API_BASE_URL}/toys?limit=1000`, {





          method: 'GET',





          headers: { 'Content-Type': 'application/json' },





          cache: 'no-store',





        });











        if (response.ok) {





          const result = await response.json();





          if (result.success && result.data) {





            const apiItems = extractApiItems<any>(result.data);





            const backendToys: InventoryItem[] = apiItems.map((toy: any) => {
              const stockNumeric = Number(
                typeof toy.stockQuantity === 'number'
                  ? toy.stockQuantity
                  : (typeof toy.stockQuantity === 'string' ? toy.stockQuantity : 0)
              );
  const availableNumeric = Number(
    typeof toy.availableQuantity === 'number'
      ? toy.availableQuantity
      : (typeof toy.availableQuantity === 'string' ? toy.availableQuantity : stockNumeric)
  );

  const resolvedStock = Number.isFinite(stockNumeric) ? stockNumeric : 0;
  const resolvedAvailable = Number.isFinite(availableNumeric) ? availableNumeric : resolvedStock;

  return {
    id: Number(toy.id) || generateToyId(),
    backendId: typeof toy.id === 'string' ? toy.id : (toy.id ? String(toy.id) : toy.slug),
    sku: toy.sku || undefined,
    slug: toy.slug || generateSlug(toy.name || ''),
    name: toy.name || '',
    price: String(toy.rentalPriceWeekly || toy.rentalPriceDaily || 0) + ' MAD/semaine',
    rentalPriceDaily: toy.rentalPriceDaily || 0,
    rentalPriceWeekly: toy.rentalPriceWeekly || 0,
    rentalPriceMonthly: toy.rentalPriceMonthly || 0,
    depositAmount: toy.depositAmount || 0,
    category: toy.categories?.map((c: any) => c.name).join(', ') || '',
    age: toy.ageRange || formatAgeRange(toy.ageMin, toy.ageMax),
    description: toy.description || '',
    image: toy.images?.[0]?.url || '/toys/placeholders/toy-placeholder.svg',
    thumbnail: toy.images?.[0]?.url || '/toys/placeholders/toy-placeholder.svg',
    hasImage: !!toy.images?.[0]?.url,
    rating: String(toy.rating || 4),
    stock: String(resolvedAvailable),
    stockQuantity: resolvedStock,
    availableQuantity: resolvedAvailable,
    videoUrl: toy.videoUrl || '',
    hasVideo: !!toy.videoUrl,
    source: 'backend',
    isVisible: toy.isActive !== false,
    isEditing: false,
    hasChanges: false,
  };
}).sort((a, b) => a.name.localeCompare(b.name, 'fr'));

setToys(backendToys);





          }





        }





      } catch (backendError) {





        console.warn('Erreur chargement backend:', backendError);





        showNotification('Erreur de connexion au backend', 'error');





      }











      if (!silent) {
        setLoading(false);
      }











    } catch (error) {





      console.error('Erreur globale chargement inventaire:', error);





      if (!silent) {
        setLoading(false);
      }





      showNotification('Erreur lors du chargement de l\'inventaire', 'error');





    }





  };











useEffect(() => {





    loadInventory();





    loadCategories();





    loadAgeOptions();





    checkBackendConnection();





  }, []);

  useEffect(() => {
    // Rafraîchissement uniquement quand l'onglet redevient visible (évite les reflows permanents)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void loadInventory({ silent: true });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);











  useEffect(() => {





    return () => {





      if (highlightTimeoutRef.current) {





        clearTimeout(highlightTimeoutRef.current);





      }





    };





  }, []);











  const loadCategories = async () => {





    try {





      const response = await fetch(`${API_BASE_URL}/categories/all`, {





        cache: 'no-store'





      });





      if (response.ok) {





        const result = await response.json();





        if (result.success && Array.isArray(result.data)) {





          setCategories(result.data);





        }





      }





    } catch (error) {





      console.error('Erreur lors du chargement des catégories:', error);





    }





    setSuggestions([]);





  };











  const loadAgeOptions = async () => {





    try {





      const response = await fetch(`${API_BASE_URL}/age-ranges`, {





        method: 'GET',





        headers: { 'Content-Type': 'application/json' },





      });





      if (response.ok) {





        const result = await response.json();





        const labels = extractApiItems<{ label?: string; isActive?: boolean; displayOrder?: number }>(result?.data)





          .filter((range) => range.isActive !== false && typeof range.label === 'string' && range.label.trim().length > 0)





          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))





          .map((range) => range.label!.trim());











        if (labels.length) {





          setAgeOptions(Array.from(new Set(labels)));





          return;





        }





      }





      setAgeOptions(defaultAgeOptions);





    } catch (error) {





      console.error('Erreur lors du chargement des ges:', error);





      setAgeOptions(defaultAgeOptions);





    }





  };











  const resolveBackendId = async (toy: InventoryItem): Promise<string | null> => {





    if (toy.backendId) return toy.backendId;





    const slugCandidate = toy.slug || generateSlug(toy.name || '');





    if (!slugCandidate) return null;





    try {





      const response = await fetch(`${API_BASE_URL}/toys?search=${encodeURIComponent(slugCandidate)}&limit=1`, {





        method: 'GET',





        headers: { 'Content-Type': 'application/json' },





        cache: 'no-store',





      });





      if (!response.ok) return null;





      const result = await response.json();





      const items = extractApiItems<any>(result?.data);





      const match = items.find((item) => item.slug === toy.slug || item.name?.toLowerCase() === toy.name?.toLowerCase());





      return match?.id || null;





    } catch (error) {





      console.error('Erreur lors de la rsolution de lID du jouet:', error);





      return null;





    }





  };











  const handleSaveStock = async () => {





    if (!selectedToyForStock) return;





    try {





      const toyIdentifier = await resolveBackendId(selectedToyForStock);





      if (!toyIdentifier) {





        showNotification("Impossible de retrouvéer ce jouet dans la base. Merci de le synchroniser d'abord.", 'error');





        return;





      }





      const newStock = Number(editedStock) || 0;





      const response = await fetch(`${API_BASE_URL}/toys/${toyIdentifier}`, {





        method: 'PATCH',





        headers: { 'Content-Type': 'application/json' },





        body: JSON.stringify({





          stockQuantity: newStock,

          availableQuantity: newStock,

          status: newStock > 0 ? 'available' : 'maintenance'





        }),





      });





      if (!response.ok) {





        const err = await response.json().catch(() => ({}));





        throw new Error(err.message || 'Erreur lors de la sauvegarde du stock');





      }





      setBackendConnected(true);





      setBackendStatus('connected');





      setToys(prev => prev.map(toy =>





        toy.id === selectedToyForStock.id





          ? { ...toy, stock: String(newStock), stockQuantity: newStock, availableQuantity: newStock }





          : toy





      ));





      handleCloseStockModal();





      showNotification(`Stock mis  jour : ${newStock > 0 ? `${newStock} unit(s) en stock` : 'Rupture de stock'}`);





      triggerRevalidation();





    } catch (error) {





      console.error('Erreur lors de la sauvegarde du stock:', error);





      showNotification(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde du stock', 'error');





    }





  };











  const handleSavePricing = async () => {





    if (!selectedToyForPricing) return;





    try {





      const toyIdentifier = await resolveBackendId(selectedToyForPricing);





      if (!toyIdentifier) {





        showNotification("Impossible de retrouvéer ce jouet dans la base. Merci de le synchroniser d'abord.", 'error');





        return;





      }





      const daily = Number(editedPrices.daily) || 0;





      const weekly = Number(editedPrices.weekly) || 0;





      const monthly = Number(editedPrices.monthly) || 0;





      const pricingData: Record<string, unknown> = {





        name: selectedToyForPricing.name || 'Jouet',





        rentalPriceDaily: daily,





        rentalPriceWeekly: weekly,





        rentalPriceMonthly: monthly,





      };





      const response = await fetch(`${API_BASE_URL}/toys/${toyIdentifier}`, {





        method: 'PATCH',





        headers: { 'Content-Type': 'application/json' },





        body: JSON.stringify(pricingData),





      });





      if (response.ok) {





        setToys(prev => prev.map(toy =>





          toy.id === selectedToyForPricing.id





            ? {





              ...toy,





              price: `${Math.round(editedPrices.weekly || 0)} MAD/semaine`,





              rentalPriceDaily: editedPrices.daily,





              rentalPriceWeekly: editedPrices.weekly,





              rentalPriceMonthly: editedPrices.monthly,





              promotion: selectedToyForPricing.promotion





            }





            : toy





        ));





        handleClosePricingModal();





        showNotification('Prix et promotions sauvegards avec succs dans le backend !', 'success');





        await loadInventory();





        triggerRevalidation();





      } else {





        const errorData = await response.json().catch(() => ({}));





        throw new Error(errorData.message || 'Erreur lors de la sauvegarde des prix');





      }





    } catch (error) {





      console.error('Erreur lors de la sauvegarde des prix:', error);





      showNotification(`Erreur: ${error instanceof Error ? error.message : 'Impossible de sauvegarder les prix'}`, 'error');





    }





  };











  const handleExportCSV = async () => {





    try {





      setExporting(true);





      const headers = ['ID', 'Nom', 'Catégorie', 'ge', 'Prix', 'Stock', 'Description', 'Visible', 'Image', 'Vido URL'];





      const rows = toys.map(toy => [





        toy.id,





        `"${toy.name.replace(/"/g, '""')}"`,





        `"${toy.category?.replace(/"/g, '""') || ''}"`,





        `"${toy.age || ''}"`,





        `"${toy.price || ''}"`,





        toy.stock || '0',





        `"${(toy.description || '').replace(/"/g, '""')}"`,





        toy.isVisible ? 'Oui' : 'Non',





        `"${toy.image || ''}"`,



        "${toy.videoUrl || ''}"
      ]);
      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');




      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });





      const link = document.createElement('a');





      const url = URL.createObjectURL(blob);





      link.setAttribute('href', url);





      link.setAttribute('download', `inventaire-louaab-${new Date().toISOString().split('T')[0]}.csv`);





      link.style.visibility = 'hidden';





      document.body.appendChild(link);





      link.click();





      document.body.removeChild(link);





      setExporting(false);





      showNotification('Export CSV russi !');





    } catch (error) {





      console.error('Erreur lors de l\'export CSV:', error);





      setExporting(false);





      showNotification('Erreur lors de l\'export CSV', 'error');





    }





  };











  const handleImportCSV = async () => {





    if (!importFile) {





      showNotification('Veuillez slectionner un fichier CSV ou Excel', 'error');





      return;





    }





    try {





      setImporting(true);





      const rows = await readFileRows(importFile);





      if (rows.length < 2) throw new Error('Le fichier doit contenir au moins un en-tte et une ligne de donnes');





      const headers = rows[0];





      const headerIndex = new Map<string, number>();





      headers.forEach((header, index) => {





        const normalized = normalizeHeader(header);





        if (normalized) headerIndex.set(normalized, index);





      });





      const missingHeaders = REQUIRED_IMPORT_HEADERS.filter((key) => !headerIndex.has(key));





      if (missingHeaders.length) throw new Error(`Colonnes manquantes: ${missingHeaders.join(', ')}`);





      const getValue = (row: string[], key: string) => {





        const idx = headerIndex.get(key);





        if (idx === undefined) return '';





        return row[idx]?.toString().trim() || '';





      };





      const parseBoolean = (value: string) => ['oui', 'true', '1'].includes(value.toLowerCase());





      const importedToys: InventoryItem[] = [];





      for (let i = 1; i < rows.length; i++) {





        const row = rows[i];





        if (!row || row.length === 0) continue;





        const name = getValue(row, 'nom');





        if (!name) continue;





        const idValue = getValue(row, 'id');





        const imageValue = getValue(row, 'image') || '/toys/placeholders/toy-placeholder.svg';





        const toy: InventoryItem = {





          id: idValue ? Number(idValue) || generateToyId() : generateToyId(),





          slug: generateSlug(name),





          name,





          category: getValue(row, 'categorie'),





          age: getValue(row, 'age'),





          price: getValue(row, 'prix') || 'Prix  dfinir',





          stock: getValue(row, 'stock') || '0',





          description: getValue(row, 'description'),





          image: imageValue,





          thumbnail: imageValue,





          hasImage: Boolean(imageValue && imageValue !== '/toys/placeholders/toy-placeholder.svg'),





          rating: '4',





          videoUrl: getValue(row, 'video url'),





          hasVideo: Boolean(getValue(row, 'video url')),





          source: 'import',





          isVisible: parseBoolean(getValue(row, 'visible') || 'oui'),





          isEditing: false,





          hasChanges: false,





        };





        importedToys.push(toy);





      }





      setToys(prev => [...prev, ...importedToys]);





      setImportFile(null);





      setShowImportModal(false);





      setImporting(false);





      showNotification(`${importedToys.length} jouet(s) import(s) avec succs !`);





      triggerRevalidation();





    } catch (error) {





      console.error('Erreur lors de l\'import:', error);





      setImporting(false);





      showNotification(`Erreur lors de l'import : ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');





    }





  };











  const handleOpenDepositModal = (toy: InventoryItem) => {





    setSelectedToyForDeposit(toy);





    const defaultBase: 'daily' | 'weekly' | 'monthly' =





      toy.rentalPriceWeekly ? 'weekly' : toy.rentalPriceMonthly ? 'monthly' : 'daily';





    setDepositBase(defaultBase);





    const currentBasePrice = getToyBasePrice(toy, defaultBase) || parsePriceValue(toy.price);





    if (currentBasePrice && toy.depositAmount) {





      setDepositPercent(Math.max(0, Math.round((Number(toy.depositAmount) / currentBasePrice) * 100)));





    } else {





      setDepositPercent(0);





    }





    setShowDepositModal(true);





  };











  const handleCloseDepositModal = () => {





    setShowDepositModal(false);





    setSelectedToyForDeposit(null);





  };











  const handleSaveDeposit = async () => {





    if (!selectedToyForDeposit) return;





    const depositValue = computeDepositValue(selectedToyForDeposit, depositPercent, depositBase);





    if (!depositValue) {





      showNotification('Impossible de calculer la caution. Vrifiez le prix de base.', 'error');





      return;





    }





    try {





      const payload: Record<string, unknown> = {





        name: selectedToyForDeposit.name || 'Jouet',





        depositAmount: depositValue,





      };





      if (selectedToyForDeposit.slug) payload.slug = selectedToyForDeposit.slug;





      const toyIdentifier = await resolveBackendId(selectedToyForDeposit);





      if (!toyIdentifier) {





        showNotification("Impossible de retrouvéer ce jouet dans la base. Merci de le synchroniser d'abord.", 'error');





        return;





      }





      const response = await fetch(`${API_BASE_URL}/toys/${toyIdentifier}`, {





        method: 'PATCH',





        headers: { 'Content-Type': 'application/json' },





        body: JSON.stringify(payload),





      });





      if (!response.ok) {





        const errorData = await response.json().catch(() => ({}));





        throw new Error(errorData.message || 'Erreur lors de la mise à jour de la caution');





      }





      setToys((prev) =>





        prev.map((toy) =>





          toy.id === selectedToyForDeposit.id





            ? { ...toy, depositAmount: depositValue }





            : toy,





        ),





      );





      showNotification('Caution mise à jour avec succs', 'success');





      handleCloseDepositModal();





      triggerRevalidation();





    } catch (error) {





      console.error('Erreur lors de la mise à jour de la caution:', error);





      showNotification(`Erreur: ${error instanceof Error ? error.message : 'Impossible de sauvegarder la caution'}`, 'error');





    }





  };











  const handleOpenPricingModal = (toy: InventoryItem) => {





    setSelectedToyForPricing(toy);





    const dailyPrice = (toy as any).rentalPriceDaily || parseFloat(toy.price?.replace(/[^\d.]/g, '') || '25');





    const weeklyPrice = (toy as any).rentalPriceWeekly || (dailyPrice * 4.8);





    const monthlyPrice = (toy as any).rentalPriceMonthly || (dailyPrice * 15);





    setEditedPrices({ daily: dailyPrice, weekly: weeklyPrice, monthly: monthlyPrice });





    setShowPricingModal(true);





  };











  const handleClosePricingModal = () => {





    setShowPricingModal(false);





    setSelectedToyForPricing(null);





  };











  const handleOpenStockModal = (toy: InventoryItem) => {





    setSelectedToyForStock(toy);





    setEditedStock(parseInt(String(toy.stock || '0')));





    setShowStockModal(true);





  };











  const handleCloseStockModal = () => {





    setShowStockModal(false);





    setSelectedToyForStock(null);





  };











  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {





    const file = event.target.files?.[0];





    if (file) {





      if (!file.type.startsWith('image/')) {





        alert('Veuillez slectionner un fichier image valide');





        return;





      }





      if (file.size > 5 * 1024 * 1024) {





        alert('L\'image ne doit pas dpasser 5MB');





        return;





      }





      setSelectedFile(file);





      const imageUrl = URL.createObjectURL(file);





      setNewToy({ ...newToy, image: imageUrl, hasImage: true });





    }





  };











  const handleEditImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {





    const file = event.target.files?.[0];





    if (file) {





      if (!file.type.startsWith('image/')) {





        alert('Veuillez slectionner un fichier image valide');





        return;





      }





      if (file.size > 5 * 1024 * 1024) {





        alert('L\'image ne doit pas dpasser 5MB');





        return;





      }





      setSelectedFile(file);





      const imageUrl = URL.createObjectURL(file);





      if (editingToy) {





        setEditingToy({ ...editingToy, image: imageUrl, hasImage: true });





      }





    }





  };











  const handleAddToy = async () => {





    if (!newToy.name) {





      showNotification('Veuillez remplir au moins le nom du jouet', 'error');





      return;





    }





    if (newToy.hasVideo && newToy.videoUrl && !isValidYouTubeUrl(newToy.videoUrl)) {





      showNotification('Veuillez entrer une URL YouTube valide ou dcocher "Afficher le bouton vido"', 'error');





      return;





    }





    let finalImageUrl = newToy.image || '/toys/placeholders/toy-placeholder.svg';











    if (selectedFile) {





      try {





        finalImageUrl = await uploadImage(selectedFile);





      } catch (error) {





        showNotification('Erreur lors de l\'upload de l\'image', 'error');





        return;





      }





    }











    const toyToAdd: InventoryItem = {





      id: generateToyId(),





      slug: generateSlug(newToy.name),





      name: newToy.name,





      price: 'Prix  dfinir',





      category: newToy.category || '',





      age: newToy.age || '',





      description: newToy.description || '',





      image: finalImageUrl,





      thumbnail: finalImageUrl,





      hasImage: newToy.hasImage || false,





      rating: '4',





      stock: '1',





      videoUrl: newToy.videoUrl || '',





      hasVideo: newToy.hasVideo || false,





      source: 'admin',





      isVisible: newToy.isVisible || true,





      isEditing: false,





      hasChanges: false





    };





    setToys(prev => [toyToAdd, ...prev]);





    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);





    setHighlightedToyId(toyToAdd.id);





    highlightTimeoutRef.current = setTimeout(() => {





      setHighlightedToyId(null);





    }, 2000);





    setNewToy({





      name: '',





      category: '',





      age: '',





      description: '',





      image: '/toys/placeholders/toy-placeholder.svg',





      hasImage: false,





      isVisible: true,





      isEditing: false,





      hasChanges: false,





      hasVideo: false,





      videoUrl: '',





    });





    setSelectedFile(null);





    setShowAddForm(false);





    showNotification('Jouet ajout avec succs !');





    triggerRevalidation();





  };











  const handleCancelAdd = () => {





    setNewToy({





      name: '',





      category: '',





      age: '',





      description: '',





      image: '/toys/placeholders/toy-placeholder.svg',





      hasImage: false,





      isVisible: true,





      isEditing: false,





      hasChanges: false,





      hasVideo: false,





      videoUrl: '',





    });





    setShowAddForm(false);





  };











  const startEditing = (toy: InventoryItem) => {





    setEditingToy({ ...toy, isEditing: true });





  };











  const cancelEditing = () => {





    setEditingToy(null);





    setSelectedFile(null);





  };











  const saveChanges = async (updatedToy: InventoryItem) => {





    if (!updatedToy) return;





    if (updatedToy.hasVideo && updatedToy.videoUrl && !isValidYouTubeUrl(updatedToy.videoUrl)) {





      showNotification('Veuillez entrer une URL YouTube valide ou dcocher "Afficher le bouton vido"', 'error');





      return;





    }





    const trimmedName = updatedToy.name?.trim();





    if (!trimmedName) {





      showNotification('Veuillez remplir au moins le nom du jouet', 'error');





      return;





    }





    const toyIdentifier = await resolveBackendId(updatedToy);





    if (!toyIdentifier) {





      showNotification("Impossible de retrouvéer ce jouet dans la base. Merci de le synchroniser d'abord.", 'error');





      return;





    }





    const payload: Record<string, unknown> = {





      name: trimmedName,





      description: updatedToy.description || '',





      isActive: updatedToy.isVisible !== false,





    };





    if (updatedToy.category) {





      const categoryObj = categories.find(c => c.name === updatedToy.category);





      if (categoryObj) payload.categoryIds = [categoryObj.id];





    }











    // Handle Image Upload





    if (selectedFile) {





      try {





        const uploadedUrl = await uploadImage(selectedFile);





        payload.images = [{ url: uploadedUrl, isPrimary: true }];





      } catch (error) {





        showNotification('Erreur lors de l\'upload de l\'image', 'error');





        setIsSaving(false);





        return;





      }





    }





    const parseAgeLabelToRange = (label?: string) => {





      if (!label) return null;





      const normalized = label.toLowerCase().trim();





      if (normalized.includes('tous')) return { ageMin: 0, ageMax: 18 };





      const numbers = normalized.match(/\d+/g);





      if (!numbers || numbers.length === 0) return null;





      const includesMonths = normalized.includes('mois');





      const clampYear = (value: number) => Math.max(0, Math.min(18, value));





      const convertValue = (value: number) => {





        if (includesMonths) {





          const years = Math.ceil(value / 12);





          return clampYear(years);





        }





        return clampYear(value);





      };





      const first = convertValue(parseInt(numbers[0], 10));





      const second = numbers[1] ? convertValue(parseInt(numbers[1], 10)) : null;





      if (normalized.includes('+')) return { ageMin: first, ageMax: 18 };





      const ageMin = first;





      const ageMax = second !== null ? Math.max(first, second) : first;





      return { ageMin, ageMax };





    };





    const ageRangeValues = parseAgeLabelToRange(updatedToy.age);





    if (ageRangeValues) {





      payload.ageMin = ageRangeValues.ageMin;





      payload.ageMax = ageRangeValues.ageMax;





    }





    payload.videoUrl = updatedToy.hasVideo ? (updatedToy.videoUrl || '') : null;





    setIsSaving(true);





    try {





      const response = await fetch(`${API_BASE_URL}/toys/${toyIdentifier}`, {





        method: 'PATCH',





        headers: { 'Content-Type': 'application/json' },





        body: JSON.stringify(payload),





      });





      if (!response.ok) {





        const err = await response.json().catch(() => ({}));





        throw new Error(err.message || 'Erreur lors de la sauvegarde du jouet');





      }





      await response.json().catch(() => null);





      showNotification('Jouet modifi avec succs !', 'success');





      setEditingToy(null);





      setSelectedFile(null);





      await loadInventory();





      triggerRevalidation();





    } catch (error) {





      console.error('Erreur lors de la sauvegarde du jouet:', error);





      showNotification(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde du jouet', 'error');





    } finally {





      setIsSaving(false);





    }





  };











  const deleteToy = async (toyId: string | number, skipConfirm = false) => {





    try {





      const idStr = String(toyId);





      const targetToy = toys.find((t) => String(t.id) === idStr || String(t.backendId) === idStr);





      const backendId = targetToy?.backendId || idStr;





      const toyLabel = targetToy?.name ? ` "${targetToy.name}"` : '';





      if (!skipConfirm && !window.confirm(`Supprimer${toyLabel} ?`)) return;





      setDeletingIds((prev) => {





        const next = new Set(prev);





        next.add(idStr);





        next.add(String(backendId));





        return next;





      });





      // Rsout l'ID backend (slug -> id) pour viter les faux ids alatoires





      const resolvedId = backendId || (targetToy ? await resolveBackendId(targetToy as InventoryItem) : null);





      if (!resolvedId) {





        showNotification('Impossible de retrouvéer ce jouet dans la base (slug/id introuvéable)', 'error');





        return;





      }











      const attemptDelete = async (targetId: string) => {





        const res = await fetch(`${API_BASE_URL}/toys/${targetId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });





        if (!res.ok) {





          const err = await res.json().catch(() => ({}));





          throw new Error(err.message || `Suppression impossible (${res.status})`);





        }





      };











      try {





        await attemptDelete(resolvedId);





      } catch (e) {





        // Dernire chance: re-rsoudre via slug puis retenter une fois





        const retryId = targetToy ? await resolveBackendId(targetToy as InventoryItem) : null;





        if (retryId && retryId !== resolvedId) {





          await attemptDelete(retryId);





        } else {





          throw e;





        }





      }











      setToys((prev) => prev.filter((t) => String(t.backendId ?? t.id) !== idStr && String(t.id) !== idStr && String(t.backendId) !== backendId));





      setSelectedIds((prev) => {





        const next = new Set(prev);





        next.delete(String(toyId));





        next.delete(String(backendId));





        next.delete(idStr);





        return next;





      });





      showNotification('Jouet supprim', 'success');





      triggerRevalidation();





    } catch (error) {





      console.error('Erreur suppression jouet:', error);





      showNotification(error instanceof Error ? error.message : 'Erreur suppression', 'error');





    } finally {





      setDeletingIds((prev) => {





        const next = new Set(prev);





        next.delete(String(toyId));





        const targetToy = toys.find((t) => String(t.id) === String(toyId) || String(t.backendId) === String(toyId));





        if (targetToy?.backendId) next.delete(String(targetToy.backendId));





        return next;





      });





    }





  };











  const deleteSelected = async () => {





    if (selectedIds.size === 0) return;





    const ids = Array.from(selectedIds);





    if (!window.confirm(`Supprimer ${ids.length} jouet(s) ?`)) return;





    setBulkDeleting(true);





    setDeletingIds((prev) => {





      const next = new Set(prev);





      ids.forEach((id) => next.add(String(id)));





      return next;





    });











    const results = await Promise.allSettled(ids.map((id) => deleteToy(id, true)));





    const failed = results.filter((r) => r.status === 'rejected').length;





    const succeeded = ids.length - failed;











    if (succeeded > 0) {





      showNotification(`${succeeded} jouet(s) supprim(s)`, failed ? 'error' : 'success');





    }





    if (failed > 0) {





      showNotification(`${failed} suppression(s) en chec (voir console)`, 'error');





    }











    clearSelection();





    await loadInventory();





    triggerRevalidation();





    setBulkDeleting(false);





  };











  const toggleVisibilitéy = (toyId: number | string) => {





    const id = typeof toyId === 'string' ? Number(toyId) : toyId;





    setToys(prev => prev.map(toy =>





      toy.id === id ? { ...toy, isVisible: !toy.isVisible } : toy





    ));





  };











  const isValidYouTubeUrl = (url: string): boolean => {





    if (!url) return false;





    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;





    return youtubeRegex.test(url);





  };











  const getCategories = () => {





    const categories = new Set<string>();





    toys.forEach(toy => {





      if (toy.category) {





        toy.category.split(',').forEach(cat => categories.add(cat.trim()));





      }





    });





    return Array.from(categories);





  };











  const categoryOptions = categories.length > 0





    ? categories.map(c => c.name)





    : [





      'Jeux de construction', 'Puzzles et casse-ttes', 'Jeux ducatifs', 'Jouets lectroniques',





      'Jeux de socit', 'Jouets cratifs', 'Jouets de plein air', 'Poupes et accessoires',





      'Vhicules et circuits', 'Instruments de musique', 'Jeux de rle', 'Jouets scientifiques', 'Autres'





    ];











  const [selectedFile, setSelectedFile] = useState<File | null>(null);











  const uploadImage = async (file: File): Promise<string> => {





    const formData = new FormData();





    formData.append('file', file);





    const response = await fetch(`${API_BASE_URL}/upload`, {





      method: 'POST',





      body: formData,





    });





    if (!response.ok) {





      throw new Error('Upload failed');





    }





    const data = await response.json();





    return data.url;





  };











  const filteredToys = toys





    .filter((toy) => {





      const normalizedQuery = normalize(searchQuery);





      const nameField = normalize(toy.name);





      const matchesSearch = !normalizedQuery ? true : nameField.includes(normalizedQuery);





      const normalizedFilterCategory = normalize(filterCategory);





      const categoryNormalized = normalize(toy.category);





      const matchesCategory =





        filterCategory === "all" ||





        categoryNormalized.includes(normalizedFilterCategory);





      const matchesVisibilitéy =





        filterVisibilitéy === "all" ||





        (filterVisibilitéy === "visible" && toy.isVisible) ||





        (filterVisibilitéy === "hidden" && !toy.isVisible);





      return matchesSearch && matchesCategory && matchesVisibilitéy;





    })





    .sort((a, b) => {





      // Simple sort by ID descending (newest first)





      return Number(b.id) - Number(a.id);





    });











  const getSelectionKey = (target: InventoryItem | string | number) =>





    typeof target === 'object' ? String(target.backendId ?? target.id) : String(target);





  const isSelected = (target: InventoryItem | string | number) => selectedIds.has(getSelectionKey(target));





  const toggleSelect = (toy: InventoryItem) => {





    const key = getSelectionKey(toy);





    setSelectedIds((prev) => {





      const next = new Set(prev);





      if (next.has(key)) next.delete(key);





      else next.add(key);





      return next;





    });





  };





  const clearSelection = () => setSelectedIds(new Set());





  const toggleSelectAllFiltered = () => {





    setSelectedIds((prev) => {





      const next = new Set(prev);





      const keys = filteredToys.map((toy) => getSelectionKey(toy));





      const allSelected = keys.every((key) => next.has(key));





      if (allSelected) keys.forEach((key) => next.delete(key));





      else keys.forEach((key) => next.add(key));





      return next;





    });





  };











  const handleSelectSuggestion = (name: string) => {





    setSearchQuery(name);





    setSuggestions([]);





  };











  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {





    if (e.key === 'Enter') {





      setSuggestions([]);





    }





  };











  const handleSyncData = async () => {





    try {





      const res = await Promise.resolve() /* revalidate removed */;





      if (!res.ok) throw new Error('Revalidation failed');





      showNotification('Donnes rafrachies sur le site !', 'success');





      await loadInventory();





    } catch (e) {





      console.error(e);





      showNotification('Erreur lors du rafrachissement', 'error');





    }





  };











  // Placeholder for render





  return (





    <div className="min-h-screen bg-gray-50">





      {/* Admin Header */}





      <div className="bg-white border-b border-gray-200">





        <div className="mx-auto max-w-7xl px-4 py-4">





          <div className="flex items-center justify-between">





            <div className="flex items-center gap-4">





              <a href="/admin/dashboard" className="text-sm text-gray-600 hover:text-mint transition-colors"> ← Dashboard</a>





              <div className="h-6 w-px bg-gray-300"></div>





              <div>





                <h1 className="text-xl font-bold text-charcoal">Gestion Inventaire</h1>





                <p className="text-sm text-gray-600">Synchronisez et grez tous les jouets</p>





              </div>





            </div>





                        <div className="flex flex-wrap items-center gap-3 justify-end">





              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100">





                {backendStatus === 'checking' && <><RefreshCw className="h-4 w-4 text-gray-500 animate-spin" /><span className="text-xs text-gray-600">Connexion...</span></>}





                {backendStatus === 'connected' && <><div className="h-2 w-2 rounded-full bg-green-500"></div><span className="text-xs text-green-600">Connect</span></>}





                {backendStatus === 'error' && <><AlertCircle className="h-4 w-4 text-orange-500" /><span className="text-xs text-orange-600">Hors ligne</span></>}





              </div>





              <div className="text-sm text-gray-600">{toys.length} jouets | {toys.filter(t => t.isVisible).length} visibles</div>





              <div className="flex items-center gap-2">





                <button onClick={handleExportCSV} disabled={exporting || toys.length === 0} className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">





                  {exporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} <span className="hidden sm:inline">Exporter</span>





                </button>





                <button onClick={() => setShowImportModal(true)} disabled={importing} className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">





                  <Upload className="h-4 w-4" /> <span className="hidden sm:inline">Importer</span>





                </button>





                <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 rounded-lg bg-mint px-4 py-2 text-sm font-medium text-white hover:bg-mint/90 transition-colors">





                  <Plus className="h-4 w-4" /> Ajouter





                </button>





              </div>





            </div>





          </div>





        </div>





      </div>











      <div className="mx-auto max-w-7xl px-4 py-8">





        {/* Filters */}





        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm border border-gray-100">





          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">





            <div>





              <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>





              <div className="relative">





                <input type="text" placeholder="Nom du jouet..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearchKeyDown} className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint" />





                {suggestions.length > 0 && (





                  <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">





                    {suggestions.map((name) => (





                      <button key={name} type="button" onClick={() => handleSelectSuggestion(name)} className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-mint/10">{name}</button>





                    ))}





                  </div>





                )}





              </div>





            </div>





            <div>





              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>





              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint">





                <option value="all">Toutes les catégories</option>





                {getCategories().map(category => <option key={category} value={category}>{category}</option>)}





              </select>





            </div>





            <div>





              <label className="block text-sm font-medium text-gray-700 mb-1">Visibilité</label>





              <select value={filterVisibilitéy} onChange={(e) => setFilterVisibilitéy(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint">





                <option value="all">Tous</option>





                <option value="visible">Visibles</option>





                <option value="hidden">Masqus</option>





              </select>





            </div>





            <div className="flex items-end">





              <button onClick={() => { setSearchQuery(""); setFilterCategory("all"); setFilterVisibilitéy("all"); }} className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Réinitialiser</button>





            </div>





          </div>





        </div>











        {/* Bulk Actions */}





        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">





          <div className="flex items-center gap-3">





            <label className="inline-flex items-center gap-2 text-sm text-gray-700">





              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-mint focus:ring-mint" onChange={toggleSelectAllFiltered} checked={filteredToys.length > 0 && filteredToys.every((toy) => isSelected(toy))} />





              Sélectionner (filtr)





            </label>





            {selectedIds.size > 0 && <span className="text-xs text-gray-500">{selectedIds.size} slectionn(s)</span>}





          </div>





          <div className="flex gap-2">





            <button





              onClick={deleteSelected}





              disabled={selectedIds.size === 0 || bulkDeleting}





              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"





            >





              {bulkDeleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}





              {bulkDeleting ? 'Suppression...' : 'Supprimer la slection'}





            </button>





            {selectedIds.size > 0 && <button onClick={clearSelection} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Annuler la slection</button>}





          </div>





        </div>











        {/* Grid */}





        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">





          {filteredToys.map((toy, index) => {





            const rawAvailable = Number(toy.availableQuantity ?? toy.stockQuantity ?? toy.stock ?? 0);
            const stockValue = Number.isFinite(rawAvailable) ? Math.max(0, rawAvailable) : 0;





            const hasStock = Number.isFinite(stockValue) && stockValue > 0;





            const selectionKey = getSelectionKey(toy);





            const isDeleting = deletingIds.has(selectionKey);





            return (





              <div key={`${toy.id}-${index}`} className={`rounded-xl bg-white p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:scale-[1.02] ${highlightedToyId === toy.id ? 'ring-2 ring-mint shadow-lg animate-pulse' : ''}`}>





                <div className="relative h-32 bg-gray-50 rounded-lg mb-3 overflow-hidden">





                  <div className="absolute left-2 top-2 z-10 rounded-full bg-white/80 p-1 border border-gray-200 shadow-sm">





                    <input type="checkbox" checked={isSelected(toy)} onChange={() => toggleSelect(toy)} className="h-4 w-4 rounded border-gray-300 text-mint focus:ring-mint" />





                  </div>





                  {toy.hasImage ? (





                    <Image src={toy.image} alt={toy.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 25vw" />





                  ) : (





                    <div className="flex items-center justify-center h-full bg-gray-100"><Package className="h-8 w-8 text-gray-400" /></div>





                  )}





                  <div className="absolute top-2 right-2 flex gap-1 flex-wrap">





                    {!toy.hasImage && <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">Pas d'image</div>}





                    {!toy.isVisible && <div className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">Masqu</div>}





                  </div>





                </div>





                <div className="space-y-2">





                  <h3 className="font-semibold text-charcoal text-sm line-clamp-2">{toy.name}</h3>





                  {toy.category && <p className="text-xs text-gray-600 line-clamp-1">{toy.category}</p>}





                  <div className="grid grid-cols-3 gap-1 text-[11px] font-semibold">





                    <div className="rounded-md bg-amber-50 border border-amber-200 px-2 py-1 text-center">





                      <p className="text-amber-700 uppercase">1j</p>





                      <p className="text-sm font-bold text-amber-900 truncate">{formatPriceDisplay(toy.rentalPriceDaily)}</p>





                    </div>





                    <div className="rounded-md bg-mint/10 border border-mint/40 px-2 py-1 text-center">





                      <p className="text-mint uppercase">1 sem.</p>





                      <p className="text-sm font-bold text-emerald-900 truncate">{formatPriceDisplay(toy.rentalPriceWeekly || toy.price)}</p>





                    </div>





                    <div className="rounded-md bg-purple-50 border border-purple-200 px-2 py-1 text-center">





                      <p className="text-purple-700 uppercase">1 mois</p>





                      <p className="text-sm font-bold text-purple-900 truncate">{formatPriceDisplay(toy.rentalPriceMonthly)}</p>





                    </div>





                  </div>





                </div>





                <div className="mt-3 space-y-2">





                  <div className="flex gap-1">





                    <button onClick={() => toggleVisibilitéy(toy.id)} className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${toy.isVisible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>





                      {toy.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />} {toy.isVisible ? 'Visible' : 'Masqu'}





                    </button>





                    <button onClick={() => startEditing(toy)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200">





                      <Edit className="h-3 w-3" /> Modifier





                    </button>





                    <button





                      onClick={() => deleteToy(toy.id)}





                      disabled={isDeleting}





                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-60"





                    >





                      {isDeleting ? <RefreshCw className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}





                      {isDeleting ? 'Suppression...' : 'Supprimer'}





                    </button>





                  </div>





                  <button onClick={() => handleOpenDepositModal(toy)} className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium bg-orange-50 text-orange-600 hover:bg-orange-100">





                    <Shield className="h-3 w-3" /> Caution (%)





                  </button>





                  <button onClick={() => handleOpenPricingModal(toy)} className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium bg-mint/10 text-mint hover:bg-mint/20">





                    <DollarSign className="h-3 w-3" /> Grer les prix





                  </button>





                  <button onClick={() => handleOpenStockModal(toy)} className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-semibold border ${hasStock ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>





                    <div className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> Stock</div>





                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${hasStock ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{stockValue}</span>





                  </button>





                </div>





              </div>





            );





          })}





        </div>











        {filteredToys.length === 0 && (





          <div className="text-center py-12">





            <Package className="mx-auto h-12 w-12 text-gray-400" />





            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun jouet trouvé</h3>





          </div>





        )}





      </div>











      {/* Edit Modal */}





      {editingToy && (





        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200 p-4">





          <div className="w-full max-w-2xl max-h-[90vh] rounded-xl bg-white shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex flex-col">





            <div className="p-6 border-b border-gray-200 flex items-center justify-between">





              <h2 className="text-xl font-bold text-charcoal">Modifier le jouet</h2>





              <button onClick={cancelEditing} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>





            </div>





            <div className="flex-1 overflow-y-auto p-6 space-y-6">





              <div className="bg-gray-50 rounded-lg p-4 space-y-4">





                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Package className="h-5 w-5 text-mint" /> Informations</h3>





                <div className="grid gap-4 sm:grid-cols-2">





                  <div>





                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>





                    <input type="text" value={editingToy.name} onChange={(e) => setEditingToy({ ...editingToy, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />





                  </div>





                  <div>





                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>





                    <select value={editingToy.category} onChange={(e) => setEditingToy({ ...editingToy, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg">





                      <option value="">Sélectionner</option>





                      {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}





                    </select>





                  </div>





                </div>





                <div>





                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>





                  <textarea value={editingToy.description} onChange={(e) => setEditingToy({ ...editingToy, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={3} />





                </div>





              </div>





              <div className="bg-gray-50 rounded-lg p-4 space-y-4">





                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Upload className="h-5 w-5 text-mint" /> Image</h3>





                <div className="flex items-center gap-4">





                  <div className="relative h-24 w-24 bg-white rounded-lg border border-gray-200 overflow-hidden">





                    {editingToy.image && !editingToy.image.includes('placeholder') ? (





                      <Image src={editingToy.image} alt="Preview" fill className="object-cover" />





                    ) : (





                      <div className="flex items-center justify-center h-full"><Package className="h-8 w-8 text-gray-300" /></div>





                    )}





                  </div>





                  <div className="flex-1">





                    <input type="file" accept="image/*" onChange={handleEditImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-mint/10 file:text-mint hover:file:bg-mint/20" />





                    <p className="mt-1 text-xs text-gray-500">JPG, PNG ou SVG. Max 5MB.</p>





                  </div>





                </div>





              </div>





            </div>





            <div className="p-6 border-t bg-gray-50 rounded-b-xl flex gap-3">





              <button onClick={() => saveChanges(editingToy)} disabled={isSaving} className="flex-1 bg-mint text-white py-2 rounded-lg hover:bg-mint/90">{isSaving ? 'Enregistrement...' : 'Sauvegarder'}</button>





              <button onClick={cancelEditing} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">Annuler</button>





            </div>





          </div>





        </div>





      )}











      {/* Add Modal */}





      {showAddForm && (





        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200 p-4">





          <div className="w-full max-w-2xl max-h-[90vh] rounded-xl bg-white shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex flex-col">





            <div className="p-6 border-b border-gray-200 flex items-center justify-between">





              <h2 className="text-xl font-bold text-charcoal">Ajouter un jouet</h2>





              <button onClick={handleCancelAdd} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>





            </div>





            <div className="flex-1 overflow-y-auto p-6 space-y-6">





              <div className="bg-gray-50 rounded-lg p-4 space-y-4">





                <div className="grid gap-4 sm:grid-cols-2">





                  <div>





                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>





                    <input type="text" value={newToy.name} onChange={(e) => setNewToy({ ...newToy, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />





                  </div>





                  <div>





                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>





                    <select value={newToy.category} onChange={(e) => setNewToy({ ...newToy, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg">





                      <option value="">Sélectionner</option>





                      {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}





                    </select>





                  </div>





                </div>





              </div>





              <div className="mt-4">





                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>





                <div className="flex items-center gap-4">





                  <div className="relative h-20 w-20 bg-white rounded-lg border border-gray-200 overflow-hidden">





                    {newToy.image && !newToy.image.includes('placeholder') ? (





                      <Image src={newToy.image} alt="Preview" fill className="object-cover" />





                    ) : (





                      <div className="flex items-center justify-center h-full"><Package className="h-6 w-6 text-gray-300" /></div>





                    )}





                  </div>





                  <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-mint/10 file:text-mint hover:file:bg-mint/20" />





                </div>





              </div>





            </div>





            <div className="p-6 border-t bg-gray-50 rounded-b-xl flex gap-3">





              <button onClick={handleAddToy} className="flex-1 bg-mint text-white py-2 rounded-lg hover:bg-mint/90">Ajouter</button>





              <button onClick={handleCancelAdd} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">Annuler</button>





            </div>





          </div>





        </div>





      )





      }











      {/* Deposit Modal */}





      {





        showDepositModal && selectedToyForDeposit && (





          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200 p-4">





            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl animate-in slide-in-from-bottom-4 duration-300">





              <div className="p-6 border-b border-gray-200 flex items-center justify-between">





                <h2 className="text-xl font-bold text-charcoal">Caution - {selectedToyForDeposit.name}</h2>





                <button onClick={handleCloseDepositModal} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>





              </div>





              <div className="p-6 space-y-4">





                <div className="grid gap-4 sm:grid-cols-2">





                  <div>





                    <label className="block text-sm font-medium text-gray-700 mb-1">Pourcentage</label>





                    <input type="number" min={0} value={depositPercent} onChange={(e) => setDepositPercent(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full border rounded-lg p-2" />





                  </div>





                  <div>





                    <label className="block text-sm font-medium text-gray-700 mb-1">Base</label>





                    <select value={depositBase} onChange={(e) => setDepositBase(e.target.value as any)} className="w-full border rounded-lg p-2">





                      <option value="daily">Journalier</option>





                      <option value="weekly">Hebdomadaire</option>





                      <option value="monthly">Mensuel</option>





                    </select>





                  </div>





                </div>





                <div className="bg-mint/5 p-4 rounded-xl">





                  <p>Caution calcule : <strong>{depositPreviewValue.toFixed(2)} MAD</strong></p>





                </div>





              </div>





              <div className="p-6 border-t bg-gray-50 rounded-b-xl flex gap-3">





                <button onClick={handleSaveDeposit} className="flex-1 bg-mint text-white py-2 rounded-lg hover:bg-mint/90">Mettre  jour</button>





                <button onClick={handleCloseDepositModal} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">Annuler</button>





              </div>





            </div>





          </div>





        )





      }











      {/* Pricing Modal */}





      {





        showPricingModal && selectedToyForPricing && (





          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200 p-4">





            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl animate-in slide-in-from-bottom-4 duration-300">





              <div className="p-6 border-b border-gray-200 flex items-center justify-between">





                <h2 className="text-xl font-bold text-charcoal">Grer les prix</h2>





                <button onClick={handleClosePricingModal} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>





              </div>





              <div className="p-6 space-y-4">





                <div>





                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix Journalier (MAD)</label>





                  <input type="number" value={editedPrices.daily} onChange={e => setEditedPrices({ ...editedPrices, daily: parseFloat(e.target.value) })} className="w-full border rounded-lg p-2" />





                </div>





                <div>





                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix Hebdomadaire (MAD)</label>





                  <input type="number" value={editedPrices.weekly} onChange={e => setEditedPrices({ ...editedPrices, weekly: parseFloat(e.target.value) })} className="w-full border rounded-lg p-2" />





                </div>





                <div>





                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix Mensuel (MAD)</label>





                  <input type="number" value={editedPrices.monthly} onChange={e => setEditedPrices({ ...editedPrices, monthly: parseFloat(e.target.value) })} className="w-full border rounded-lg p-2" />





                </div>





              </div>





              <div className="p-6 border-t bg-gray-50 rounded-b-xl flex gap-3">





                <button onClick={handleSavePricing} className="flex-1 bg-mint text-white py-2 rounded-lg hover:bg-mint/90">Sauvegarder</button>





                <button onClick={handleClosePricingModal} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">Annuler</button>





              </div>





            </div>





          </div>





        )





      }











      {/* Stock Modal */}





      {





        showStockModal && selectedToyForStock && (





          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200 p-4">





            <div className="w-full max-w-md rounded-xl bg-white shadow-xl animate-in slide-in-from-bottom-4 duration-300">





              <div className="p-6 border-b border-gray-200 flex items-center justify-between">





                <h2 className="text-xl font-bold text-charcoal">Grer le stock</h2>





                <button onClick={handleCloseStockModal} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>





              </div>





              <div className="p-6">





                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité en stock</label>





                <input type="number" value={editedStock} onChange={e => setEditedStock(parseInt(e.target.value))} className="w-full border rounded-lg p-2" />





              </div>





              <div className="p-6 border-t bg-gray-50 rounded-b-xl flex gap-3">





                <button onClick={handleSaveStock} className="flex-1 bg-mint text-white py-2 rounded-lg hover:bg-mint/90">Sauvegarder</button>





                <button onClick={handleCloseStockModal} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">Annuler</button>





              </div>





            </div>





          </div>





        )





      }











      {/* Import Modal */}





      {





        showImportModal && (





          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200 p-4">





            <div className="w-full max-w-md rounded-xl bg-white shadow-xl animate-in slide-in-from-bottom-4 duration-300">





              <div className="p-6 border-b border-gray-200 flex items-center justify-between">





                <h2 className="text-xl font-bold text-charcoal">Importer des jouets</h2>





                <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>





              </div>





              <div className="p-6 space-y-4">





                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-mint transition-colors">





                  <Upload className="mx-auto h-12 w-12 text-gray-400" />





                  <p className="mt-2 text-sm text-gray-600">Glissez votre fichier CSV/Excel ici ou cliquez pour slectionner</p>





                  <input type="file" accept=".csv,.xlsx,.xls" onChange={e => setImportFile(e.target.files?.[0] || null)} className="hidden" id="import-file" />





                  <label htmlFor="import-file" className="mt-4 inline-block px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">Sélectionner un fichier</label>





                  {importFile && <p className="mt-2 text-sm font-medium text-mint">{importFile.name}</p>}





                </div>





              </div>





              <div className="p-6 border-t bg-gray-50 rounded-b-xl flex gap-3">





                <button onClick={handleImportCSV} disabled={!importFile || importing} className="flex-1 bg-mint text-white py-2 rounded-lg hover:bg-mint/90 disabled:opacity-50">{importing ? 'Importation...' : 'Importer'}</button>





                <button onClick={() => setShowImportModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">Annuler</button>





              </div>





            </div>





          </div>





        )





      }





    </div >





  );





}














































