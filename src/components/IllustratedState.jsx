export default function IllustratedState({
  imageSrc,
  imageAlt,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={`flex min-h-96 flex-col items-center justify-center gap-6 py-12 text-center ${className}`}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        className="h-56 w-auto max-w-full object-contain"
      />
      <div className="max-w-xl space-y-2">
        <p className="text-xl font-bold text-slate-900">{title}</p>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
