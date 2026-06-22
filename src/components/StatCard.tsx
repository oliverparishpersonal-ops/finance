interface Props {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
}

export default function StatCard({ label, value, delta, positive }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {delta && (
        <p className={`text-xs mt-1 font-medium ${positive ? "text-emerald-400" : "text-red-400"}`}>
          {positive ? "▲" : "▼"} {delta}
        </p>
      )}
    </div>
  );
}
