export default function HeaderNav_IconWrapper({
  children,
  onClick = () => {},
  title
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      className="row text-xs py-[4px] px-[6px] rounded-md text-black dark:text-white relative"
      onClick={onClick}
      title={title}
    >
      <>{children}</>
    </button>
  );
}
