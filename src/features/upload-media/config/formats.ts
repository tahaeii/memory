/** What the file dialog offers. The server decides by content, so this is only a convenience. */
export const ACCEPTED_FILES = 'image/*,video/*,.heic,.heif,.mkv,.avi,.wmv,.flv,.3gp,.mts,.m2ts';

/** The formats named under the drop area. */
export const PHOTO_FORMATS = ['JPEG', 'PNG', 'HEIC', 'WebP', 'AVIF', 'GIF', 'TIFF'] as const;
export const VIDEO_FORMATS = ['MP4', 'MOV', 'WebM', 'MKV', 'AVI', 'WMV', '3GP', 'MPEG'] as const;
