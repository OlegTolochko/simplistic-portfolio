import type { FigureProps } from "./token-types";

export default function Figure({ caption, children }: FigureProps) {
  return (
    <figure className="my-10">
      <div>{children}</div>
      {caption ? <figcaption className="mt-3 text-sm leading-6 text-sand-600">{caption}</figcaption> : null}
    </figure>
  );
}
