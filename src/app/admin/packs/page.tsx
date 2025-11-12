"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Package,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Check,
  AlertCircle,
  Download,
  Upload,
  RotateCcw
} from "lucide-react";
import { PackManager, Pack } from "@/lib/packs";

const availableColors = [
  { name: "mint", label: "Mint", class: "bg-mint" },
  { name: "peach", label: "Peach", class: "bg-peach" },
  { name: "lilac", label: "Lilac", class: "bg-lilac" },
  { name: "coral", label: "Coral", class: "bg-coral" },
  { name: "sky-blue", label: "Sky Blue", class: "bg-sky-blue" },
  { name: "fresh-green", label: "Fresh Green", class: "bg-fresh-green" }
];

const availableCities = [
  "Casablanca", "Rabat", "Bouskoura", "Mohammedia", "Temara", 
  "Settat", "El Jadida", "Khouribga", "Beni Mellal", "Marrakech"
];

export default function AdminPacksPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Charger les packs depuis le service
  useEffect(() => {
    setPacks(PackManager.getAllPacks());
  }, []);

  // Sauvegarder les packs via le service
  const savePacks = (newPacks: Pack[]) => {
    setPacks(newPacks);
    PackManager.savePacks(newPacks);
  };

  const handleEdit = (pack: Pack) => {
    setEditingPack({ ...pack });
    setIsCreating(false);
  };

  const handleCreate = () => {
    const newPack: Pack = {
      id: `pack-${Date.now()}`,
      name: "Nouveau Pack",
      slug: "nouveau-pack",
      description: "Description du pack",
      priceMonthly: 0,
      toyCount: 1,
      durationMonths: 1,
      depositAmount: 0,
      swapIncluded: true,
      swapFrequencyDays: 30,
      citiesAvailable: ["Casablanca"],
      isActive: true,
      displayOrder: packs.length + 1,
      badge: undefined,
      color: "mint",
      icon: "🎁",
      ageRange: "0-8 ans",
      features: []
    };
    setEditingPack(newPack);
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!editingPack) return;

    const newPacks = isCreating 
      ? [...packs, editingPack]
      : packs.map(p => p.id === editingPack.id ? editingPack : p);
    
    savePacks(newPacks);
    setEditingPack(null);
    setIsCreating(false);
  };

  const handleDelete = (packId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce pack ?')) {
      PackManager.deletePack(packId);
      setPacks(PackManager.getAllPacks());
    }
  };

  const handleToggleActive = (packId: string) => {
    PackManager.togglePackActive(packId);
    setPacks(PackManager.getAllPacks());
  };

  const handleExport = () => {
    const data = PackManager.exportPacks();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'packs-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (PackManager.importPacks(content)) {
          setPacks(PackManager.getAllPacks());
          alert('Packs importés avec succès !');
        } else {
          alert('Erreur lors de l\'importation des packs.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser aux packs par défaut ? Cette action supprimera tous les packs personnalisés.')) {
      PackManager.resetToDefault();
      setPacks(PackManager.getAllPacks());
    }
  };

  const addFeature = () => {
    if (editingPack) {
      setEditingPack({
        ...editingPack,
        features: [...editingPack.features, ""]
      });
    }
  };

  const updateFeature = (index: number, value: string) => {
    if (editingPack) {
      const newFeatures = [...editingPack.features];
      newFeatures[index] = value;
      setEditingPack({
        ...editingPack,
        features: newFeatures
      });
    }
  };

  const removeFeature = (index: number) => {
    if (editingPack) {
      const newFeatures = editingPack.features.filter((_, i) => i !== index);
      setEditingPack({
        ...editingPack,
        features: newFeatures
      });
    }
  };

  const addCity = (city: string) => {
    if (editingPack && !editingPack.citiesAvailable.includes(city)) {
      setEditingPack({
        ...editingPack,
        citiesAvailable: [...editingPack.citiesAvailable, city]
      });
    }
  };

  const removeCity = (city: string) => {
    if (editingPack) {
      setEditingPack({
        ...editingPack,
        citiesAvailable: editingPack.citiesAvailable.filter(c => c !== city)
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <h1 className="text-xl font-bold text-charcoal">Gestion des Packs</h1>
                <p className="text-sm text-gray-600">Modifiez les packs et leurs prix</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? 'Masquer' : 'Aperçu'}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 transition"
              >
                <Download className="h-4 w-4" />
                Exporter
              </button>
              <label className="flex items-center gap-2 rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-200 transition cursor-pointer">
                <Upload className="h-4 w-4" />
                Importer
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 transition"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 rounded-lg bg-mint px-3 py-2 text-sm font-medium text-white hover:bg-mint/90 transition"
              >
                <Plus className="h-4 w-4" />
                Nouveau Pack
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate">Total Packs</p>
                <p className="text-2xl font-bold text-charcoal">{packs.length}</p>
              </div>
              <div className="rounded-full bg-mint/10 p-3">
                <Package className="h-6 w-6 text-mint" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate">Packs Actifs</p>
                <p className="text-2xl font-bold text-charcoal">
                  {packs.filter(p => p.isActive).length}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate">Prix Moyen</p>
                <p className="text-2xl font-bold text-charcoal">
                  {packs.length > 0 ? Math.round(packs.reduce((sum, p) => sum + p.priceMonthly, 0) / packs.length) : 0} MAD
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate">Jouets Moyens</p>
                <p className="text-2xl font-bold text-charcoal">
                  {packs.length > 0 ? Math.round(packs.reduce((sum, p) => sum + p.toyCount, 0) / packs.length) : 0}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Packs List */}
        <div className="space-y-4">
          {packs.map((pack) => (
            <div key={pack.id} className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{pack.icon}</div>
                  <div>
                    <h3 className="font-semibold text-charcoal">{pack.name}</h3>
                    <p className="text-sm text-slate">{pack.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                    pack.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {pack.isActive ? 'Actif' : 'Inactif'}
                  </span>
                  <button
                    onClick={() => handleToggleActive(pack.id)}
                    className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-600 hover:bg-gray-200"
                  >
                    {pack.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    onClick={() => handleEdit(pack)}
                    className="flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-600 hover:bg-blue-200"
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(pack.id)}
                    className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1 text-sm text-red-600 hover:bg-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-slate">Prix mensuel</p>
                    <p className="text-sm font-medium text-charcoal">{pack.priceMonthly} MAD</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-slate">Jouets</p>
                    <p className="text-sm font-medium text-charcoal">{pack.toyCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-slate">Durée</p>
                    <p className="text-sm font-medium text-charcoal">{pack.durationMonths} mois</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-slate">Villes</p>
                    <p className="text-sm font-medium text-charcoal">{pack.citiesAvailable.length}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editingPack && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-charcoal">
                  {isCreating ? 'Créer un nouveau pack' : 'Modifier le pack'}
                </h2>
                <button
                  onClick={() => setEditingPack(null)}
                  className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Informations de base */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-charcoal">Informations de base</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate mb-2">Nom du pack</label>
                    <input
                      type="text"
                      value={editingPack.name}
                      onChange={(e) => setEditingPack({...editingPack, name: e.target.value})}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-charcoal focus:border-mint focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate mb-2">Slug (URL)</label>
                    <input
                      type="text"
                      value={editingPack.slug}
                      onChange={(e) => setEditingPack({...editingPack, slug: e.target.value})}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-charcoal focus:border-mint focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate mb-2">Description</label>
                    <textarea
                      value={editingPack.description}
                      onChange={(e) => setEditingPack({...editingPack, description: e.target.value})}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-charcoal focus:border-mint focus:outline-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate mb-2">Badge (optionnel)</label>
                    <input
                      type="text"
                      value={editingPack.badge || ''}
                      onChange={(e) => setEditingPack({...editingPack, badge: e.target.value || undefined})}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-charcoal focus:border-mint focus:outline-none"
                      placeholder="Ex: Le plus populaire"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate mb-2">Icône</label>
                    <input
                      type="text"
                      value={editingPack.icon}
                      onChange={(e) => setEditingPack({...editingPack, icon: e.target.value})}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-charcoal focus:border-mint focus:outline-none"
                      placeholder="🎁"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate mb-2">Couleur</label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableColors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setEditingPack({...editingPack, color: color.name})}
                          className={`p-2 rounded-lg border-2 ${
                            editingPack.color === color.name 
                              ? 'border-mint' 
                              : 'border-gray-200'
                          }`}
                        >
                          <div className={`w-full h-8 rounded ${color.class}`}></div>
                          <p className="text-xs mt-1">{color.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Prix et configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-charcoal">Prix et configuration</h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate mb-2">Prix mensuel (MAD)</label>
                      <input
                        type="number"
                        value={editingPack.priceMonthly}
                        onChange={(e) => setEditingPack({...editingPack, priceMonthly: Number(e.target.value)})}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-charcoal focus:border-mint focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate mb-2">Caution (MAD)</label>
                      <input
                        type="number"
                        value={editingPack.depositAmount}
                        onChange={(e) => setEditingPack({...editingPack, depositAmount: Number(e.target.value)})}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-charcoal focus:border-mint focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate mb-2">Nombre de jouets</label>
                      <input
                        type="number"
                        value={editingPack.toyCount}
                        onChange={(e) => setEditingPack({...editingPack, toyCount: Number(e.target.value)})}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-charcoal focus:border-mint focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate mb-2">Durée (mois)</label>
                      <input
                        type="number"
                        value={editingPack.durationMonths}
                        onChange={(e) => setEditingPack({...editingPack, durationMonths: Number(e.target.value)})}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-charcoal focus:border-mint focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate mb-2">Tranche d'âge</label>
                    <input
                      type="text"
                      value={editingPack.ageRange}
                      onChange={(e) => setEditingPack({...editingPack, ageRange: e.target.value})}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-charcoal focus:border-mint focus:outline-none"
                      placeholder="Ex: 0-8 ans"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingPack.swapIncluded}
                        onChange={(e) => setEditingPack({...editingPack, swapIncluded: e.target.checked})}
                        className="rounded border-gray-300 text-mint focus:ring-mint"
                      />
                      <span className="text-sm text-slate">Échanges inclus</span>
                    </label>
                  </div>

                  {editingPack.swapIncluded && (
                    <div>
                      <label className="block text-sm font-medium text-slate mb-2">Fréquence d'échange (jours)</label>
                      <input
                        type="number"
                        value={editingPack.swapFrequencyDays || 30}
                        onChange={(e) => setEditingPack({...editingPack, swapFrequencyDays: Number(e.target.value)})}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-charcoal focus:border-mint focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate mb-2">Villes disponibles</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editingPack.citiesAvailable.map((city, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 rounded-full bg-mint/10 px-3 py-1 text-sm text-mint"
                        >
                          {city}
                          <button
                            onClick={() => removeCity(city)}
                            className="text-mint hover:text-mint/70"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addCity(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-charcoal focus:border-mint focus:outline-none"
                    >
                      <option value="">Ajouter une ville</option>
                      {availableCities
                        .filter(city => !editingPack.citiesAvailable.includes(city))
                        .map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-charcoal mb-4">Fonctionnalités</h3>
                <div className="space-y-2">
                  {editingPack.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-charcoal focus:border-mint focus:outline-none"
                        placeholder="Fonctionnalité du pack"
                      />
                      <button
                        onClick={() => removeFeature(index)}
                        className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addFeature}
                    className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter une fonctionnalité
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setEditingPack(null)}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-lg bg-mint px-4 py-2 text-sm font-medium text-white hover:bg-mint/90"
                >
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-charcoal">Aperçu des packs</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {packs.filter(p => p.isActive).map((pack) => (
                  <div
                    key={pack.id}
                    className={`relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl ${
                      pack.badge ? "ring-4 ring-mint" : "shadow-mist/30"
                    }`}
                  >
                    {pack.badge && (
                      <div className="absolute left-0 right-0 top-0 bg-gradient-to-r from-mint to-fresh-green py-2 text-center text-sm font-bold uppercase tracking-wide text-white">
                        ⭐ {pack.badge}
                      </div>
                    )}

                    <div className={pack.badge ? "mt-8" : ""}>
                      <div className="text-6xl">{pack.icon}</div>
                      <h3 className="mt-6 text-2xl font-bold text-charcoal">
                        {pack.name}
                      </h3>
                      <p className="mt-2 text-sm text-slate">{pack.description}</p>

                      <div className="mt-6">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-charcoal">
                            {pack.priceMonthly}
                          </span>
                          <span className="text-lg text-slate">MAD/mois</span>
                        </div>
                        <p className="mt-2 text-sm text-slate">
                          Soit {Math.round(pack.priceMonthly / pack.toyCount)} MAD par jouet
                        </p>
                      </div>

                      <ul className="mt-8 space-y-3">
                        {pack.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 text-sm text-slate"
                          >
                            <Check size={18} className="mt-0.5 flex-shrink-0 text-mint" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
