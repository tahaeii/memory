import Link from 'next/link';

/** A section title with a link to the full page on the right. */
export function SectionHead({ title, href, link }: { title: string; href: string; link: string }) {
  return (
    <div className='mb-6 flex items-baseline justify-between gap-4 sm:mb-8'>
      <h2 className='type-section'>{title}</h2>
      <Link href={href} className='link-underline text-link shrink-0 text-sm font-semibold'>
        {link}
      </Link>
    </div>
  );
}
