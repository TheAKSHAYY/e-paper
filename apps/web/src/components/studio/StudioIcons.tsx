import React from 'react';

export interface StudioIconProps {
  size?: number;
  className?: string;
  color?: string;
}

const baseProps = (size: number, color: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
});

export const DashboardIcon: React.FC<StudioIconProps> = ({ size = 14, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

export const UndoIcon: React.FC<StudioIconProps> = ({ size = 15, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
  </svg>
);

export const RedoIcon: React.FC<StudioIconProps> = ({ size = 15, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="m15 14 5-5-5-5" />
    <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13" />
  </svg>
);

export const SidebarLeftIcon: React.FC<StudioIconProps> = ({
  size = 15,
  color = 'currentColor',
}) => (
  <svg {...baseProps(size, color)}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
  </svg>
);

export const InspectorRightIcon: React.FC<StudioIconProps> = ({
  size = 14,
  color = 'currentColor',
}) => (
  <svg {...baseProps(size, color)}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M15 3v18" />
  </svg>
);

export const PrinterIcon: React.FC<StudioIconProps> = ({ size = 14, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <path d="M6 9V3h12v6" />
    <rect x="6" y="14" width="12" height="7" rx="1" />
  </svg>
);

export const DownloadIcon: React.FC<StudioIconProps> = ({ size = 14, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const TrashIcon: React.FC<StudioIconProps> = ({ size = 13, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

export const LayoutGridIcon: React.FC<StudioIconProps> = ({
  size = 14,
  color = 'currentColor',
}) => (
  <svg {...baseProps(size, color)}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

export const PaletteIcon: React.FC<StudioIconProps> = ({ size = 14, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <circle cx="13.5" cy="6.5" r=".5" fill={color} />
    <circle cx="17.5" cy="10.5" r=".5" fill={color} />
    <circle cx="8.5" cy="7.5" r=".5" fill={color} />
    <circle cx="6.5" cy="12.5" r=".5" fill={color} />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

export const NewspaperIcon: React.FC<StudioIconProps> = ({ size = 14, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8" />
    <path d="M15 18h-5" />
    <path d="M10 6h8v4h-8V6Z" />
  </svg>
);

export const MastheadIcon: React.FC<StudioIconProps> = ({ size = 14, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="6" y1="8" x2="18" y2="8" />
    <line x1="6" y1="12" x2="12" y2="12" />
    <line x1="6" y1="16" x2="18" y2="16" />
  </svg>
);

export const RulerIcon: React.FC<StudioIconProps> = ({ size = 14, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
    <path d="m14.5 12.5 2-2" />
    <path d="m11.5 9.5 2-2" />
    <path d="m8.5 6.5 2-2" />
    <path d="m17.5 15.5 2-2" />
  </svg>
);

export const SlidersIcon: React.FC<StudioIconProps> = ({ size = 14, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="2" y1="14" x2="6" y2="14" />
    <line x1="10" y1="8" x2="14" y2="8" />
    <line x1="18" y1="16" x2="22" y2="16" />
  </svg>
);

export const SparkleIcon: React.FC<StudioIconProps> = ({ size = 13, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

export const ShieldIcon: React.FC<StudioIconProps> = ({ size = 13, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const CopyIcon: React.FC<StudioIconProps> = ({ size = 13, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

export const LayersIcon: React.FC<StudioIconProps> = ({ size = 15, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

export const PlusSquareIcon: React.FC<StudioIconProps> = ({
  size = 15,
  color = 'currentColor',
}) => (
  <svg {...baseProps(size, color)}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export const PenIcon: React.FC<StudioIconProps> = ({ size = 14, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);

export const ChevronLeftIcon: React.FC<StudioIconProps> = ({
  size = 14,
  color = 'currentColor',
}) => (
  <svg {...baseProps(size, color)}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const ChevronRightIcon: React.FC<StudioIconProps> = ({
  size = 14,
  color = 'currentColor',
}) => (
  <svg {...baseProps(size, color)}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const MaximizeIcon: React.FC<StudioIconProps> = ({ size = 14, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
);

export const FileJsonIcon: React.FC<StudioIconProps> = ({ size = 14, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1" />
    <path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1" />
  </svg>
);

export const FolderOpenIcon: React.FC<StudioIconProps> = ({
  size = 14,
  color = 'currentColor',
}) => (
  <svg {...baseProps(size, color)}>
    <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
  </svg>
);

export const ResetIcon: React.FC<StudioIconProps> = ({ size = 13, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export const CloseIcon: React.FC<StudioIconProps> = ({ size = 14, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const ZapIcon: React.FC<StudioIconProps> = ({ size = 14, color = 'currentColor' }) => (
  <svg {...baseProps(size, color)}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const ArrowLeftRightIcon: React.FC<StudioIconProps> = ({
  size = 14,
  color = 'currentColor',
}) => (
  <svg {...baseProps(size, color)}>
    <path d="M8 3 4 7l4 4" />
    <path d="M4 7h16" />
    <path d="m16 21 4-4-4-4" />
    <path d="M20 17H4" />
  </svg>
);

