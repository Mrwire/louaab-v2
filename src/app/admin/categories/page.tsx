"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Package,
  Plus,
  Edit,
  Save,
  X,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Smile,
  Image as ImageIcon,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

// Liste d'icônes prédéfinies (emojis populaires pour les catégories)
const PREDEFINED_EMOJIS = [
  '🧩', '🎨', '🚗', '🏀', '🎮', '🎵', '📚', '🧸', '🎭', '⚽',
  '🎪', '🎸', '🎹', '🎯', '🦁', '🐻', '🐰', '🌟', '⭐', '💫'
];

// Liste d'icônes Lucide populaires
const PREDEFINED_ICONS = [
  'Puzzle', 'Palette', 'Car', 'Basketball', 'Gamepad2', 'Music', 'Book', 'Baby', 'Drama', 'Target'
];

interface Category {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  iconType: 'emoji' | 'upload' | 'icon';
  icon: string;
  iconUrl?: string;
  parentId?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || '/api')
  : 'http://localhost:3001/api';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    slug: '',
    iconType: 'emoji',
    icon: '🧩',
    displayOrder: 0,
    isActive: true,
  });

  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/categories/all`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCategories(result.data || []);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      showNotification('Erreur lors du chargement des catégories', 'error');
    } finally {
      setLoading(false);
    }
  };

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
      .replace(/^-|-$/g, '');
  };

  const handleAddCategory = async (categoryData: Partial<Category>) => {
    if (!categoryData.name) {
      showNotification('Veuillez remplir le nom', 'error');
      return;
    }

    try {
      const dataToSend = {
        ...categoryData,
        slug: categoryData.slug || generateSlug(categoryData.name || ''),
      };

      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        showNotification('Catégorie ajoutée avec succès !');
        setShowAddForm(false);
        setNewCategory({
          name: '',
          slug: '',
          iconType: 'emoji',
          icon: '🧩',
          displayOrder: 0,
          isActive: true,
        });
        loadCategories();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'ajout');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      showNotification(error instanceof Error ? error.message : 'Erreur lors de l\'ajout de la catégorie', 'error');
    }
  };

  const handleUpdateCategory = async (categoryData: Partial<Category>) => {
    if (!categoryData.id) return;

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        showNotification('Catégorie mise à jour avec succès !');
        setEditingCategory(null);
        loadCategories();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      showNotification(error instanceof Error ? error.message : 'Erreur lors de la mise à jour', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showNotification('Catégorie supprimée avec succès !');
        loadCategories();
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  const renderIcon = (category: Category) => {
    if (category.iconType === 'emoji') {
      return <span className="text-4xl">{category.icon}</span>;
    } else if (category.iconType === 'upload' && category.iconUrl) {
      return (
        <Image
          src={category.iconUrl}
          alt={category.name}
          width={48}
          height={48}
          className="rounded-lg object-cover"
        />
      );
    } else if (category.iconType === 'icon') {
      return <span className="text-4xl">🎯</span>;
    }
    return <span className="text-4xl">🧩</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-mint" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-xl font-bold text-charcoal">Gestion des Catégories</h1>
                <p className="text-sm text-gray-600">Gérez les catégories de jouets affichées sur le site</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 rounded-lg bg-mint px-4 py-2 text-sm font-medium text-white hover:bg-mint/90"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Categories Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`rounded-xl bg-white p-6 shadow-sm border-2 transition-all duration-200 ${
                category.isActive
                  ? 'border-gray-200 hover:border-mint hover:shadow-md'
                  : 'border-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {renderIcon(category)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-xs text-gray-500">{category.slug}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingCategory(category)}
                  className="p-2 text-gray-400 hover:text-mint transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {category.description && (
                  <p className="text-xs line-clamp-2">{category.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span>Ordre:</span>
                  <span className="font-medium">{category.displayOrder}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Statut:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      category.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {category.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`${API_BASE_URL}/categories/${category.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isActive: !category.isActive }),
                      });
                      if (response.ok) {
                        loadCategories();
                      }
                    } catch (error) {
                      console.error('Erreur:', error);
                    }
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    category.isActive
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {category.isActive ? <EyeOff className="h-3 w-3 mx-auto" /> : <Eye className="h-3 w-3 mx-auto" />}
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune catégorie</h3>
            <p className="mt-2 text-gray-600">Commencez par ajouter une catégorie</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal - Similaire à celui des âges */}
      {showAddForm && (
        <CategoryModal
          category={newCategory}
          onClose={() => {
            setShowAddForm(false);
            setNewCategory({
              name: '',
              slug: '',
              iconType: 'emoji',
              icon: '🧩',
              displayOrder: 0,
              isActive: true,
            });
          }}
          onSave={(data) => handleAddCategory(data)}
          isEditing={false}
          predefinedEmojis={PREDEFINED_EMOJIS}
          predefinedIcons={PREDEFINED_ICONS}
          categories={categories}
        />
      )}
      
      {editingCategory && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setEditingCategory(null);
          }}
          onSave={(data) => handleUpdateCategory(data)}
          isEditing={true}
          predefinedEmojis={PREDEFINED_EMOJIS}
          predefinedIcons={PREDEFINED_ICONS}
          categories={categories.filter(c => c.id !== editingCategory.id)}
        />
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-4 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
              notification.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <CheckCircle
              className={`h-5 w-5 ${
                notification.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            />
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

// Composant Modal pour Add/Edit Category
function CategoryModal({
  category,
  onClose,
  onSave,
  isEditing,
  predefinedEmojis,
  predefinedIcons,
  categories,
}: {
  category: Partial<Category>;
  onClose: () => void;
  onSave: (data: Partial<Category>) => void;
  isEditing: boolean;
  predefinedEmojis: string[];
  predefinedIcons: string[];
  categories: Category[];
}) {
  const [formData, setFormData] = useState<Partial<Category>>(category);
  const [iconType, setIconType] = useState<'emoji' | 'upload' | 'icon'>(category.iconType || 'emoji');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setFormData(category);
    setIconType(category.iconType || 'emoji');
  }, [category]);

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 2MB');
        return;
      }
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData({ ...formData, iconUrl: url, iconType: 'upload' });
    }
  };

  const handleSave = () => {
    if (!formData.name) {
      alert('Veuillez remplir le nom');
      return;
    }
    
    const generateSlugFromName = (name: string) => {
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
        .replace(/^-|-$/g, '');
    };
    
    const finalData: Partial<Category> = {
      ...formData,
      iconType,
      slug: formData.slug || generateSlugFromName(formData.name || ''),
    };
    
    if (isEditing && category.id) {
      finalData.id = category.id;
    }
    
    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg bg-white/80 p-2 text-gray-600 hover:bg-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => {
                  const slug = e.target.value
                    .toLowerCase()
                    .replace(/[éèêë]/g, 'e')
                    .replace(/[àâä]/g, 'a')
                    .replace(/[ôö]/g, 'o')
                    .replace(/[ûüù]/g, 'u')
                    .replace(/[ïî]/g, 'i')
                    .replace(/ç/g, 'c')
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
                  setFormData({ ...formData, name: e.target.value, slug });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Jeux de construction"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Description de la catégorie..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordre d'affichage
              </label>
              <input
                type="number"
                value={formData.displayOrder || 0}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie parente (optionnel)
                </label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Aucune (catégorie principale)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Sélection du type d'icône - Identique à celui des âges */}
          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type d'icône
            </label>
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setIconType('emoji')}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  iconType === 'emoji'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <Smile className="h-4 w-4 mx-auto mb-1" />
                <span className="text-xs">Emoji</span>
              </button>
              <button
                onClick={() => setIconType('upload')}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  iconType === 'upload'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <Upload className="h-4 w-4 mx-auto mb-1" />
                <span className="text-xs">Upload</span>
              </button>
              <button
                onClick={() => setIconType('icon')}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  iconType === 'icon'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <ImageIcon className="h-4 w-4 mx-auto mb-1" />
                <span className="text-xs">Icône</span>
              </button>
            </div>

            {/* Sélection Emoji */}
            {iconType === 'emoji' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choisir un emoji
                </label>
                <div className="grid grid-cols-10 gap-2 p-4 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
                  {predefinedEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                      className={`p-2 rounded-lg text-2xl hover:bg-white transition-colors ${
                        formData.icon === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.icon || ''}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ou tapez un emoji directement"
                  maxLength={2}
                />
              </div>
            )}

            {/* Upload d'image */}
            {iconType === 'upload' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uploader une icône
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG (max. 2MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="hidden"
                  />
                </label>
                {previewUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Aperçu:</p>
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={64}
                      height={64}
                      className="rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Sélection d'icône Lucide */}
            {iconType === 'icon' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choisir une icône
                </label>
                <div className="grid grid-cols-8 gap-2 p-4 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
                  {predefinedIcons.map((iconName) => (
                    <button
                      key={iconName}
                      onClick={() => setFormData({ ...formData, icon: iconName })}
                      className={`p-2 rounded-lg border-2 hover:bg-white transition-colors ${
                        formData.icon === iconName
                          ? 'border-blue-500 bg-blue-100'
                          : 'border-gray-200'
                      }`}
                      title={iconName}
                    >
                      <span className="text-xs">{iconName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Statut */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive !== false}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700">Actif</label>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 text-white font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
          >
            <Save className="h-5 w-5" />
            {isEditing ? 'Sauvegarder' : 'Ajouter'}
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            <X className="h-5 w-5" />
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

