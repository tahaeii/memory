import { Fragment, type ReactNode } from 'react';
import { t, type MessageKey, type MessageValues } from './index';

type Renderers = Record<string, (text: string) => ReactNode>;

/**
 * A text with marked parts, so a sentence stays whole in the message file:
 *
 *   "previewing": "Previewing <b>{style}</b>."
 *   rich('home.previewing', { b: (text) => <strong>{text}</strong> }, { style })
 *
 * Tags are plain names without attributes and do not nest.
 */
export function rich(key: MessageKey, renderers: Renderers, values?: MessageValues): ReactNode {
  const text = t(key, values);
  const nodes: ReactNode[] = [];
  let index = 0;
  for (const match of text.matchAll(/<(\w+)>(.*?)<\/\1>/g)) {
    if (match.index > index) nodes.push(text.slice(index, match.index));
    const render = renderers[match[1]];
    nodes.push(<Fragment key={match.index}>{render ? render(match[2]) : match[2]}</Fragment>);
    index = match.index + match[0].length;
  }
  if (index < text.length) nodes.push(text.slice(index));
  return nodes;
}
