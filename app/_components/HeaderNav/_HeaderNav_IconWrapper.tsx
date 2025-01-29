export default function HeaderNav_IconWrapper({
  children,
  onClick = () => {}
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="row text-xs py-[4px] px-[6px] rounded-md text-black dark:text-white relative"
      onClick={onClick}
    >
      <>{children}</>
    </button>
  );
}
