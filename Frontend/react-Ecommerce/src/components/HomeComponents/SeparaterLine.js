export default function Separator() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-center gap-4">
        <div className="w-full max-w-[300px] h-[1px] bg-gradient-to-r from-transparent via-[#4B0082] to-transparent opacity-30" />
        <div className="text-[#4B0082] opacity-50">●</div>
        <div className="w-full max-w-[300px] h-[1px] bg-gradient-to-r from-transparent via-[#4B0082] to-transparent opacity-30" />
      </div>
    </div>
  );
}