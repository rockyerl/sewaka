export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#5B132B] border-t-transparent" />
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    </div>
  );
}
