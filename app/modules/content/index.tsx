import { useState } from "react";
import { adminMiddleware } from "@/middleware/admin";
import { QuestionList } from "../admin/content/components/QuestionList";
import { CategoryFilter } from "../admin/content/components/CategoryFilter";
import { SearchBar } from "../admin/content/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Route } from "./+types/index";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  await adminMiddleware();
  return null;
}

export default function ContentManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Content Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage questions, categories, and answers
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <CategoryFilter
            value={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>
      </div>

      {/* Question List */}
      <QuestionList
        searchQuery={searchQuery}
        categoryId={selectedCategory}
      />
    </div>
  );
}
