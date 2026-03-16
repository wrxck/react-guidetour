import { ReactElement, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { canUseDOM } from '~/modules/dom';

interface Props {
  children: ReactElement;
  id: string;
}

export default function JoyridePortal({ children, id }: Props) {
  const nodeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!canUseDOM()) {
      return;
    }

    const node = document.createElement('div');
    node.id = id;
    document.body.appendChild(node);
    nodeRef.current = node;

    return () => {
      if (node.parentNode === document.body) {
        document.body.removeChild(node);
      }
      nodeRef.current = null;
    };
  }, [id]);

  if (!canUseDOM() || !nodeRef.current) {
    return null;
  }

  return createPortal(children, nodeRef.current);
}
