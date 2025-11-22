// QuizApp.jsx
import { useState } from "react";

const sampleData = [
  {
    category: "Sales",
    question: "Up to this point, two sales reps have had separate accounts and opportunities...",
    options: [
      { text: "Grant Read access on the accounts cases.", correct: true },
      { text: "View one of the opportunities on the account.", correct: true },
      { text: "View the account and keep activities private.", correct: false },
      { text: "Edit all opportunities on the account.", correct: false },
    ],
    explanation: "Correct actions are A and B because they allow proper account collaboration."
  },
  // thêm nhiều question khác
];

export default function QuizApp() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [readLater, setReadLater] = useState(false);

  const question = sampleData[currentIndex];

  const handleSelect = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleNext = () => {
    setSelected([]);
    if (currentIndex < sampleData.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleBack = () => {
    setSelected([]);
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 border rounded-lg shadow">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <div>Username: HieuNguyen</div>
        <div>
          Category:{" "}
          <select className="border px-2 py-1 rounded bg-yellow-200">
            <option value="Sales">Sales</option>
            <option value="AWS">AWS</option>
            <option value="JLPT">JLPT</option>
          </select>
        </div>
        <div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="mr-1"
              checked={readLater}
              onChange={() => setReadLater(!readLater)}
            />
            Read later
          </label>
        </div>
      </div>

      {/* Question number */}
      <div className="text-center mb-4">
        Question number {currentIndex + 1}/{sampleData.length}
      </div>

      {/* Question text */}
      <div className="mb-4 border p-4 rounded">{question.question}</div>

      {/* Options */}
      <div className="mb-4">
        {question.options.map((opt, idx) => {
          let bg = "bg-white";
          if (selected.includes(idx)) {
            bg = opt.correct ? "bg-green-200" : "bg-red-200";
          } else if (!opt.correct && selected.length && question.options.some(o => o.correct && selected.includes(question.options.indexOf(o)))) {
            // highlight correct if user selected wrong
            bg = opt.correct ? "bg-green-200" : bg;
          }

          return (
            <button
              key={idx}
              className={`w-full text-left p-2 my-1 border rounded ${bg}`}
              onClick={() => handleSelect(idx)}
            >
              {String.fromCharCode(65 + idx)} : {opt.text}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {selected.length > 0 && (
        <div className="border-t pt-2 text-gray-700">{question.explanation}</div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={handleBack}
          disabled={currentIndex === 0}
        >
          Back
        </button>
        <button
          className="px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-500"
          onClick={handleNext}
          disabled={currentIndex === sampleData.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
