import type { Property } from 'csstype';

declare module 'csstype' {
  interface Properties {
    scrollbarWidth?: Property.ScrollbarWidth;
    scrollbarColor?: Property.ScrollbarColor;
  }
} 