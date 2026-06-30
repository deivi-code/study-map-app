const NODE = 76

export function LoadingSkeleton() {
  const items = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    level: Math.floor(i / 3),
    delay: i * 0.06,
  }))

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="space-y-6">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex justify-center gap-8">
            {items
              .filter((n) => n.level === row)
              .map((n) => (
                <div
                  key={n.id}
                  className="animate-pulse rounded-full bg-muted"
                  style={{ width: NODE, height: NODE }}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}
