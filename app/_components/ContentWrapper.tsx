export default function ContentWrapper({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="w-full max-w-[1200px] 2xl:max-w-[1440px] 4xl:max-w-[1600px] mx-auto"
      // style={{ minHeight: `calc(100vh - 58px)` }}
    >
      {children}
    </div>
  );
}
