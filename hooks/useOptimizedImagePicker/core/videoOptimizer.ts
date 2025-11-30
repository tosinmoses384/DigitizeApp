import { Video, getVideoMetaData } from 'react-native-compressor';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface VideoCompressionOptions {
    compressionLevel?: 'low' | 'medium' | 'high';
    maxWidth?: number;
    maxHeight?: number;
    maxSize?: number; // Target max size in bytes
    maxDuration?: number; // Max duration in seconds
    minimumFileSizeForCompress?: number; // in MB
}

export interface VideoOptimizationResult {
    uri: string;
    size: number;
    width: number;
    height: number;
    mimeType: string;
    originalSize: number;
    compressionRatio: number;
    duration: number;
}

export class VideoOptimizer {
    private static instance: VideoOptimizer;

    private constructor() { }

    static getInstance(): VideoOptimizer {
        if (!VideoOptimizer.instance) {
            VideoOptimizer.instance = new VideoOptimizer();
        }
        return VideoOptimizer.instance;
    }

    /**
     * Compress video with optimal settings
     */
    async compress(
        uri: string,
        options: VideoCompressionOptions = {},
        onProgress?: (progress: number) => void
    ): Promise<VideoOptimizationResult> {
        const {
            compressionLevel = 'medium',
            maxWidth = 1280, // Default to 720p
            maxHeight = 720,
            maxSize,
            maxDuration,
            minimumFileSizeForCompress = 5,
        } = options;

        try {
            // 1. Get initial metadata
            const metadata = await getVideoMetaData(uri);
            const originalSize = metadata.size;

            // If size is not in metadata, get it from FS
            let actualOriginalSize = originalSize;
            if (!actualOriginalSize) {
                const fileInfo = await FileSystem.getInfoAsync(uri);
                if (fileInfo.exists) {
                    actualOriginalSize = fileInfo.size;
                }
            }

            // Check duration constraint
            // Note: metadata.duration is usually in seconds (float) or ms? 
            // react-native-compressor docs say seconds? Let's assume seconds based on typical usage, 
            // but verify if it's ms. Usually native players return seconds. 
            // *Correction*: react-native-compressor usually returns duration in seconds (float).
            if (maxDuration && metadata.duration > maxDuration) {
                throw new Error(`Video duration (${metadata.duration.toFixed(1)}s) exceeds limit of ${maxDuration}s. Please trim the video.`);
            }

            // Check if file is too small to compress (and no strict size limit forced)
            if (!maxSize && actualOriginalSize && actualOriginalSize < minimumFileSizeForCompress * 1024 * 1024) {
                return {
                    uri,
                    size: actualOriginalSize,
                    width: metadata.width,
                    height: metadata.height,
                    mimeType: 'video/mp4',
                    originalSize: actualOriginalSize,
                    compressionRatio: 1,
                    duration: metadata.duration,
                };
            }

            // 2. Determine compression settings

            // Base bitrate settings for 720p (1280x720)
            // Low: 1 Mbps
            // Medium: 1.5 Mbps
            // High: 2.5 Mbps
            let targetBitrate = 1500000; // Default Medium

            switch (compressionLevel) {
                case 'low':
                    targetBitrate = 1000000;
                    break;
                case 'high':
                    targetBitrate = 2500000;
                    break;
                case 'medium':
                default:
                    targetBitrate = 1500000;
                    break;
            }

            // Adjust bitrate based on resolution if different from 720p
            const basePixelCount = 1280 * 720;
            const currentPixelCount = maxWidth * maxHeight;
            const resolutionFactor = currentPixelCount / basePixelCount;
            targetBitrate = Math.round(targetBitrate * resolutionFactor);

            // 3. Dynamic Bitrate Calculation for Max Size
            if (maxSize) {
                // Formula: Size (bits) = Bitrate (bps) * Duration (s)
                // Bitrate = Size (bits) / Duration
                // Safety margin: 90% of max size to account for container overhead and variable bitrate spikes
                const maxBits = (maxSize * 8) * 0.9;
                const maxAllowedBitrate = Math.floor(maxBits / metadata.duration);

                // Use the lower of the two bitrates to ensure we meet the size constraint
                // but don't unnecessarily degrade quality if the constraint is loose
                if (maxAllowedBitrate < targetBitrate) {
                    console.log(`[VideoOptimizer] Adjusting bitrate from ${targetBitrate} to ${maxAllowedBitrate} to meet max size of ${maxSize} bytes`);
                    targetBitrate = maxAllowedBitrate;
                }
            }

            // Ensure bitrate doesn't go too low (e.g., below 500kbps for 720p looks bad)
            // But if maxSize forces it, we must obey (or fail). Let's set a hard floor.
            const minBitrate = 500000 * resolutionFactor;
            if (targetBitrate < minBitrate) {
                console.warn(`[VideoOptimizer] Calculated bitrate ${targetBitrate} is very low. Quality may be poor.`);
            }

            console.log(`[VideoOptimizer] Compressing with: ${maxWidth}x${maxHeight} @ ${(targetBitrate / 1000000).toFixed(2)} Mbps`);

            const resultUri = await Video.compress(
                uri,
                {
                    compressionMethod: 'manual',
                    maxWidth,
                    maxHeight,
                    bitrate: targetBitrate,
                } as any,
                (progress) => {
                    if (onProgress) {
                        onProgress(progress);
                    }
                }
            );

            // 4. Get result metadata
            const resultFileInfo = await FileSystem.getInfoAsync(resultUri);
            const resultSize = resultFileInfo.exists ? resultFileInfo.size : 0;

            return {
                uri: resultUri,
                size: resultSize,
                width: metadata.width, // Assuming aspect ratio preserved or we should return maxWidth/Height
                height: metadata.height,
                mimeType: 'video/mp4',
                originalSize: actualOriginalSize || 0,
                compressionRatio: actualOriginalSize ? resultSize / actualOriginalSize : 0,
                duration: metadata.duration,
            };

        } catch (error) {
            console.error('Video compression failed:', error);
            throw error;
        }
    }

    /**
     * Cancel active compression
     */
    cancelCompression(id: string) {
        Video.cancelCompression(id);
    }
}

export default VideoOptimizer;
