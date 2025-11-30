import { useState, useEffect, useMemo } from 'react';
import configurationServices from '@services/features/configuration-service/configurationService';

interface UseSubcategoriesProps {
  selectedCategory?: { id: string; name: string };
  token?: string;
  source?: string;
}

export const useSubcategories = ({ selectedCategory, token, source }: UseSubcategoriesProps) => {
  const [subcategories, setSubcategories] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [subcatLoading, setSubcatLoading] = useState(false);

  // Memoize the category ID to prevent unnecessary API calls
  const categoryId = useMemo(() => selectedCategory?.id, [selectedCategory?.id]);

  // Only load subcategories if navigating from home
  useEffect(() => {
    let active = true;
    const loadSubcategories = async () => {
      // Only show subcategories if navigating from home
      if (source !== 'home') {
        setSubcategories([]);
        return;
      }
      if (!token || !categoryId) {
        setSubcategories([{ id: 'all', name: 'All' }]);
        setSelectedSubcategory('all');
        return;
      }
      try {
        setSubcatLoading(true);
        const res: any = await configurationServices.itemCategoriesById(
          token,
          categoryId,
        );
        const apiSubcats =
          res?.data?.children?.map((s: any) => ({
            id: String(s?.id),
            name: s?.name,
          })) || [];
        if (!active) return;
        setSubcategories([{ id: 'all', name: 'All' }, ...apiSubcats]);
        setSelectedSubcategory('all');
      } catch (e) {
        if (!active) return;
        setSubcategories([{ id: 'all', name: 'All' }]);
        setSelectedSubcategory('all');
      } finally {
        if (active) setSubcatLoading(false);
      }
    };
    loadSubcategories();
    return () => {
      active = false;
    };
  }, [categoryId, token, source]);

  return {
    subcategories,
    selectedSubcategory,
    setSelectedSubcategory,
    subcatLoading,
  };
};
