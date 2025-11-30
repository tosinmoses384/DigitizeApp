import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { Colors } from "../../../constants/Colors";
import TagIcon from "../../../assets/images/svg/tag-icon.svg";
import DeleteIcon from "../../../assets/images/svg/delete.svg";
import { StoryItemDataType } from "../../../hooks/use-stories";
import { formatDistanceToNow } from "date-fns";

interface MyStoryItemProps {
    story: StoryItemDataType;
    onDelete: (storyId: string) => void;
    onTag: (storyId: string) => void;
    onPress: (story: StoryItemDataType) => void;
}

const MyStoryItem: React.FC<MyStoryItemProps> = ({
    story,
    onDelete,
    onTag,
    onPress,
}) => {
    const timeAgo = story.createdOn
        ? formatDistanceToNow(new Date(story.createdOn), { addSuffix: true })
        : "";

    // Placeholder for views count since it's not in the model yet
    const viewsCount = 0;

    return (
        <TouchableOpacity style={styles.container} onPress={() => onPress(story)}>
            <View style={styles.leftContent}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: story.storyMediaUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.viewsText}>{viewsCount} Views</Text>
                    <Text style={styles.timeText}>Posted {timeAgo}</Text>
                </View>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onTag(story.storyId)}
                >
                    <TagIcon width={20} height={20} color={Colors.light.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onDelete(story.storyId)}
                >
                    {/* Using a text fallback if icon is missing, but will try to import DeleteIcon */}
                    <DeleteIcon width={20} height={20} color="#8E8E93" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export default MyStoryItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F2F2F7",
    },
    leftContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    imageContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: "#FF5C68", // Active story color
        padding: 2,
        marginRight: 12,
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 25,
    },
    infoContainer: {
        justifyContent: "center",
    },
    viewsText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000",
        marginBottom: 4,
    },
    timeText: {
        fontSize: 12,
        color: "#8E8E93",
    },
    actionsContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    actionButton: {
        padding: 8,
        marginLeft: 8,
    },
});
