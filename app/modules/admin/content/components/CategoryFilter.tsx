import { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS } from "@/constants";
import type { ApiSuccessResponse } from "@/types";
import type { Category } from "@/types/content";

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<ApiSuccessResponse<Category[]>>(
        API_ENDPOINTS.ADMIN.CATEGORIES.LIST
      );
      setCategories(response.data.data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:opacity-50"
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.categoryId}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}
