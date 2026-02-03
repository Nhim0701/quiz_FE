export default function Html({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  // Convert \n to <br> for proper line breaks
  const formattedContent = content?.replace(/\n/g, '<br>') || '';

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    ></div>
  );
}
