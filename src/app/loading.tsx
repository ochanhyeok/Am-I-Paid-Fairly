export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-8 w-48 bg-slate-800 rounded-lg" />
        <div className="h-4 w-32 bg-slate-800/50 rounded" />
      </div>
    </div>
  );
}
