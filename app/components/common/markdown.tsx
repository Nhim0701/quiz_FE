import ReactMarkdown from "react-markdown";

export default function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
          p: ({ ...props }) => (
            <p
              className="mb-2 leading-relaxed text-blue-800 dark:text-blue-300"
              {...props}
            />
          ),
          ul: ({ ...props }) => (
            <ul
              className="list-disc list-inside mb-2 space-y-1 text-blue-800 dark:text-blue-300"
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className="list-decimal list-inside mb-2 space-y-1 text-blue-800 dark:text-blue-300"
              {...props}
            />
          ),
          li: ({ ...props }) => (
            <li
              className="leading-relaxed text-blue-800 dark:text-blue-300"
              {...props}
            />
          ),
          code: ({ ...props }) => (
            <code
              className="block bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 p-2 rounded text-xs font-mono overflow-x-auto"
              {...props}
            />
          ),
          strong: ({ ...props }) => (
            <strong
              className="font-bold text-blue-900 dark:text-blue-200"
              {...props}
            />
          ),
          em: ({ ...props }) => (
            <em
              className="italic text-blue-800 dark:text-blue-300"
              {...props}
            />
          ),
          a: ({ ...props }) => (
            <a
              className="text-blue-600 dark:text-blue-400 hover:underline"
              {...props}
            />
          ),
          h1: ({ ...props }) => (
            <h1
              className="text-base sm:text-lg font-bold mb-2 text-blue-900 dark:text-blue-200"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2
              className="text-sm sm:text-base font-bold mb-2 text-blue-900 dark:text-blue-200"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              className="text-xs sm:text-sm font-bold mb-1 text-blue-900 dark:text-blue-200"
              {...props}
            />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-blue-300 dark:border-blue-700 pl-3 italic my-2 text-blue-800 dark:text-blue-300"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
