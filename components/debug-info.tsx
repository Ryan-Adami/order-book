interface DebugInfoProps {
  orderBook: any;
}

export function DebugInfo({ orderBook }: DebugInfoProps) {
  if (!orderBook) return null;

  return (
    <details className="mt-8">
      <summary className="text-white cursor-pointer mb-2">Debug Info</summary>
      <div className="bg-gray-800 p-4 rounded text-xs text-gray-300">
        <pre>{JSON.stringify(orderBook, null, 2)}</pre>
      </div>
    </details>
  );
}
