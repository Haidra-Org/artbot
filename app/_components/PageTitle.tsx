export default function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-bold primary-color text-[18px] md:text-[24px] mb-2">
      {children}
    </h1>
  )
}
