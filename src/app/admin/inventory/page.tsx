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
  TrendingUp,
  CheckCircle,
  Upload,
  Download,
  FileText,
  AlertCircle,
  RefreshCw,
  Shield
} from "lucide-react";
import { loadToysData, ToyData } from "@/lib/toys-data";

interface InventoryItem extends ToyData {
  isVisible: boolean;
  isEditing: boolean;
  hasChanges: boolean;
  // Prix individuels depuis le backend
  rentalPriceDaily?: number;
  rentalPriceWeekly?: number;
  rentalPriceMonthly?: number;
  depositAmount?: number;
  sku?: string;
}

// URL du backend API - utiliser une URL relative pour éviter Mixed Content
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
    'Tous âges',
  ];
  const [ageOptions, setAgeOptions] = useState<string[]>(defaultAgeOptions);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterVisibility, setFilterVisibility] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingToy, setEditingToy] = useState<InventoryItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // États pour la gestion des prix
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedToyForPricing, setSelectedToyForPricing] = useState<InventoryItem | null>(null);
  const [editedPrices, setEditedPrices] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
  });

  // États pour la gestion du stock
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedToyForStock, setSelectedToyForStock] = useState<InventoryItem | null>(null);
  const [editedStock, setEditedStock] = useState<number>(0);

  // États pour l'import/export
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [highlightedToyId, setHighlightedToyId] = useState<string | number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // État pour les notifications
  // Caution globale
  const [globalDepositPercent, setGlobalDepositPercent] = useState<number>(600);
  const [globalDepositBase, setGlobalDepositBase] = useState<'daily' | 'weekly' | 'monthly'>('daily'); const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });
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

  useEffect(() => {
    loadInventory();
    loadCategories();
    loadAgeOptions();
    checkBackendConnection();
  }, []);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  // Fonction helper pour générer un slug
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[ôö]/g, 'o')
      .replace(/[ûüù]/g, 'u')
      .replace(/[ïî]/g, 'i')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  };

  // Vérifier la connexion au backend
  const checkBackendConnection = async () => {
    try {
      setBackendStatus('checking');
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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

  // Fonction pour afficher les notifications
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({
      show: true,
      message,
      type
    });

    // Auto-hide après 3 secondes
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  const handleApplyGlobalDeposit = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/toys/deposit/bulk`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percentage: globalDepositPercent, base: globalDepositBase })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Échec de mise à jour de la caution');
      }
      const result = await response.json();
      showNotification(result.message || 'Caution mise à jour', 'success');
      await loadInventory();
    } catch (e) {
      console.error(e);
      showNotification('Erreur lors de la mise à jour de la caution', 'error');
    }
  };

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
  };

  const loadInventory = async () => {
    try {
      setLoading(true);
      // Essayer de charger depuis le backend d'abord
      try {
        const response = await fetch(`${API_BASE_URL}/toys?limit=500`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const apiItems = extractApiItems<any>(result.data);
            if (apiItems.length) {
              const inventoryItems: InventoryItem[] = apiItems.map((toy: any) => ({
                id: Number(toy.id) || generateToyId(),
                backendId: typeof toy.id === 'string' ? toy.id : (toy.id ? String(toy.id) : toy.slug),
                sku: toy.sku || undefined,
                slug: toy.slug || generateSlug(toy.name || ''),
                name: toy.name || '',
                price: `${toy.rentalPriceWeekly || toy.rentalPriceDaily || 0} MAD/semaine`,
                // Stocker les prix individuels depuis le backend
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
                stock: String(toy.stockQuantity || 0),
                videoUrl: toy.videoUrl || '',
                hasVideo: !!toy.videoUrl,
                source: 'backend',
                isVisible: toy.isActive !== false,
                isEditing: false,
                hasChanges: false
              }));
              setToys(inventoryItems);
              setLoading(false);
              return;
            }
          }
        }
      } catch (backendError) {
        console.warn('Erreur lors du chargement depuis le backend, utilisation des données locales:', backendError);
      }

      // Fallback: charger depuis les données locales
      const data = await loadToysData();
      const inventoryItems: InventoryItem[] = data.toys.map(toy => ({
        ...toy,
        sku: (toy as any).sku || undefined,
        isVisible: true,
        isEditing: false,
        hasChanges: false
      }));
      setToys(inventoryItems);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'inventaire:', error);
      setLoading(false);
      showNotification('Erreur lors du chargement de l\'inventaire', 'error');
    }
  };

  const normalizedInputQuery = normalize(searchQuery);
  const normalizedQuery = normalize(appliedQuery || searchQuery);
  const searchTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const normalizedFilterCategory = normalize(filterCategory);

  const computeSearchScore = (toy: InventoryItem) => {
    if (!normalizedQuery) return 0;
    const name = normalize(toy.name);
    if (name === normalizedQuery) return 100;
    if (name.startsWith(normalizedQuery)) return 80;
    return 0;
  };

  // Suggestions auto-compltion (nom uniquement)
  useEffect(() => {
    if (!normalizedInputQuery || normalizedInputQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    const seen = new Set<string>();
    const matches = toys
      .map((toy) => toy.name || "")
      .filter((name) => normalize(name).includes(normalizedInputQuery))
      .filter((name) => {
        const key = normalize(name);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 6);
    setSuggestions(matches);
  }, [normalizedInputQuery, toys]);

  // Nettoyage quand on efface la recherche
  useEffect(() => {
    if (!searchQuery.trim()) {
      setAppliedQuery("");
      setSuggestions([]);
    }
  }, [searchQuery]);

  const applySearch = () => {
    const trimmed = searchQuery.trim();
    setAppliedQuery(trimmed);
    setSuggestions([]);
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applySearch();
    }
  };

  const handleSelectSuggestion = (name: string) => {
    setSearchQuery(name);
    setAppliedQuery(name);
    setSuggestions([]);
  };

  const filteredToys = toys
    .filter((toy) => {
      // Recherche stricte sur le nom uniquement (évite les conflits catégorie/description)
      const nameField = normalize(toy.name);

      const matchesSearch = !normalizedQuery ? true : nameField.includes(normalizedQuery);

      const categoryNormalized = normalize(toy.category);
      const matchesCategory =
        filterCategory === "all" ||
        categoryNormalized.includes(normalizedFilterCategory);

      const matchesVisibility =
        filterVisibility === "all" ||
        (filterVisibility === "visible" && toy.isVisible) ||
        (filterVisibility === "hidden" && !toy.isVisible);

      return matchesSearch && matchesCategory && matchesVisibility;
    })
    .sort((a, b) => computeSearchScore(b) - computeSearchScore(a));

  const getSelectionKey = (target: InventoryItem | string | number) =>
    typeof target === 'object' ? String(target.backendId ?? target.id) : String(target);

  const isSelected = (target: InventoryItem | string | number) => selectedIds.has(getSelectionKey(target));
  const toggleSelect = (toy: InventoryItem) => {
    const key = getSelectionKey(toy);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());
  const toggleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const keys = filteredToys.map((toy) => getSelectionKey(toy));
      const allSelected = keys.every((key) => next.has(key));
      if (allSelected) {
        keys.forEach((key) => {
          next.delete(key);
        });
      } else {
        keys.forEach((key) => {
          next.add(key);
        });
      }
      return next;
    });
  };

  const toggleVisibility = (toyId: number | string) => {
    const id = typeof toyId === 'string' ? Number(toyId) : toyId;
    setToys(prev => prev.map(toy =>
      toy.id === id ? { ...toy, isVisible: !toy.isVisible } : toy
    ));
  };

  const startEditing = (toy: InventoryItem) => {
    setEditingToy({ ...toy, isEditing: true });
  };

  const deleteToy = async (toyId: string | number) => {
    try {
      const idStr = String(toyId);
      const targetToy = toys.find((t) => String(t.id) === idStr || String(t.backendId) === idStr);
      const backendId = targetToy?.backendId || idStr;
      const toyLabel = targetToy?.name ? ` "${targetToy.name}"` : '';

      if (!window.confirm(`Supprimer${toyLabel} ?`)) return;

      const res = await fetch(`${API_BASE_URL}/toys/${backendId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Suppression impossible');
      }
      setToys((prev) => prev.filter((t) => String(t.backendId ?? t.id) !== idStr && String(t.id) !== idStr && String(t.backendId) !== backendId));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(String(toyId));
        next.delete(String(backendId));
        next.delete(idStr);
        return next;
      });
      showNotification('Jouet supprimé', 'success');
    } catch (error) {
      console.error('Erreur suppression jouet:', error);
      showNotification(error instanceof Error ? error.message : 'Erreur suppression', 'error');
    }
  };
  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    if (!window.confirm(`Supprimer ${ids.length} jouet(s) ?`)) return;
    for (const id of ids) {
      await deleteToy(id);
    }
    clearSelection();
  };

  const resolveBackendId = async (toy: InventoryItem): Promise<string | null> => {
    if (toy.backendId) {
      return toy.backendId;
    }

    const slugCandidate = toy.slug || generateSlug(toy.name || '');
    if (!slugCandidate) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/toys?search=${encodeURIComponent(slugCandidate)}&limit=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      const items = extractApiItems<any>(result?.data);
      const match = items.find((item) => item.slug === toy.slug || item.name?.toLowerCase() === toy.name?.toLowerCase());
      return match?.id || null;
    } catch (error) {
      console.error('Erreur lors de la résolution de l’ID du jouet:', error);
      return null;
    }
  };

  const saveChanges = async (updatedToy: InventoryItem) => {
    if (!updatedToy) return;

    if (updatedToy.hasVideo && updatedToy.videoUrl && !isValidYouTubeUrl(updatedToy.videoUrl)) {
      showNotification('Veuillez entrer une URL YouTube valide ou décocher "Afficher le bouton vidéo"', 'error');
      return;
    }

    const trimmedName = updatedToy.name?.trim();
    if (!trimmedName) {
      showNotification('Veuillez remplir au moins le nom du jouet', 'error');
      return;
    }

    const toyIdentifier = await resolveBackendId(updatedToy);
    if (!toyIdentifier) {
      showNotification("Impossible de retrouver ce jouet dans la base. Merci de le synchroniser d'abord.", 'error');
      return;
    }

    const payload: Record<string, unknown> = {
      name: trimmedName,
      description: updatedToy.description || '',
      isActive: updatedToy.isVisible !== false,
    };

    // Find category ID
    if (updatedToy.category) {
      const categoryObj = categories.find(c => c.name === updatedToy.category);
      if (categoryObj) {
        payload.categoryIds = [categoryObj.id];
      }
    }

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Erreur lors de la sauvegarde du jouet');
      }

      await response.json().catch(() => null);
      showNotification('Jouet modifié avec succès !', 'success');
      setEditingToy(null);
      await loadInventory();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du jouet:', error);
      showNotification(
        error instanceof Error ? error.message : 'Erreur lors de la sauvegarde du jouet',
        'error',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEditing = () => {
    setEditingToy(null);
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

  // Options pour les catégories (dynamiques ou fallback)
  const categoryOptions = categories.length > 0
    ? categories.map(c => c.name)
    : [
      'Jeux de construction',
      'Puzzles et casse-têtes',
      'Jeux éducatifs',
      'Jouets électroniques',
      'Jeux de société',
      'Jouets créatifs',
      'Jouets de plein air',
      'Poupées et accessoires',
      'Véhicules et circuits',
      'Instruments de musique',
      'Jeux de rôle',
      'Jouets scientifiques',
      'Autres'
    ];

  const parseAgeLabelToRange = (label?: string) => {
    if (!label) return null;
    const normalized = label.toLowerCase().trim();

    if (normalized.includes('tous')) {
      return { ageMin: 0, ageMax: 18 };
    }

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

    if (normalized.includes('+')) {
      return {
        ageMin: first,
        ageMax: 18,
      };
    }

    const ageMin = first;
    const ageMax = second !== null ? Math.max(first, second) : first;
    return { ageMin, ageMax };
  };

  const generateToyId = () => {
    return Date.now() + Math.floor(Math.random() * 1000);
  };

  const formatAgeRange = (min?: number | string | null, max?: number | string | null) => {
    const nMin = Number(min);
    const nMax = Number(max);
    if (!Number.isFinite(nMin) && !Number.isFinite(nMax)) return '';
    if (Number.isFinite(nMin) && Number.isFinite(nMax)) {
      if (nMin === 0 && nMax === 18) return 'Tous âges';
      if (nMin === nMax) return `${nMin}+ ans`;
      return `${nMin}-${nMax} ans`;
    }
    if (Number.isFinite(nMin)) return `${nMin}+ ans`;
    if (Number.isFinite(nMax)) return `0-${nMax} ans`;
    return '';
  };

  const isValidYouTubeUrl = (url: string): boolean => {
    if (!url) return false;

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
  };

  // Fonction pour gérer l'upload d'image
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide');
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 5MB');
        return;
      }

      // Créer un URL temporaire pour l'aperçu
      const imageUrl = URL.createObjectURL(file);
      setNewToy({
        ...newToy,
        image: imageUrl,
        hasImage: true
      });
    }
  };


  const handleAddToy = async () => {
    if (!newToy.name) {
      showNotification('Veuillez remplir au moins le nom du jouet', 'error');
      return;
    }

    // Validation pour les vidéos YouTube
    if (newToy.hasVideo && newToy.videoUrl && !isValidYouTubeUrl(newToy.videoUrl)) {
      showNotification('Veuillez entrer une URL YouTube valide ou décocher "Afficher le bouton vidéo"', 'error');
      return;
    }

    const toyToAdd: InventoryItem = {
      id: generateToyId(),
      slug: generateSlug(newToy.name),
      name: newToy.name,
      price: 'Prix à définir', // Prix par défaut
      category: newToy.category || '',
      age: newToy.age || '',
      description: newToy.description || '',
      image: newToy.image || '/toys/placeholders/toy-placeholder.svg',
      thumbnail: newToy.image || '/toys/placeholders/toy-placeholder.svg',
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

    // POST to backend to persist the toy and get the backendId
    try {
      const response = await fetch(`${API_BASE_URL}/toys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: toyToAdd.name,
          slug: toyToAdd.slug,
          description: toyToAdd.description || '',
          isActive: true,
          isFeatured: false,
          stockQuantity: 1,
          availableQuantity: 1,
          images: toyToAdd.image && toyToAdd.image !== '/toys/placeholders/toy-placeholder.svg'
            ? [{ url: toyToAdd.image, isPrimary: true }]
            : [],
          videoUrl: newToy.hasVideo ? newToy.videoUrl : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Échec création jouet sur le serveur');
      }

      const createdToy = await response.json();
      toyToAdd.backendId = createdToy.id;
      console.log('[handleAddToy] Jouet créé avec backendId:', createdToy.id);

    } catch (error) {
      console.error('[handleAddToy] Erreur création:', error);
      showNotification('Erreur création jouet: ' + (error as Error).message, 'error');
      return;
    }

    setToys(prev => [toyToAdd, ...prev]);
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
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
    setShowAddForm(false);
    showNotification('Jouet ajouté avec succès !');
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

  // Fonctions de gestion des prix
  const handleOpenPricingModal = (toy: InventoryItem) => {
    setSelectedToyForPricing(toy);

    // Extraire les prix depuis le jouet (depuis le backend ou valeurs par défaut)
    const dailyPrice = (toy as any).rentalPriceDaily || parseFloat(toy.price?.replace(/[^\d.]/g, '') || '25');
    const weeklyPrice = (toy as any).rentalPriceWeekly || (dailyPrice * 4.8); // 20% de réduction
    const monthlyPrice = (toy as any).rentalPriceMonthly || (dailyPrice * 15); // 50% de réduction

    setEditedPrices({
      daily: dailyPrice,
      weekly: weeklyPrice,
      monthly: monthlyPrice,
    });

    setShowPricingModal(true);
  };

  const handleClosePricingModal = () => {
    setShowPricingModal(false);
    setSelectedToyForPricing(null);
  };

  const handleSavePricing = async () => {
    if (!selectedToyForPricing) return;

    try {
      const toyIdentifier = await resolveBackendId(selectedToyForPricing);
      if (!toyIdentifier) {
        showNotification("Impossible de retrouver ce jouet dans la base. Merci de le synchroniser d'abord.", 'error');
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pricingData),
      });

      if (response.ok) {
        const result = await response.json();

        // Mettre à jour le jouet dans la liste locale avec les nouveaux prix
        setToys(prev => prev.map(toy =>
          toy.id === selectedToyForPricing.id
            ? {
              ...toy,
              price: `${editedPrices.weekly.toFixed(0)} MAD/semaine`,
              // Stocker les prix individuels pour référence
              rentalPriceDaily: editedPrices.daily,
              rentalPriceWeekly: editedPrices.weekly,
              rentalPriceMonthly: editedPrices.monthly,
              promotion: selectedToyForPricing.promotion
            }
            : toy
        ));

        handleClosePricingModal();
        showNotification('Prix et promotions sauvegardés avec succès dans le backend !', 'success');

        // Recharger l'inventaire pour synchroniser avec le backend
        await loadInventory();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde des prix');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des prix:', error);
      showNotification(`Erreur: ${error instanceof Error ? error.message : 'Impossible de sauvegarder les prix'}`, 'error');
    }
  };

  // Gestion du stock
  const handleOpenStockModal = (toy: InventoryItem) => {
    setSelectedToyForStock(toy);
    setEditedStock(parseInt(String(toy.stock || '0')));
    setShowStockModal(true);
  };

  const handleCloseStockModal = () => {
    setShowStockModal(false);
    setSelectedToyForStock(null);
  };

  const handleSaveStock = async () => {
    if (!selectedToyForStock) {
      return;
    }

    try {
      const toyIdentifier = await resolveBackendId(selectedToyForStock);
      if (!toyIdentifier) {
        showNotification("Impossible de retrouver ce jouet dans la base. Merci de le synchroniser d'abord.", 'error');
        return;
      }

      const newStock = Number(editedStock) || 0;
      const response = await fetch(`${API_BASE_URL}/toys/${toyIdentifier}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stockQuantity: newStock,
          availableQuantity: newStock,
          status: newStock > 0 ? 'available' : 'maintenance'
        }),
      });

      if (!response.ok) {
        let err: any = {};
        try {
          err = await response.json();
        } catch (e) {
          err = {};
        }
        const message = typeof err === 'object' && err ? err.message : null;
        throw new Error(message || 'Erreur lors de la sauvegarde du stock');
      }

      setBackendConnected(true);
      setBackendStatus('connected');

      setToys(prev => prev.map(toy =>
        toy.id === selectedToyForStock.id
          ? { ...toy, stock: String(newStock) }
          : toy
      ));

      handleCloseStockModal();
      showNotification(`Stock mis a jour : ${newStock > 0 ? `${newStock} unite(s) en stock` : 'Rupture de stock'}`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du stock:', error);
      showNotification(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde du stock', 'error');
    }
  };

  // Charger les tranches d'âges disponibles pour synchroniser le sélecteur
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
      // Fallback si vide
      setAgeOptions(defaultAgeOptions);
    } catch (error) {
      console.error('Erreur lors du chargement des âges:', error);
      setAgeOptions(defaultAgeOptions);
    }
  };

  // Fonction pour exporter les produits en CSV
  const handleExportCSV = async () => {
    try {
      setExporting(true);

      // Préparer les données CSV
      const headers = ['ID', 'Nom', 'Catégorie', 'Âge', 'Prix', 'Stock', 'Description', 'Visible', 'Image', 'Vidéo URL'];
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
        `"${toy.videoUrl || ''}"`
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Créer le fichier et le télécharger
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
      showNotification('Export CSV réussi !');
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      setExporting(false);
      showNotification('Erreur lors de l\'export CSV', 'error');
    }
  };

  // Fonction pour importer les produits depuis un CSV/XLS
  const handleImportCSV = async () => {
    if (!importFile) {
      showNotification('Veuillez sélectionner un fichier CSV ou Excel', 'error');
      return;
    }

    try {
      setImporting(true);
      const rows = await readFileRows(importFile);

      if (rows.length < 2) {
        throw new Error('Le fichier doit contenir au moins un en-tête et une ligne de données');
      }

      const headers = rows[0];
      const headerIndex = new Map<string, number>();
      headers.forEach((header, index) => {
        const normalized = normalizeHeader(header);
        if (normalized) {
          headerIndex.set(normalized, index);
        }
      });

      const missingHeaders = REQUIRED_IMPORT_HEADERS.filter((key) => !headerIndex.has(key));
      if (missingHeaders.length) {
        throw new Error(`Colonnes manquantes: ${missingHeaders.join(', ')}`);
      }

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
          price: getValue(row, 'prix') || 'Prix à définir',
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
      showNotification(`${importedToys.length} jouet(s) importé(s) avec succès !`);
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
      setDepositPercent(globalDepositPercent);
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
      showNotification('Impossible de calculer la caution. Vérifiez le prix de base.', 'error');
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        name: selectedToyForDeposit.name || 'Jouet',
        depositAmount: depositValue,
      };
      if (selectedToyForDeposit.slug) {
        payload.slug = selectedToyForDeposit.slug;
      }

      const toyIdentifier = await resolveBackendId(selectedToyForDeposit);
      if (!toyIdentifier) {
        showNotification("Impossible de retrouver ce jouet dans la base. Merci de le synchroniser d'abord.", 'error');
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
      showNotification('Caution mise à jour avec succès', 'success');
      handleCloseDepositModal();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la caution:', error);
      showNotification(
        `Erreur: ${error instanceof Error ? error.message : 'Impossible de sauvegarder la caution'}`,
        'error',
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-mint border-t-transparent"></div>
          <p className="mt-4 text-slate">Chargement de l'inventaire...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/admin/dashboard"
                className="text-sm text-gray-600 hover:text-mint transition-colors"
              >
                ← Dashboard
              </a>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-charcoal">Gestion Inventaire</h1>
                <p className="text-sm text-gray-600">Synchronisez et gérez tous les jouets</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {<button
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_BASE_URL}/admin/sync/toys`, { method: 'POST' });
                    if (!res.ok) throw new Error('sync_failed');
                    const body = await res.json();
                    const createdCount = body?.stats?.created ?? 0;
                    const updatedCount = body?.stats?.updated ?? 0;
                    showNotification(`Synchronisation jouets : ${createdCount} créés, ${updatedCount} mis à jour`, 'success');
                    await loadInventory();
                  } catch (e) {
                    showNotification('Échec de la synchronisation des jouets', 'error');
                  }
                }}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                title="Synchroniser à partir du mapping JSON"
              >
                <RefreshCw className="h-4 w-4" />
                Sync jouets
              </button>/* Statut Backend */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100">
                {backendStatus === 'checking' && (
                  <>
                    <RefreshCw className="h-4 w-4 text-gray-500 animate-spin" />
                    <span className="text-xs text-gray-600">Connexion...</span>
                  </>
                )}
                {backendStatus === 'connected' && (
                  <>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-green-600">Backend connecté</span>
                  </>
                )}
                {backendStatus === 'error' && (
                  <>
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-xs text-orange-600">Hors ligne</span>
                  </>
                )}
              </div>

              <div className="text-sm text-gray-600">
                {toys.length} jouets • {toys.filter(t => t.isVisible).length} visibles
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  disabled={exporting || toys.length === 0}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Télécharger tous les produits"
                >
                  {exporting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Exporter</span>
                </button>

                <button
                  onClick={() => setShowImportModal(true)}
                  disabled={importing}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Importer des produits en masse"
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Importer</span>
                </button>

                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 rounded-lg bg-mint px-4 py-2 text-sm font-medium text-white hover:bg-mint/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Caution (Dépôt) global */}
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caution globale (%)</label>
              <input
                type="number"
                min={0}
                step={1}
                value={globalDepositPercent}
                onChange={(e) => setGlobalDepositPercent(parseFloat(e.target.value))}
                className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-mint focus:ring-mint/20"
                placeholder="ex: 600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base de calcul</label>
              <select
                value={globalDepositBase}
                onChange={(e) => setGlobalDepositBase(e.target.value as any)}
                className="w-44 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-mint focus:ring-mint/20"
              >
                <option value="daily">Prix journalier</option>
                <option value="weekly">Prix hebdomadaire</option>
                <option value="monthly">Prix mensuel</option>
              </select>
            </div>
            <div className="flex-1" />
            <div className="flex gap-2">
              <button
                onClick={handleApplyGlobalDeposit}
                className="rounded-lg bg-charcoal text-white px-4 py-2 text-sm font-semibold hover:bg-slate transition"
              >
                Appliquer à tous les jouets
              </button>
              <div className="text-xs text-slate self-center">(peut être surchargé par jouet)</div>
            </div>
          </div>
        </div>{/* Filters */}
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={applySearch}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-mint focus:outline-none"
                  aria-label="Lancer la recherche"
                >
                  <Search className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  placeholder="Nom du jouet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                />
                {suggestions.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                    {suggestions.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleSelectSuggestion(name)}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-mint/10"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
              >
                <option value="all">Toutes les catégories</option>
                {getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visibilité</label>
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
              >
                <option value="all">Tous</option>
                <option value="visible">Visibles</option>
                <option value="hidden">Masqués</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setAppliedQuery("");
                  setFilterCategory("all");
                  setFilterVisibility("all");
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Bulk actions */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-mint focus:ring-mint"
                onChange={toggleSelectAllFiltered}
                checked={filteredToys.length > 0 && filteredToys.every((toy) => isSelected(toy))}
              />
              Sélectionner (filtré)
            </label>
            {selectedIds.size > 0 && (
              <span className="text-xs text-gray-500">{selectedIds.size} sélectionné(s)</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={deleteSelected}
              disabled={selectedIds.size === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              Supprimer la sélection
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={clearSelection}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Annuler la sélection
              </button>
            )}
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredToys.map((toy) => {
            const stockValue = Number.parseInt(String(toy.stock ?? "0"), 10);
            const hasStock = Number.isFinite(stockValue) && stockValue > 0;
            const stockDisplay = Number.isFinite(stockValue) ? stockValue : 0;

            return (
              <div
                key={toy.id}
                className={`rounded-xl bg-white p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:scale-[1.02] ${highlightedToyId === toy.id ? 'ring-2 ring-mint shadow-lg animate-pulse' : ''
                  }`}
              >
                {/* Image + sélection */}
                <div className="relative h-32 bg-gray-50 rounded-lg mb-3 overflow-hidden">
                  <div className="absolute left-2 top-2 z-10 rounded-full bg-white/80 p-1 border border-gray-200 shadow-sm">
                    <input
                      type="checkbox"
                      checked={isSelected(toy)}
                      onChange={() => toggleSelect(toy)}
                      className="h-4 w-4 rounded border-gray-300 text-mint focus:ring-mint"
                    />
                  </div>
                  {toy.hasImage ? (
                    <Image
                      src={toy.image}
                      alt={toy.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="absolute top-2 right-2 flex gap-1 flex-wrap">
                    {!toy.hasImage && (
                      <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                        Pas d'image
                      </div>
                    )}
                    {toy.hasVideo && toy.videoUrl && (
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        Vidéo
                      </div>
                    )}
                    {toy.hasVideo && !toy.videoUrl && (
                      <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        Vidéo sans URL
                      </div>
                    )}
                    {toy.promotion?.isActive && (
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <span>🎯</span>
                        {toy.promotion.label || 'Promo'}
                      </div>
                    )}
                    {!toy.isVisible && (
                      <div className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                        Masqué
                      </div>
                    )}
                  </div>
                </div>

                {/* Toy Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-charcoal text-sm line-clamp-2">{toy.name}</h3>

                  {toy.category && (
                    <p className="text-xs text-gray-600 line-clamp-1">{toy.category}</p>
                  )}

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

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="text-xs text-gray-500">{toy.age}</span>
                    <span className="text-sm font-medium text-mint">{toy.price}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleVisibility(toy.id)}
                      className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${toy.isVisible
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 hover:scale-105'
                        : 'bg-red-100 text-red-700 hover:bg-red-200 hover:scale-105'
                        }`}
                    >
                      {toy.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {toy.isVisible ? 'Visible' : 'Masqué'}
                    </button>

                    <button
                      onClick={() => startEditing(toy)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all duration-200 hover:scale-105"
                    >
                      <Edit className="h-3 w-3" />
                      Modifier
                    </button>
                    <button
                      onClick={() => deleteToy(toy.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200 hover:scale-105"
                    >
                      <X className="h-3 w-3" />
                      Supprimer
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpenDepositModal(toy)}
                    className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all duration-200 hover:scale-105"
                  >
                    <Shield className="h-3 w-3" />
                    Caution (%)
                  </button>

                  <button
                    onClick={() => handleOpenPricingModal(toy)}
                    className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium bg-mint/10 text-mint hover:bg-mint/20 transition-all duration-200 hover:scale-105"
                  >
                    <DollarSign className="h-3 w-3" />
                    Gérer les prix
                  </button>

                  <button
                    onClick={() => handleOpenStockModal(toy)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-[1.02] border ${hasStock
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Package className={`h-3.5 w-3.5 ${hasStock ? 'text-emerald-600' : 'text-rose-600'}`} />
                      <span className="font-semibold">Stock</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${hasStock ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                      {stockDisplay}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredToys.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun jouet trouvé</h3>
            <p className="mt-2 text-gray-600">
              {searchQuery || filterCategory !== "all" || filterVisibility !== "all"
                ? "Essayez de modifier vos filtres"
                : "Commencez par ajouter des jouets à votre inventaire"
              }
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingToy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-xl bg-white shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-charcoal">Modifier le jouet</h2>
                <button
                  onClick={cancelEditing}
                  className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="space-y-6">
                {/* Section Informations de base */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-mint" />
                    Informations de base
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom du jouet *</label>
                      <input
                        type="text"
                        value={editingToy.name}
                        onChange={(e) => setEditingToy({ ...editingToy, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                        placeholder="Ex: Lego Technic"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                      <select
                        value={editingToy.category}
                        onChange={(e) => setEditingToy({ ...editingToy, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                      >
                        {editingToy.category ? (
                          <option value={editingToy.category}>{editingToy.category}</option>
                        ) : (
                          <option value="">Sélectionner une catégorie</option>
                        )}
                        {categoryOptions.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Âge recommandé *</label>
                      <select
                        value={editingToy.age}
                        onChange={(e) => setEditingToy({ ...editingToy, age: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                      >
                        <option value="">Sélectionner un âge</option>
                        {(editingToy.age && !ageOptions.includes(editingToy.age) ? [editingToy.age, ...ageOptions] : ageOptions).map((age) => (
                          <option key={age} value={age}>{age}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix actuel</label>
                      <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                        {editingToy.price}
                        <span className="text-xs text-gray-500 ml-2">(Modifiable via "Gérer les prix")</span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-center">
                          <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">1 jour</p>
                          <p className="text-sm font-bold text-amber-900">{formatPriceDisplay(editingToy.rentalPriceDaily)}</p>
                        </div>
                        <div className="rounded-xl bg-mint/10 border border-mint/40 px-3 py-2 text-center">
                          <p className="text-[11px] font-semibold text-mint uppercase tracking-wide">1 semaine</p>
                          <p className="text-sm font-bold text-emerald-900">{formatPriceDisplay(editingToy.rentalPriceWeekly || editingToy.price)}</p>
                        </div>
                        <div className="rounded-xl bg-purple-50 border border-purple-200 px-3 py-2 text-center">
                          <p className="text-[11px] font-semibold text-purple-700 uppercase tracking-wide">1 mois</p>
                          <p className="text-sm font-bold text-purple-900">{formatPriceDisplay(editingToy.rentalPriceMonthly)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image du jouet</label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (!file.type.startsWith('image/')) {
                              alert('Veuillez sélectionner un fichier image valide');
                              return;
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              alert('L\'image ne doit pas dépasser 5MB');
                              return;
                            }
                            const imageUrl = URL.createObjectURL(file);
                            setEditingToy({ ...editingToy, image: imageUrl, hasImage: true });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                      />
                      <p className="text-xs text-gray-500">
                        Formats acceptés: JPG, PNG, GIF (max 5MB)
                      </p>
                    </div>

                    {/* Aperçu de l'image actuelle */}
                    {editingToy.image && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Aperçu de l'image</label>
                        <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                          <Image
                            src={editingToy.image}
                            alt="Aperçu"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editingToy.description}
                      onChange={(e) => setEditingToy({ ...editingToy, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                      placeholder="Description du jouet..."
                    />
                  </div>
                </div>

                {/* Section Visibilité et statut */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    Visibilité et statut
                  </h3>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingToy.isVisible}
                        onChange={(e) => setEditingToy({ ...editingToy, isVisible: e.target.checked })}
                        className="rounded border-gray-300 text-mint focus:ring-mint"
                      />
                      <span className="text-sm text-gray-700">Visible sur le site</span>
                    </label>
                  </div>
                </div>

                {/* Section Vidéo YouTube */}
                <div className="bg-red-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Play className="h-5 w-5 text-red-600" />
                    Vidéo YouTube
                  </h3>

                  <div className="flex items-center gap-4 mb-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingToy.hasVideo || false}
                        onChange={(e) => setEditingToy({ ...editingToy, hasVideo: e.target.checked })}
                        className="rounded border-gray-300 text-mint focus:ring-mint"
                      />
                      <span className="text-sm text-gray-700">Afficher le bouton vidéo</span>
                    </label>
                  </div>

                  {editingToy.hasVideo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL de la vidéo YouTube</label>
                      <input
                        type="url"
                        value={editingToy.videoUrl || ''}
                        onChange={(e) => setEditingToy({ ...editingToy, videoUrl: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-mint focus:border-mint ${editingToy.videoUrl && !isValidYouTubeUrl(editingToy.videoUrl)
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                          }`}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      {editingToy.videoUrl && !isValidYouTubeUrl(editingToy.videoUrl) && (
                        <p className="text-xs text-red-500 mt-1">
                          ⚠️ URL YouTube invalide. Format attendu: https://www.youtube.com/watch?v=VIDEO_ID
                        </p>
                      )}
                      {editingToy.videoUrl && isValidYouTubeUrl(editingToy.videoUrl) && (
                        <p className="text-xs text-green-600 mt-1">
                          ✅ URL YouTube valide
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Collez l'URL complète de la vidéo YouTube (ex: https://www.youtube.com/watch?v=VIDEO_ID)
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex gap-3">
                <button
                  onClick={() => saveChanges(editingToy)}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-mint px-4 py-2 font-medium text-white transition-colors hover:bg-mint/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Sauvegarder
                    </>
                  )}
                </button>
                <button
                  onClick={cancelEditing}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Toy Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-xl bg-white shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-charcoal">Ajouter un nouveau jouet</h2>
                <button
                  onClick={handleCancelAdd}
                  className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="space-y-6">
                {/* Section Informations de base */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-mint" />
                    Informations de base
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom du jouet *</label>
                      <input
                        type="text"
                        value={newToy.name}
                        onChange={(e) => setNewToy({ ...newToy, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                        placeholder="Ex: Lego Technic"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                      <select
                        value={newToy.category}
                        onChange={(e) => setNewToy({ ...newToy, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categoryOptions.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Âge recommandé *</label>
                      <select
                        value={newToy.age}
                        onChange={(e) => setNewToy({ ...newToy, age: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                      >
                        <option value="">Sélectionner un âge</option>
                        {ageOptions.map(age => (
                          <option key={age} value={age}>{age}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Aperçu des prix</label>
                      <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                        Prix hebdo affiché : {newToy.price || "N/A"}
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-center">
                          <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">1 jour</p>
                          <p className="text-sm font-bold text-amber-900">{formatPriceDisplay(newToy.rentalPriceDaily)}</p>
                        </div>
                        <div className="rounded-xl bg-mint/10 border border-mint/40 px-3 py-2 text-center">
                          <p className="text-[11px] font-semibold text-mint uppercase tracking-wide">1 semaine</p>
                          <p className="text-sm font-bold text-emerald-900">{formatPriceDisplay(newToy.rentalPriceWeekly || newToy.price)}</p>
                        </div>
                        <div className="rounded-xl bg-purple-50 border border-purple-200 px-3 py-2 text-center">
                          <p className="text-[11px] font-semibold text-purple-700 uppercase tracking-wide">1 mois</p>
                          <p className="text-sm font-bold text-purple-900">{formatPriceDisplay(newToy.rentalPriceMonthly)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image du jouet</label>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                        />
                        <p className="text-xs text-gray-500">
                          Formats acceptés: JPG, PNG, GIF (max 5MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newToy.description}
                      onChange={(e) => setNewToy({ ...newToy, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                      placeholder="Description du jouet..."
                    />
                  </div>

                  {/* Aperçu de l'image */}
                  {newToy.hasImage && newToy.image && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aperçu de l'image</label>
                      <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                        <Image
                          src={newToy.image}
                          alt="Aperçu"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section Visibilité */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    Visibilité
                  </h3>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newToy.isVisible}
                        onChange={(e) => setNewToy({ ...newToy, isVisible: e.target.checked })}
                        className="rounded border-gray-300 text-mint focus:ring-mint"
                      />
                      <span className="text-sm text-gray-700">Visible sur le site</span>
                    </label>
                  </div>

                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note :</strong> Les prix et promotions sont gérés via le bouton "Gérer les prix" dans la liste des jouets.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToy}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-mint px-4 py-2 font-medium text-white hover:bg-mint/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter le jouet
                </button>
                <button
                  onClick={handleCancelAdd}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gestion de la caution */}
      {showDepositModal && selectedToyForDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-charcoal">Caution - {selectedToyForDeposit.name}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Calculez la caution à partir d'un pourcentage et d'un prix de référence.
                </p>
              </div>
              <button
                onClick={handleCloseDepositModal}
                className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pourcentage</label>
                  <input
                    type="number"
                    min={0}
                    value={depositPercent}
                    onChange={(e) => setDepositPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-mint focus:ring-mint/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base de calcul</label>
                  <select
                    value={depositBase}
                    onChange={(e) => setDepositBase(e.target.value as 'daily' | 'weekly' | 'monthly')}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-mint focus:ring-mint/20"
                  >
                    <option value="daily">Prix journalier</option>
                    <option value="weekly">Prix hebdomadaire</option>
                    <option value="monthly">Prix mensuel</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl bg-mint/5 border border-mint/20 p-4 text-sm text-slate flex flex-col gap-1">
                <span>
                  Prix de base :{' '}
                  <strong className="text-charcoal">
                    {depositBasePrice
                      ? `${depositBasePrice.toFixed(2)} MAD`
                      : 'Non disponible'}
                  </strong>
                </span>
                <span>
                  Caution calculée :{' '}
                  <strong className="text-charcoal">{depositPreviewValue.toFixed(2)} MAD</strong>
                </span>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleSaveDeposit}
                className="flex-1 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-3 text-white font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
              >
                Mettre à jour la caution
              </button>
              <button
                onClick={handleCloseDepositModal}
                className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gestion des prix moderne */}
      {showPricingModal && selectedToyForPricing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-6xl max-h-[90vh] rounded-xl bg-white shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-charcoal">
                    Gestion des Prix - {selectedToyForPricing.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Configurez les tarifs journalier, hebdomadaire et mensuel
                  </p>
                </div>
                <button
                  onClick={handleClosePricingModal}
                  className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Gestion des prix */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-charcoal mb-4">
                    Configuration des prix
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="block text-sm font-medium text-slate mb-2">
                        Prix Journalier (MAD)
                      </label>
                      <input
                        type="number"
                        value={editedPrices.daily}
                        onChange={(e) => setEditedPrices({ ...editedPrices, daily: Number(e.target.value) })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-mint focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate mb-2">
                        Prix Hebdomadaire (MAD)
                      </label>
                      <input
                        type="number"
                        value={editedPrices.weekly}
                        onChange={(e) => setEditedPrices({ ...editedPrices, weekly: Number(e.target.value) })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-mint focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate mb-2">
                        Prix Mensuel (MAD)
                      </label>
                      <input
                        type="number"
                        value={editedPrices.monthly}
                        onChange={(e) => setEditedPrices({ ...editedPrices, monthly: Number(e.target.value) })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-mint focus:outline-none"
                      />
                    </div>

                  </div>
                </div>

                {/* Gestion des promotions */}
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
                    <span className="text-green-600">🎯</span>
                    Gestion des promotions
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedToyForPricing?.promotion?.isActive || false}
                          onChange={(e) => {
                            if (selectedToyForPricing) {
                              setSelectedToyForPricing({
                                ...selectedToyForPricing,
                                promotion: {
                                  ...selectedToyForPricing.promotion,
                                  isActive: e.target.checked,
                                  type: selectedToyForPricing.promotion?.type || 'percentage',
                                  value: selectedToyForPricing.promotion?.value || '',
                                  label: selectedToyForPricing.promotion?.label || '',
                                  startDate: selectedToyForPricing.promotion?.startDate || '',
                                  endDate: selectedToyForPricing.promotion?.endDate || ''
                                }
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-mint focus:ring-mint"
                        />
                        <span className="text-sm text-gray-700">Activer la promotion</span>
                      </label>
                    </div>

                    {selectedToyForPricing?.promotion?.isActive && (
                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type de promotion</label>
                            <select
                              value={selectedToyForPricing.promotion?.type || 'percentage'}
                              onChange={(e) => {
                                if (selectedToyForPricing) {
                                  setSelectedToyForPricing({
                                    ...selectedToyForPricing,
                                    promotion: {
                                      isActive: selectedToyForPricing.promotion?.isActive || false,
                                      type: e.target.value as 'percentage' | 'fixed' | 'text',
                                      value: selectedToyForPricing.promotion?.value || '',
                                      label: selectedToyForPricing.promotion?.label || '',
                                      startDate: selectedToyForPricing.promotion?.startDate || '',
                                      endDate: selectedToyForPricing.promotion?.endDate || ''
                                    }
                                  });
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                            >
                              <option value="percentage">Pourcentage</option>
                              <option value="fixed">Montant fixe</option>
                              <option value="text">Texte personnalisé</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {selectedToyForPricing.promotion?.type === 'percentage' ? 'Pourcentage (%)' :
                                selectedToyForPricing.promotion?.type === 'fixed' ? 'Montant (MAD)' : 'Texte'}
                            </label>
                            <input
                              type={selectedToyForPricing.promotion?.type === 'percentage' || selectedToyForPricing.promotion?.type === 'fixed' ? 'number' : 'text'}
                              value={selectedToyForPricing.promotion?.value || ''}
                              onChange={(e) => {
                                if (selectedToyForPricing) {
                                  setSelectedToyForPricing({
                                    ...selectedToyForPricing,
                                    promotion: {
                                      isActive: selectedToyForPricing.promotion?.isActive || false,
                                      type: selectedToyForPricing.promotion?.type || 'percentage',
                                      value: e.target.value,
                                      label: selectedToyForPricing.promotion?.label || '',
                                      startDate: selectedToyForPricing.promotion?.startDate || '',
                                      endDate: selectedToyForPricing.promotion?.endDate || ''
                                    }
                                  });
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                              placeholder={selectedToyForPricing.promotion?.type === 'percentage' ? 'Ex: 20' :
                                selectedToyForPricing.promotion?.type === 'fixed' ? 'Ex: 10' : 'Ex: Offre spéciale'}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Label de la promotion</label>
                          <input
                            type="text"
                            value={selectedToyForPricing.promotion?.label || ''}
                            onChange={(e) => {
                              if (selectedToyForPricing) {
                                setSelectedToyForPricing({
                                  ...selectedToyForPricing,
                                  promotion: {
                                    isActive: selectedToyForPricing.promotion?.isActive || false,
                                    type: selectedToyForPricing.promotion?.type || 'percentage',
                                    value: selectedToyForPricing.promotion?.value || '',
                                    label: e.target.value,
                                    startDate: selectedToyForPricing.promotion?.startDate || '',
                                    endDate: selectedToyForPricing.promotion?.endDate || ''
                                  }
                                });
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                            placeholder="Ex: -20% ou Offre limitée"
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début (optionnel)</label>
                            <input
                              type="date"
                              value={selectedToyForPricing.promotion?.startDate || ''}
                              onChange={(e) => {
                                if (selectedToyForPricing) {
                                  setSelectedToyForPricing({
                                    ...selectedToyForPricing,
                                    promotion: {
                                      isActive: selectedToyForPricing.promotion?.isActive || false,
                                      type: selectedToyForPricing.promotion?.type || 'percentage',
                                      value: selectedToyForPricing.promotion?.value || '',
                                      label: selectedToyForPricing.promotion?.label || '',
                                      startDate: e.target.value,
                                      endDate: selectedToyForPricing.promotion?.endDate || ''
                                    }
                                  });
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin (optionnel)</label>
                            <input
                              type="date"
                              value={selectedToyForPricing.promotion?.endDate || ''}
                              onChange={(e) => {
                                if (selectedToyForPricing) {
                                  setSelectedToyForPricing({
                                    ...selectedToyForPricing,
                                    promotion: {
                                      isActive: selectedToyForPricing.promotion?.isActive || false,
                                      type: selectedToyForPricing.promotion?.type || 'percentage',
                                      value: selectedToyForPricing.promotion?.value || '',
                                      label: selectedToyForPricing.promotion?.label || '',
                                      startDate: selectedToyForPricing.promotion?.startDate || '',
                                      endDate: e.target.value
                                    }
                                  });
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex gap-3">
                <button
                  onClick={handleSavePricing}
                  className="flex items-center gap-2 rounded-xl bg-mint px-6 py-3 text-white hover:bg-mint/90 transition"
                >
                  <Save className="h-4 w-4" />
                  Sauvegarder les prix
                </button>
                <button
                  onClick={handleClosePricingModal}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-gray-700 hover:bg-gray-50 transition"
                >
                  <X className="h-4 w-4" />
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gestion du stock - Amélioré */}
      {showStockModal && selectedToyForStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300 border border-gray-100">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Package className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Gestion du Stock</h2>
                    <p className="text-sm text-gray-600">Mettez à jour la quantité disponible</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseStockModal}
                  className="rounded-lg bg-white/80 p-2 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors shadow-sm"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Info du produit */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white border-2 border-gray-200">
                    {selectedToyForStock.hasImage ? (
                      <Image
                        src={selectedToyForStock.image}
                        alt={selectedToyForStock.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">{selectedToyForStock.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{selectedToyForStock.category}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${parseInt(String(selectedToyForStock.stock || '0')) > 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                        }`}>
                        Stock actuel: {selectedToyForStock.stock || '0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contrôle du stock */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-100">
                  <label className="block text-sm font-bold text-gray-900 mb-4 text-center">
                    Nouvelle quantité en stock
                  </label>

                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                      onClick={() => setEditedStock(Math.max(0, editedStock - 1))}
                      className="rounded-xl bg-white border-2 border-gray-300 p-3 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:scale-105 active:scale-95"
                      disabled={editedStock <= 0}
                    >
                      <span className="text-2xl font-bold">−</span>
                    </button>

                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={editedStock}
                        onChange={(e) => setEditedStock(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-32 text-center text-4xl font-bold px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-200 focus:border-teal-500 bg-white shadow-lg"
                      />
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                        unités
                      </div>
                    </div>

                    <button
                      onClick={() => setEditedStock(editedStock + 1)}
                      className="rounded-xl bg-white border-2 border-gray-300 p-3 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:scale-105 active:scale-95"
                    >
                      <span className="text-2xl font-bold">+</span>
                    </button>
                  </div>

                  {/* Indicateur de statut */}
                  <div className={`mt-6 p-4 rounded-xl border-2 ${editedStock > 0
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                    }`}>
                    <div className="flex items-center justify-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${editedStock > 0 ? 'bg-green-500' : 'bg-red-500'
                        } animate-pulse`}></div>
                      <span className={`text-base font-bold ${editedStock > 0 ? 'text-green-700' : 'text-red-700'
                        }`}>
                        {editedStock > 0
                          ? `✅ ${editedStock} unité(s) disponible(s) - En stock`
                          : '⚠️ Rupture de stock - Produit indisponible'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info supplémentaire */}
                {editedStock !== parseInt(String(selectedToyForStock.stock || '0')) && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <p className="font-semibold mb-1">Modification en attente</p>
                        <p>Le stock passera de <span className="font-bold">{selectedToyForStock.stock || '0'}</span> à <span className="font-bold">{editedStock}</span> unité(s) après sauvegarde.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={handleSaveStock}
                  disabled={editedStock === parseInt(String(selectedToyForStock.stock || '0'))}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-600 bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-3 text-white font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-700 disabled:hover:shadow-none"
                >
                  <Save className="h-5 w-5" />
                  Sauvegarder les modifications
                </button>
                <button
                  onClick={handleCloseStockModal}
                  className="flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  <X className="h-5 w-5" />
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'import CSV */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300 border border-gray-100">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Importer des produits</h2>
                    <p className="text-sm text-gray-600">Téléchargez un fichier CSV ou Excel (.xls/.xlsx)</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                  className="rounded-lg bg-white/80 p-2 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors shadow-sm"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Format CSV/Excel requis :</strong>
                  </p>
                  <p className="text-xs text-blue-700 mb-3">
                    Le fichier doit contenir les colonnes suivantes : ID, Nom, Catégorie, Âge, Prix, Stock, Description, Visible, Image, Vidéo URL
                  </p>
                  <button
                    onClick={handleExportCSV}
                    className="text-xs text-blue-600 hover:text-blue-800 underline font-semibold"
                  >
                    Télécharger un modèle CSV
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner un fichier CSV ou Excel
                  </label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {importFile ? (
                          <>
                            <FileText className="h-10 w-10 text-green-500 mb-2" />
                            <p className="text-sm font-medium text-gray-900">{importFile.name}</p>
                            <p className="text-xs text-gray-500">{(importFile.size / 1024).toFixed(2)} KB</p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                            </p>
                            <p className="text-xs text-gray-500">CSV ou Excel (max. 10MB)</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept=".csv,.xls,.xlsx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              showNotification('Le fichier ne doit pas dépasser 10MB', 'error');
                              return;
                            }
                            setImportFile(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {importFile && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ Fichier sélectionné: <span className="font-semibold">{importFile.name}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={handleImportCSV}
                  disabled={!importFile || importing}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Import en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      Importer les produits
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                  className="flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  <X className="h-5 w-5" />
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-4 duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${notification.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
            <CheckCircle className={`h-5 w-5 ${notification.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`} />
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}





