import type { HeroStyle } from '@contracts/branding';
import { FilmstripHero } from './hero/FilmstripHero';
import { MinimalHero } from './hero/MinimalHero';
import { MosaicHero } from './hero/MosaicHero';
import type { HeroProps } from './hero/parts';
import { WallHero } from './hero/WallHero';

/** How many recent photos each style needs to look right; with fewer, the minimal style is shown. */
const NEEDS: Record<HeroStyle, number> = { minimal: 0, wall: 6, filmstrip: 8, mosaic: 5 };

/** The home page opening, in the style chosen in Dashboard › Branding. */
export function HomeHero({ style, ...props }: HeroProps & { style: HeroStyle }) {
  const shown: HeroStyle = props.photos.length >= NEEDS[style] ? style : 'minimal';
  switch (shown) {
    case 'wall':
      return <WallHero {...props} />;
    case 'filmstrip':
      return <FilmstripHero {...props} />;
    case 'mosaic':
      return <MosaicHero {...props} />;
    default:
      return <MinimalHero {...props} />;
  }
}
