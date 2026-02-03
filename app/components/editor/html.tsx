export default function Html({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  // Convert both literal \n and actual newlines to <br> for proper line breaks
  const formattedContent = content
    ?.replace(/\\n/g, '<br>')  // Handle literal \n (backslash + n)
    .replace(/\n/g, '<br>')    // Handle actual newline characters
    || '';

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    ></div>
  );
}
