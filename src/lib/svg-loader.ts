// SVG files as data URLs
import bugSvg from '../assets/bug.svg?raw';
import ideaSvg from '../assets/idea.svg?raw';
import thoughtSvg from '../assets/thought.svg?raw';

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export const bugImageUrl = svgToDataUrl(bugSvg);
export const ideaImageUrl = svgToDataUrl(ideaSvg);
export const thoughtImageUrl = svgToDataUrl(thoughtSvg);

