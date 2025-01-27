import { IconLink } from '@tabler/icons-react';

export default function SectionTitle({
  anchor,
  children
}: {
  anchor?: string;
  children: React.ReactNode;
}) {
  return (
    <h3
      className="font-bold text-[16px] md:text-[20px] flex items-center gap-1"
      id={anchor}
    >
      {anchor && (
        <a className="" href={`#${anchor}`}>
          <IconLink />
        </a>
      )}
      {children}
    </h3>
  );
}
