import type { RefObject } from 'react';
import { CYBER_HACKATHON } from '../../events';
import { ART_ALT, DIM_FILTER, LIT_FILTER, OBJECT_POSITION } from './art';
import Watermark from './Watermark';

interface TorchArtProps {
  variant: 'bleed' | 'frame';
  reduce: boolean;
  litRef: RefObject<HTMLDivElement>;
}

/**
 * The two copies of the key art: a dim ghost (carries the alt text) and the lit colour copy
 * under the `.torch` mask. In the bleed variant the lit layer also carries the bright RECORD,
 * so the beam reveals the word on the wall. Under reduced motion the lit layer is unmasked
 * at a steady 55% — the resting state.
 */
export default function TorchArt({ variant, reduce, litRef }: TorchArtProps) {
  const pos = OBJECT_POSITION[variant];
  const objectPosition = `${pos.x * 100}% ${pos.y * 100}%`;
  const imgClass = 'pointer-events-none absolute inset-0 h-full w-full select-none object-cover';

  return (
    <>
      <img
        src={CYBER_HACKATHON.poster}
        alt={ART_ALT}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={imgClass}
        style={{ objectPosition, filter: DIM_FILTER }}
      />
      <div
        ref={litRef}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transform-gpu ${reduce ? '' : 'torch'}`}
        style={{ opacity: 0.55 }}
      >
        <img
          src={CYBER_HACKATHON.poster}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className={imgClass}
          style={{ objectPosition, filter: LIT_FILTER }}
        />
        {variant === 'bleed' && !reduce && <Watermark className="text-fg opacity-[0.22]" />}
      </div>
    </>
  );
}
