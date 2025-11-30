import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useVideoCompressor } from '../hooks/useVideoCompressor';
import { VideoOptimizationResult } from '../hooks/useOptimizedImagePicker/core/videoOptimizer';

export const VideoCompressionTest = () => {
    const { compress, isCompressing, progress, error, result } = useVideoCompressor();
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
    };

    const pickVideo = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: false,
                quality: 1,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedVideo(result.assets[0].uri);
                addLog(`Selected video: ${result.assets[0].uri}`);
                addLog(`Original size: ${(result.assets[0].fileSize || 0) / 1024 / 1024} MB`);
            }
        } catch (err) {
            addLog(`Error picking video: ${err}`);
        }
    };

    const handleCompress = async (quality: 'low' | 'medium' | 'high') => {
        if (!selectedVideo) return;

        try {
            addLog(`Starting compression (${quality})...`);
            const res = await compress(selectedVideo, { quality });
            addLog(`Compression complete!`);
            addLog(`New URI: ${res.uri}`);
            addLog(`New Size: ${(res.size / 1024 / 1024).toFixed(2)} MB`);
            addLog(`Compression Ratio: ${(res.compressionRatio * 100).toFixed(1)}%`);
        } catch (err) {
            addLog(`Compression failed: ${err}`);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Video Compression Test</Text>

            <View style={styles.section}>
                <Button title="Pick Video" onPress={pickVideo} />
                {selectedVideo && (
                    <Text style={styles.path}>Selected: {selectedVideo.split('/').pop()}</Text>
                )}
            </View>

            {selectedVideo && (
                <View style={styles.section}>
                    <Text style={styles.subtitle}>Compress</Text>
                    <View style={styles.row}>
                        <Button title="Low" onPress={() => handleCompress('low')} disabled={isCompressing} />
                        <Button title="Medium" onPress={() => handleCompress('medium')} disabled={isCompressing} />
                        <Button title="High" onPress={() => handleCompress('high')} disabled={isCompressing} />
                    </View>
                </View>
            )}

            {isCompressing && (
                <View style={styles.section}>
                    <Text>Compressing... {(progress * 100).toFixed(0)}%</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                    </View>
                </View>
            )}

            {error && (
                <Text style={styles.error}>Error: {error.message}</Text>
            )}

            <View style={styles.logs}>
                <Text style={styles.subtitle}>Logs</Text>
                {logs.map((log, i) => (
                    <Text key={i} style={styles.logText}>{log}</Text>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    section: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    path: {
        marginTop: 10,
        fontSize: 12,
        color: '#666',
    },
    progressBar: {
        height: 10,
        backgroundColor: '#ddd',
        borderRadius: 5,
        marginTop: 5,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#007AFF',
    },
    error: {
        color: 'red',
        marginBottom: 20,
    },
    logs: {
        marginTop: 20,
    },
    logText: {
        fontSize: 12,
        fontFamily: 'monospace',
        marginBottom: 5,
    },
});
