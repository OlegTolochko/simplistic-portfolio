import type { FigureProps } from "./types";

export default function Figure({ caption, children }: FigureProps) {
  return (
    <figure className="my-10 [&_img]:my-0">
      <div>{children}</div>
      {caption ? <figcaption className="mt-3 text-[0.95rem] leading-6 text-[#6b6962]">{caption}</figcaption> : null}
    </figure>
  );
}
