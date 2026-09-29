import type { HeroStyle } from '@contracts/branding';
import { CoverHero } from './hero/CoverHero';
import { EditorialHero } from './hero/EditorialHero';
import { FilmstripHero } from './hero/FilmstripHero';
import { MinimalHero } from './hero/MinimalHero';
import { MosaicHero } from './hero/MosaicHero';
import type { HeroProps } from './hero/parts';
import { SlideshowHero } from './hero/SlideshowHero';
import { WallHero } from './hero/WallHero';

export type { HeroStat } from './hero/parts';

/** How many recent photos each style needs to look right; with fewer, the minimal style is shown. */
const NEEDS: Record<HeroStyle, number> = {
  wall: 6,
  cover: 1,
  filmstrip: 8,
  mosaic: 5,
  slideshow: 2,
  editorial: 2,
  minimal: 0,
};

/** The home page opening, in the style chosen in Dashboard › Branding. */
export function HomeHero({ style, ...props }: HeroProps & { style: HeroStyle }) {
  const usable = style === 'cover' ? (props.featured?.cover ? 1 : props.photos.length) : props.photos.length;
  const shown: HeroStyle = usable >= NEEDS[style] ? style : 'minimal';
  switch (shown) {
    case 'wall':
      return <WallHero {...props} />;
    case 'cover':
      return <CoverHero {...props} />;
    case 'filmstrip':
      return <FilmstripHero {...props} />;
    case 'mosaic':
      return <MosaicHero {...props} />;
    case 'slideshow':
      return <SlideshowHero {...props} />;
    case 'editorial':
      return <EditorialHero {...props} />;
    default:
      return <MinimalHero {...props} />;
  }
}
