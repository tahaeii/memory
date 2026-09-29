import { HomePage } from '@/pages/home';
import type { SearchParams } from '@/shared/lib/search-params';

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return <HomePage searchParams={searchParams} />;
}
