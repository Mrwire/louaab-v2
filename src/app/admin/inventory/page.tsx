"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
import { PricingService } from "@/lib/pricing-service";

interface InventoryItem extends ToyData {
  isVisible: boolean;
  isEditing: boolean;
  hasChanges: boolean;
  // Prix individuels depuis le backend
  rentalPriceDaily?: number;
  rentalPriceWeekly?: number;
  rentalPriceMonthly?: number;
  depositAmount?: number;
}

// URL du backend API - utiliser une URL relative pour Ã©viter Mixed Content
const API_BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || '/api')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');

export default function InventoryPage() {
  const [toys, setToys] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterVisibility, setFilterVisibility] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingToy, setEditingToy] = useState<InventoryItem | null>(null);
  
  // Ã‰tats pour la gestion des prix
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedToyForPricing, setSelectedToyForPricing] = useState<InventoryItem | null>(null);
  const [editedPrices, setEditedPrices] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    deposit: 0,
  });

  // Ã‰tats pour la gestion du stock
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedToyForStock, setSelectedToyForStock] = useState<InventoryItem | null>(null);
  const [editedStock, setEditedStock] = useState<number>(0);
  
  // Ã‰tats pour l'import/export
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Ã‰tat pour les notifications
    // Caution globale
  const [globalDepositPercent, setGlobalDepositPercent] = useState<number>(600);
  const [globalDepositBase, setGlobalDepositBase] = useState<'daily' | 'weekly' | 'monthly'>('daily');const [notification, setNotification] = useState<{
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

  useEffect(() => {
    loadInventory();
    checkBackendConnection();
  }, []);

  // Fonction helper pour gÃ©nÃ©rer un slug
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[Ã©Ã¨ÃªÃ«]/g, 'e')
      .replace(/[Ã Ã¢Ã¤]/g, 'a')
      .replace(/[Ã´Ã¶]/g, 'o')
      .replace(/[Ã»Ã¼Ã¹]/g, 'u')
      .replace(/[Ã¯Ã®]/g, 'i')
      .replace(/Ã§/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  };

  // VÃ©rifier la connexion au backend
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
    
    // Auto-hide aprÃ¨s 3 secondes
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  const handleApplyGlobalDeposit = async () => {
    try {
      const response = await fetch(${API_BASE_URL}/toys/deposit/bulk, {
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

  const loadInventory = async () => {
    try {
      setLoading(true);
      // Essayer de charger depuis le backend d'abord
      try {
        const response = await fetch(`${API_BASE_URL}/toys`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && Array.isArray(result.data)) {
            const inventoryItems: InventoryItem[] = result.data.map((toy: any) => ({
              id: Number(toy.id) || generateToyId(),
              slug: toy.slug || generateSlug(toy.name || ''),
              name: toy.name || '',
              price: `${toy.rentalPriceWeekly || toy.rentalPriceDaily || 0} MAD/semaine`,
              // Stocker les prix individuels depuis le backend
              rentalPriceDaily: toy.rentalPriceDaily || 0,
              rentalPriceWeekly: toy.rentalPriceWeekly || 0,
              rentalPriceMonthly: toy.rentalPriceMonthly || 0,
              depositAmount: toy.depositAmount || 0,
              category: toy.categories?.map((c: any) => c.name).join(', ') || '',
              age: toy.ageRange || '',
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
      } catch (backendError) {
        console.warn('Erreur lors du chargement depuis le backend, utilisation des donnÃ©es locales:', backendError);
      }
      
      // Fallback: charger depuis les donnÃ©es locales
      const data = await loadToysData();
      const inventoryItems: InventoryItem[] = data.toys.map(toy => ({
        ...toy,
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

  const filteredToys = toys.filter(toy => {
    const matchesSearch = toy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         toy.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || toy.category?.includes(filterCategory);
    const matchesVisibility = filterVisibility === "all" || 
                             (filterVisibility === "visible" && toy.isVisible) ||
                             (filterVisibility === "hidden" && !toy.isVisible);
    return matchesSearch && matchesCategory && matchesVisibility;
  });

  const toggleVisibility = (toyId: number | string) => {
    const id = typeof toyId === 'string' ? Number(toyId) : toyId;
    setToys(prev => prev.map(toy => 
      toy.id === id ? { ...toy, isVisible: !toy.isVisible } : toy
    ));
  };

  const startEditing = (toy: InventoryItem) => {
    setEditingToy({ ...toy, isEditing: true });
  };

  const saveChanges = (toyId: number | string, updatedData: Partial<ToyData>) => {
    // Validation pour les vidÃ©os YouTube
    if (updatedData.hasVideo && updatedData.videoUrl && !isValidYouTubeUrl(updatedData.videoUrl)) {
      showNotification('Veuillez entrer une URL YouTube valide ou dÃ©cocher "Afficher le bouton vidÃ©o"', 'error');
      return;
    }
    
    const id = typeof toyId === 'string' ? Number(toyId) : toyId;
    setToys(prev => prev.map(toy => 
      toy.id === id 
        ? { ...toy, ...updatedData, isEditing: false, hasChanges: false }
        : toy
    ));
    setEditingToy(null);
    showNotification('Jouet modifiÃ© avec succÃ¨s !');
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

  // Options prÃ©dÃ©finies pour les catÃ©gories
  const categoryOptions = [
    'Jeux de construction',
    'Puzzles et casse-tÃªtes',
    'Jeux Ã©ducatifs',
    'Jouets Ã©lectroniques',
    'Jeux de sociÃ©tÃ©',
    'Jouets crÃ©atifs',
    'Jouets de plein air',
    'PoupÃ©es et accessoires',
    'VÃ©hicules et circuits',
    'Instruments de musique',
    'Jeux de rÃ´le',
    'Jouets scientifiques',
    'Autres'
  ];

  // Options prÃ©dÃ©finies pour les Ã¢ges
  const ageOptions = [
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
    'Tous Ã¢ges'
  ];

  const generateToyId = () => {
    return Date.now() + Math.floor(Math.random() * 1000);
  };

  const isValidYouTubeUrl = (url: string): boolean => {
    if (!url) return false;
    
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
  };

  // Fonction pour gÃ©rer l'upload d'image
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // VÃ©rifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sÃ©lectionner un fichier image valide');
        return;
      }

      // VÃ©rifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image ne doit pas dÃ©passer 5MB');
        return;
      }

      // CrÃ©er un URL temporaire pour l'aperÃ§u
      const imageUrl = URL.createObjectURL(file);
      setNewToy({
        ...newToy,
        image: imageUrl,
        hasImage: true
      });
    }
  };


  const handleAddToy = () => {
    if (!newToy.name) {
      showNotification('Veuillez remplir au moins le nom du jouet', 'error');
      return;
    }

    // Validation pour les vidÃ©os YouTube
    if (newToy.hasVideo && newToy.videoUrl && !isValidYouTubeUrl(newToy.videoUrl)) {
      showNotification('Veuillez entrer une URL YouTube valide ou dÃ©cocher "Afficher le bouton vidÃ©o"', 'error');
      return;
    }

    const toyToAdd: InventoryItem = {
      id: generateToyId(),
      slug: generateSlug(newToy.name),
      name: newToy.name,
      price: 'Prix Ã  dÃ©finir', // Prix par dÃ©faut
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

    setToys(prev => [...prev, toyToAdd]);
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
    showNotification('Jouet ajoutÃ© avec succÃ¨s !');
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
    
    // Extraire les prix depuis le jouet (depuis le backend ou valeurs par dÃ©faut)
    const dailyPrice = (toy as any).rentalPriceDaily || parseFloat(toy.price?.replace(/[^\d.]/g, '') || '25');
    const weeklyPrice = (toy as any).rentalPriceWeekly || (dailyPrice * 4.8); // 20% de rÃ©duction
    const monthlyPrice = (toy as any).rentalPriceMonthly || (dailyPrice * 15); // 50% de rÃ©duction
    const depositAmount = (toy as any).depositAmount || (dailyPrice * 6); // Caution = 6x le prix journalier
    
    setEditedPrices({
      daily: dailyPrice,
      weekly: weeklyPrice,
      monthly: monthlyPrice,
      deposit: depositAmount,
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
      // PrÃ©parer les donnÃ©es de prix pour le backend
      const toyId = String(selectedToyForPricing.id);
      const pricingData = {
        rentalPriceDaily: editedPrices.daily,
        rentalPriceWeekly: editedPrices.weekly,
        rentalPriceMonthly: editedPrices.monthly,
        depositAmount: editedPrices.deposit,
      };

      // Appel API pour mettre Ã  jour les prix dans le backend
      const response = await fetch(`${API_BASE_URL}/toys/${toyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pricingData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Mettre Ã  jour le jouet dans la liste locale avec les nouveaux prix
        setToys(prev => prev.map(toy => 
          toy.id === selectedToyForPricing.id
            ? { 
                ...toy, 
                price: `${editedPrices.weekly.toFixed(0)} MAD/semaine`,
                // Stocker les prix individuels pour rÃ©fÃ©rence
                rentalPriceDaily: editedPrices.daily,
                rentalPriceWeekly: editedPrices.weekly,
                rentalPriceMonthly: editedPrices.monthly,
                depositAmount: editedPrices.deposit,
                promotion: selectedToyForPricing.promotion
              }
            : toy
        ));
        
        handleClosePricingModal();
        showNotification('Prix et promotions sauvegardÃ©s avec succÃ¨s dans le backend !', 'success');
        
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
    if (selectedToyForStock) {
      try {
        // Sauvegarder dans le backend si disponible
        try {
          const response = await fetch(`${API_BASE_URL}/toys/${selectedToyForStock.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              stockQuantity: editedStock,
              status: editedStock > 0 ? 'AVAILABLE' : 'UNAVAILABLE'
            }),
          });
          
          if (response.ok) {
            // Backend sauvegardÃ© avec succÃ¨s
            setBackendConnected(true);
            setBackendStatus('connected');
          }
        } catch (backendError) {
          console.warn('Erreur lors de la sauvegarde dans le backend, sauvegarde locale uniquement:', backendError);
        }
        
        // Mettre Ã  jour le stock du jouet localement
        setToys(prev => prev.map(toy => 
          toy.id === selectedToyForStock.id
            ? { ...toy, stock: String(editedStock) }
            : toy
        ));
        
        handleCloseStockModal();
        showNotification(`Stock mis Ã  jour : ${editedStock > 0 ? editedStock + ' unitÃ©(s) en stock' : 'Rupture de stock'}`);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du stock:', error);
        showNotification('Erreur lors de la sauvegarde du stock', 'error');
      }
    }
  };

  // Fonction pour exporter les produits en CSV
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      
      // PrÃ©parer les donnÃ©es CSV
      const headers = ['ID', 'Nom', 'CatÃ©gorie', 'Ã‚ge', 'Prix', 'Stock', 'Description', 'Visible', 'Image', 'VidÃ©o URL'];
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
      
      // CrÃ©er le fichier et le tÃ©lÃ©charger
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
      showNotification('Export CSV rÃ©ussi !');
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      setExporting(false);
      showNotification('Erreur lors de l\'export CSV', 'error');
    }
  };

  // Fonction pour importer les produits depuis un CSV
  const handleImportCSV = async () => {
    if (!importFile) {
      showNotification('Veuillez sÃ©lectionner un fichier CSV', 'error');
      return;
    }
    
    try {
      setImporting(true);
      
      // Lire le fichier
      const text = await importFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('Le fichier CSV doit contenir au moins un en-tÃªte et une ligne de donnÃ©es');
      }
      
      // Parser le CSV (simple parser, peut Ãªtre amÃ©liorÃ©)
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const importedToys: InventoryItem[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        
        if (values.length < headers.length) continue;
        
        const toy: InventoryItem = {
          id: generateToyId(),
          slug: generateSlug(values[headers.indexOf('Nom')] || ''),
          name: values[headers.indexOf('Nom')] || '',
          category: values[headers.indexOf('CatÃ©gorie')] || '',
          age: values[headers.indexOf('Ã‚ge')] || '',
          price: values[headers.indexOf('Prix')] || 'Prix Ã  dÃ©finir',
          stock: values[headers.indexOf('Stock')] || '0',
          description: values[headers.indexOf('Description')] || '',
          image: values[headers.indexOf('Image')] || '/toys/placeholders/toy-placeholder.svg',
          thumbnail: values[headers.indexOf('Image')] || '/toys/placeholders/toy-placeholder.svg',
          hasImage: !!values[headers.indexOf('Image')],
          rating: '4',
          videoUrl: values[headers.indexOf('VidÃ©o URL')] || '',
          hasVideo: !!values[headers.indexOf('VidÃ©o URL')],
          source: 'import',
          isVisible: values[headers.indexOf('Visible')]?.toLowerCase() === 'oui',
          isEditing: false,
          hasChanges: false
        };
        
        importedToys.push(toy);
      }
      
      // Ajouter les jouets importÃ©s
      setToys(prev => [...prev, ...importedToys]);
      setImportFile(null);
      setShowImportModal(false);
      setImporting(false);
      showNotification(`${importedToys.length} jouet(s) importÃ©(s) avec succÃ¨s !`);
    } catch (error) {
      console.error('Erreur lors de l\'import CSV:', error);
      setImporting(false);
      showNotification(`Erreur lors de l'import CSV: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');
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
                â† Dashboard
              </a>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-charcoal">Gestion Inventaire</h1>
                <p className="text-sm text-gray-600">Synchronisez et gÃ©rez tous les jouets</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {              <button
                onClick={async () => {
                  try {
                    const res = await fetch(${API_BASE_URL}/admin/sync/toys, { method: 'POST' });
                    if (!res.ok) throw new Error('sync_failed');
                    const body = await res.json();
                    showNotification(Synchronisation jouets: + créés,  mis à jour, 'success');
                    await loadInventory();
                  } catch (e) {
                    showNotification('Échec de la synchronisation des jouets', 'error');
                  }
                }}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                title="Synchroniser à partir du mapping JSON"
              >
                <RefreshCw className=\"h-4 w-4\" />
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
                    <span className="text-xs text-green-600">Backend connectÃ©</span>
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
                {toys.length} jouets â€¢ {toys.filter(t => t.isVisible).length} visibles
              </div>
              
              {/* Boutons d'action */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  disabled={exporting || toys.length === 0}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="TÃ©lÃ©charger tous les produits"
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nom du jouet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CatÃ©gorie</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
              >
                <option value="all">Toutes les catÃ©gories</option>
                {getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">VisibilitÃ©</label>
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
              >
                <option value="all">Tous</option>
                <option value="visible">Visibles</option>
                <option value="hidden">MasquÃ©s</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterCategory("all");
                  setFilterVisibility("all");
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                RÃ©initialiser
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredToys.map((toy) => (
            <div key={toy.id} className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
              {/* Image */}
              <div className="relative h-32 bg-gray-50 rounded-lg mb-3 overflow-hidden">
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
                      VidÃ©o
                    </div>
                  )}
                  {toy.hasVideo && !toy.videoUrl && (
                    <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      VidÃ©o sans URL
                    </div>
                  )}
                  {toy.promotion?.isActive && (
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <span>ðŸŽ¯</span>
                      {toy.promotion.label || 'Promo'}
                    </div>
                  )}
                  {!toy.isVisible && (
                    <div className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                      MasquÃ©
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
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-mint">{toy.price}</span>
                  <span className="text-xs text-gray-500">{toy.age}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 space-y-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleVisibility(toy.id)}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                      toy.isVisible 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 hover:scale-105' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200 hover:scale-105'
                    }`}
                  >
                    {toy.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {toy.isVisible ? 'Visible' : 'MasquÃ©'}
                  </button>
                  
                  <button
                    onClick={() => startEditing(toy)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all duration-200 hover:scale-105"
                  >
                    <Edit className="h-3 w-3" />
                    Modifier
                  </button>
                </div>
                
                <button
                  \r\n                <button
                  onClick={() => handleOpenPricingModal(toy)}
                  className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all duration-200 hover:scale-105"
                >
                  <Shield className="h-3 w-3" />
                  Caution
                </button>onClick={() => handleOpenPricingModal(toy)}
                  className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium bg-mint/10 text-mint hover:bg-mint/20 transition-all duration-200 hover:scale-105"
                >
                  <DollarSign className="h-3 w-3" />
                  GÃ©rer les prix
                </button>

                <button
                  onClick={() => handleOpenStockModal(toy)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-[1.02] text-white ${
                    parseInt(String(toy.stock || '0')) > 0
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md'
                      : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-white">
                    <Package className="h-3.5 w-3.5 text-white" />
                    <span className="text-white">Stock</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold text-white">
                    {toy.stock || '0'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredToys.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun jouet trouvÃ©</h3>
            <p className="mt-2 text-gray-600">
              {searchQuery || filterCategory !== "all" || filterVisibility !== "all"
                ? "Essayez de modifier vos filtres"
                : "Commencez par ajouter des jouets Ã  votre inventaire"
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
                        onChange={(e) => setEditingToy({...editingToy, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                        placeholder="Ex: Lego Technic"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CatÃ©gorie *</label>
                      <select
                        value={editingToy.category}
                        onChange={(e) => setEditingToy({...editingToy, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                      >
                        {editingToy.category ? (
                          <option value={editingToy.category}>{editingToy.category}</option>
                        ) : (
                          <option value="">SÃ©lectionner une catÃ©gorie</option>
                        )}
                        {categoryOptions.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ã‚ge recommandÃ© *</label>
                      <select
                        value={editingToy.age}
                        onChange={(e) => setEditingToy({...editingToy, age: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                      >
                        {editingToy.age ? (
                          <option value={editingToy.age}>{editingToy.age}</option>
                        ) : (
                          <option value="">SÃ©lectionner un Ã¢ge</option>
                        )}
                        {ageOptions.map(age => (
                          <option key={age} value={age}>{age}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix actuel</label>
                      <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                        {editingToy.price}
                        <span className="text-xs text-gray-500 ml-2">(Modifiable via "GÃ©rer les prix")</span>
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
                              alert('Veuillez sÃ©lectionner un fichier image valide');
                              return;
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              alert('L\'image ne doit pas dÃ©passer 5MB');
                              return;
                            }
                            const imageUrl = URL.createObjectURL(file);
                            setEditingToy({...editingToy, image: imageUrl, hasImage: true});
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                      />
                      <p className="text-xs text-gray-500">
                        Formats acceptÃ©s: JPG, PNG, GIF (max 5MB)
                      </p>
                    </div>
                    
                    {/* AperÃ§u de l'image actuelle */}
                    {editingToy.image && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">AperÃ§u de l'image</label>
                        <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                          <Image
                            src={editingToy.image}
                            alt="AperÃ§u"
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
                      onChange={(e) => setEditingToy({...editingToy, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                      placeholder="Description du jouet..."
                    />
                  </div>
                </div>

                {/* Section VisibilitÃ© et statut */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    VisibilitÃ© et statut
                  </h3>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingToy.isVisible}
                        onChange={(e) => setEditingToy({...editingToy, isVisible: e.target.checked})}
                        className="rounded border-gray-300 text-mint focus:ring-mint"
                      />
                      <span className="text-sm text-gray-700">Visible sur le site</span>
                    </label>
                  </div>
                </div>

                {/* Section VidÃ©o YouTube */}
                <div className="bg-red-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Play className="h-5 w-5 text-red-600" />
                    VidÃ©o YouTube
                  </h3>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingToy.hasVideo || false}
                        onChange={(e) => setEditingToy({...editingToy, hasVideo: e.target.checked})}
                        className="rounded border-gray-300 text-mint focus:ring-mint"
                      />
                      <span className="text-sm text-gray-700">Afficher le bouton vidÃ©o</span>
                    </label>
                  </div>

                  {editingToy.hasVideo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL de la vidÃ©o YouTube</label>
                      <input
                        type="url"
                        value={editingToy.videoUrl || ''}
                        onChange={(e) => setEditingToy({...editingToy, videoUrl: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-mint focus:border-mint ${
                          editingToy.videoUrl && !isValidYouTubeUrl(editingToy.videoUrl) 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      {editingToy.videoUrl && !isValidYouTubeUrl(editingToy.videoUrl) && (
                        <p className="text-xs text-red-500 mt-1">
                          âš ï¸ URL YouTube invalide. Format attendu: https://www.youtube.com/watch?v=VIDEO_ID
                        </p>
                      )}
                      {editingToy.videoUrl && isValidYouTubeUrl(editingToy.videoUrl) && (
                        <p className="text-xs text-green-600 mt-1">
                          âœ… URL YouTube valide
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Collez l'URL complÃ¨te de la vidÃ©o YouTube (ex: https://www.youtube.com/watch?v=VIDEO_ID)
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex gap-3">
                <button
                  onClick={() => saveChanges(editingToy.id, editingToy)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-mint px-4 py-2 font-medium text-white hover:bg-mint/90 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Sauvegarder
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
                        onChange={(e) => setNewToy({...newToy, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                        placeholder="Ex: Lego Technic"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CatÃ©gorie *</label>
                      <select
                        value={newToy.category}
                        onChange={(e) => setNewToy({...newToy, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                      >
                        <option value="">SÃ©lectionner une catÃ©gorie</option>
                        {categoryOptions.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ã‚ge recommandÃ© *</label>
                      <select
                        value={newToy.age}
                        onChange={(e) => setNewToy({...newToy, age: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                      >
                        <option value="">SÃ©lectionner un Ã¢ge</option>
                        {ageOptions.map(age => (
                          <option key={age} value={age}>{age}</option>
                        ))}
                      </select>
                    </div>
                    
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
                          Formats acceptÃ©s: JPG, PNG, GIF (max 5MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newToy.description}
                      onChange={(e) => setNewToy({...newToy, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                      placeholder="Description du jouet..."
                    />
                  </div>

                  {/* AperÃ§u de l'image */}
                  {newToy.hasImage && newToy.image && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">AperÃ§u de l'image</label>
                      <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                        <Image
                          src={newToy.image}
                          alt="AperÃ§u"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section VisibilitÃ© */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    VisibilitÃ©
                  </h3>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newToy.isVisible}
                        onChange={(e) => setNewToy({...newToy, isVisible: e.target.checked})}
                        className="rounded border-gray-300 text-mint focus:ring-mint"
                      />
                      <span className="text-sm text-gray-700">Visible sur le site</span>
                    </label>
                </div>

                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note :</strong> Les prix et promotions sont gÃ©rÃ©s via le bouton "GÃ©rer les prix" dans la liste des jouets.
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
                        onChange={(e) => setEditedPrices({...editedPrices, daily: Number(e.target.value)})}
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
                        onChange={(e) => setEditedPrices({...editedPrices, weekly: Number(e.target.value)})}
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
                        onChange={(e) => setEditedPrices({...editedPrices, monthly: Number(e.target.value)})}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-mint focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate mb-2">
                        Caution (MAD)
                      </label>
                      <input
                        type="number"
                        value={editedPrices.deposit}
                        onChange={(e) => setEditedPrices({...editedPrices, deposit: Number(e.target.value)})}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-mint focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Gestion des promotions */}
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
                    <span className="text-green-600">ðŸŽ¯</span>
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
                              <option value="text">Texte personnalisÃ©</option>
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
                                           selectedToyForPricing.promotion?.type === 'fixed' ? 'Ex: 10' : 'Ex: Offre spÃ©ciale'}
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
                            placeholder="Ex: -20% ou Offre limitÃ©e"
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de dÃ©but (optionnel)</label>
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

      {/* Modal de gestion du stock - AmÃ©liorÃ© */}
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
                    <p className="text-sm text-gray-600">Mettez Ã  jour la quantitÃ© disponible</p>
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        parseInt(String(selectedToyForStock.stock || '0')) > 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        Stock actuel: {selectedToyForStock.stock || '0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ContrÃ´le du stock */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-100">
                  <label className="block text-sm font-bold text-gray-900 mb-4 text-center">
                    Nouvelle quantitÃ© en stock
                  </label>
                  
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                      onClick={() => setEditedStock(Math.max(0, editedStock - 1))}
                      className="rounded-xl bg-white border-2 border-gray-300 p-3 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:scale-105 active:scale-95"
                      disabled={editedStock <= 0}
                    >
                      <span className="text-2xl font-bold">âˆ’</span>
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
                        unitÃ©s
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
                  <div className={`mt-6 p-4 rounded-xl border-2 ${
                    editedStock > 0
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${
                        editedStock > 0 ? 'bg-green-500' : 'bg-red-500'
                      } animate-pulse`}></div>
                      <span className={`text-base font-bold ${
                        editedStock > 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {editedStock > 0 
                          ? `âœ… ${editedStock} unitÃ©(s) disponible(s) - En stock`
                          : 'âš ï¸ Rupture de stock - Produit indisponible'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info supplÃ©mentaire */}
                {editedStock !== parseInt(String(selectedToyForStock.stock || '0')) && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <p className="font-semibold mb-1">Modification en attente</p>
                        <p>Le stock passera de <span className="font-bold">{selectedToyForStock.stock || '0'}</span> Ã  <span className="font-bold">{editedStock}</span> unitÃ©(s) aprÃ¨s sauvegarde.</p>
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
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-3 text-white font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
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
                    <p className="text-sm text-gray-600">TÃ©lÃ©chargez un fichier CSV</p>
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
                    <strong>Format CSV requis:</strong>
                  </p>
                  <p className="text-xs text-blue-700 mb-3">
                    Le fichier doit contenir les colonnes suivantes : ID, Nom, CatÃ©gorie, Ã‚ge, Prix, Stock, Description, Visible, Image, VidÃ©o URL
                  </p>
                  <button
                    onClick={handleExportCSV}
                    className="text-xs text-blue-600 hover:text-blue-800 underline font-semibold"
                  >
                    TÃ©lÃ©charger un modÃ¨le CSV
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SÃ©lectionner un fichier CSV
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
                              <span className="font-semibold">Cliquez pour tÃ©lÃ©charger</span> ou glissez-dÃ©posez
                            </p>
                            <p className="text-xs text-gray-500">CSV (max. 10MB)</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              showNotification('Le fichier ne doit pas dÃ©passer 10MB', 'error');
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
                      âœ… Fichier sÃ©lectionnÃ©: <span className="font-semibold">{importFile.name}</span>
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
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <CheckCircle className={`h-5 w-5 ${
              notification.type === 'success' ? 'text-green-600' : 'text-red-600'
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





