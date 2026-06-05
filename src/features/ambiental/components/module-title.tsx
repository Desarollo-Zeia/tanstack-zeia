interface ModuleTitleProps {
  title: string
}

export function ModuleTitle({ title }: ModuleTitleProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl font-bold text-text-primary tracking-tight">{title}</h1>
    </div>
  )
}
