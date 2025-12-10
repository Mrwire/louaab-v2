import re

file_path = '/root/louaab-project/src/app/admin/inventory/page.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# We need to replace the entire handleAddToy from toyToAdd to the closing of the function
# The pattern: from "const toyToAdd:" to "triggerRevalidation();" before "};  // end handleAddToy"

new_code = '''// Build payload for backend API
    const createPayload = {
      name: newToy.name,
      slug: generateSlug(newToy.name),
      description: newToy.description || '',
      videoUrl: newToy.hasVideo ? (newToy.videoUrl || '') : null,
      stockQuantity: 1,
      availableQuantity: 1,
      status: 'available',
      isActive: newToy.isVisible !== false,
      images: finalImageUrl ? [{ url: finalImageUrl, isPrimary: true }] : [],
    };

    try {
      const response = await fetch(`${API_BASE_URL}/toys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur serveur (${response.status})`);
      }

      const result = await response.json();
      const savedToy = result.data;

      const toyToAdd: InventoryItem = {
        id: savedToy.id,
        backendId: savedToy.id,
        slug: savedToy.slug || generateSlug(newToy.name),
        name: savedToy.name || newToy.name,
        price: 'Prix a definir',
        category: newToy.category || '',
        age: newToy.age || '',
        description: savedToy.description || newToy.description || '',
        image: savedToy.images?.[0]?.url || finalImageUrl,
        thumbnail: savedToy.images?.[0]?.url || finalImageUrl,
        hasImage: !!savedToy.images?.length || newToy.hasImage || false,
        rating: '4',
        stock: String(savedToy.stockQuantity || 1),
        videoUrl: savedToy.videoUrl || newToy.videoUrl || '',
        hasVideo: !!savedToy.videoUrl || newToy.hasVideo || false,
        source: 'admin',
        isVisible: savedToy.isActive !== false,
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

    } catch (error) {
      console.error('Erreur lors de la cration du jouet:', error);
      showNotification(error instanceof Error ? error.message : 'Erreur lors de la cration du jouet', 'error');
    }
  };'''

# Find handleAddToy function and replace from toyToAdd to the end of function
start_marker = 'const toyToAdd: InventoryItem = {'
end_marker_sequence = ['triggerRevalidation();', '};']

if start_marker in content and 'id: generateToyId()' in content:
    start_idx = content.find(start_marker)
    if start_idx != -1:
        # Find triggerRevalidation after start
        trigger_idx = content.find('triggerRevalidation();', start_idx)
        if trigger_idx != -1:
            # Find the closing }; of the function after triggerRevalidation
            # Look for the pattern "  };" after triggerRevalidation
            end_search_area = content[trigger_idx:trigger_idx+200]
            func_end = end_search_area.find('};')
            if func_end != -1:
                end_idx = trigger_idx + func_end + 2
                content = content[:start_idx] + new_code + content[end_idx:]
                with open(file_path, 'w') as f:
                    f.write(content)
                print('SUCCESS: Patched handleAddToy with complete API POST and try/catch')
            else:
                print('ERROR: Could not find function end };')
        else:
            print('ERROR: Could not find triggerRevalidation')
    else:
        print('ERROR: Could not find toyToAdd start')
else:
    print('ERROR: Target patterns not found - file may already be patched')
