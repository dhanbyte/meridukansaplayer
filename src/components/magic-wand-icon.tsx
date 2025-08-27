import type { SVGProps } from "react";

export function MagicWandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 4V2" />
      <path d="M15 16v-2" />
      <path d="M12.34 7.66.92 19.08" />
      <path d="m19.08.92-2.12 2.12" />
      <path d="m2 15 2-2" />
      <path d="m20 9-2 2" />
      <path d="m9 2-2 2" />
      <path d="m17 17-2 2" />
      <path d="M9 15h6" />
      <path d="M12 12v6" />
    </svg>
  );
}
