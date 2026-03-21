import { Shuffle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useShuffleSettingsStore, type ShuffleMode } from "../hooks/use-shuffle-settings";

type NonNullShuffleMode = Exclude<ShuffleMode, null>;

const SHUFFLE_ITEMS: {
  mode: NonNullShuffleMode;
  label: string;
}[] = [
  {
    mode: "questions",
    label: "Shuffle Questions",
  },
  {
    mode: "answers",
    label: "Shuffle Answers",
  },
  {
    mode: "both",
    label: "Shuffle Questions and Answers",
  },
];

export function ShuffleControls() {
  const { mode, toggleMode } = useShuffleSettingsStore();

  const handleToggle = (itemMode: NonNullShuffleMode) => {
    toggleMode(itemMode);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center justify-between">
          <span className="uppercase tracking-wide text-sm font-semibold text-slate-700 dark:text-slate-300">
            Shuffle Controls
          </span>
          <Shuffle className="h-4 w-4 text-blue-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {SHUFFLE_ITEMS.map((item) => (
          <div key={item.mode} className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {item.label}
            </span>
            <Switch
              checked={mode === item.mode}
              onCheckedChange={() => handleToggle(item.mode)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
