interface QuestionCardProps {
  question: {
    question: string;
    options: string[];
  };
  selected: number | null;
  onSelect: (index: number) => void;
}

export default function QuestionCard({ question, selected, onSelect }: QuestionCardProps) {
  return (
    <div className="border p-4 rounded shadow-md">
      <p className="font-semibold mb-2">{question.question}</p>
      <div className="flex flex-col gap-2">
        {question.options.map((opt, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`p-2 border rounded text-left 
              ${selected === index ? 'bg-blue-200' : 'bg-white'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

