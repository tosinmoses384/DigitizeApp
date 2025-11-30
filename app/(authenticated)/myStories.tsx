import React, { useCallback, useMemo, useState } from "react";
import {
    SafeAreaView,
    StyleSheet,
    View,
    FlatList,
    Text,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { router } from "expo-router";
import StackHeader from "../../components/StackHeader";
import { useAppSelector } from "../../redux/store";
import { useStories, StoryItemDataType } from "../../hooks/use-stories";
import MyStoryItem from "../../components/StoryComp/Stories/MyStoryItem";
import timelineServices from "../../services/features/timeline-service/timelineServices";
import { useI18n } from "../../hooks/use-i18n";
import { Colors } from "../../constants/Colors";
import AddStoryIcon from "../../assets/images/svg/add-story-icon.svg"; // Reusing the icon
import DeleteItemModal from "../../modals/DeleteItemModal";
import StatusViewModal from "../../modals/sataus/StatusViewModal";
import TagsModal from "../../modals/tagsModal/TagsModal";

const MyStories = () => {
    const { t } = useI18n();
    const { token, profile } = useAppSelector((state) => state?.userProfileSlice);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteStoryId, setDeleteStoryId] = useState<string | null>(null);
    const [viewingStory, setViewingStory] = useState<any>(null);
    const [showTagsForStoryId, setShowTagsForStoryId] = useState<string | null>(null);

    const {
        data: stories,
        isLoading,
        refetch,
        isRefetching,
    } = useStories({
        token: token || "",
        enabled: !!token,
    });

    // Filter for current user's stories
    const myStoriesData = useMemo(() => {
        if (!stories || !profile?.id) return null;
        return stories.find((s) => s.userId === profile.id);
    }, [stories, profile?.id]);

    const myStoriesList = useMemo(() => {
        return myStoriesData?.stories || [];
    }, [myStoriesData]);

    const handleAddStory = () => {
        router.push({
            pathname: "/(authenticated)/createStory",
            params: {
                refetchStories: "true",
            },
        });
    };

    const confirmDelete = (storyId: string) => {
        setDeleteStoryId(storyId);
    };

    const handleDeleteStory = async () => {
        if (!deleteStoryId || !token) return;

        try {
            setIsDeleting(true);
            const response = await timelineServices.deleteStory(token, deleteStoryId);

            if (response.status === 200 || response.responseCode === "00") {
                await refetch();
                setDeleteStoryId(null);
            } else {
                Alert.alert("Error", response.message || "Failed to delete story");
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to delete story");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleTag = (storyId: string) => {
        setShowTagsForStoryId(storyId);
    };

    const handleViewStory = (story: StoryItemDataType) => {
        // Construct the data structure expected by StatusViewModal
        if (myStoriesData) {
            // We need to pass the whole user story object but maybe start from the specific story?
            // StatusViewModal takes `userStories` which is `UserStorySlidesDataType`
            setViewingStory(myStoriesData);
        }
    };

    const renderItem = ({ item }: { item: StoryItemDataType }) => (
        <MyStoryItem
            story={item}
            onDelete={confirmDelete}
            onTag={handleTag}
            onPress={handleViewStory}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <StackHeader title="My Stories" onPress={() => router.back()} />

            <View style={styles.content}>
                <TouchableOpacity style={styles.addStoryButton} onPress={handleAddStory}>
                    <View style={styles.addIconContainer}>
                        {/* Using a simple plus text or icon if available */}
                        <Text style={styles.plusText}>+</Text>
                    </View>
                    <Text style={styles.addStoryText}>Add New Story</Text>
                </TouchableOpacity>

                {isLoading && !isRefetching ? (
                    <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={myStoriesList}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.storyId}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.light.primary} />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>You haven't posted any stories yet.</Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Delete Confirmation Modal */}
            {deleteStoryId && (
                <DeleteItemModal
                    onClose={() => setDeleteStoryId(null)}
                    handleDelete={handleDeleteStory}
                    loader={isDeleting}
                />
            )}

            {/* Story Viewer */}
            {viewingStory && (
                <StatusViewModal
                    isShow={true}
                    onClose={() => setViewingStory(null)}
                    userStories={viewingStory}
                    refetch={refetch}
                    profileId={profile?.id}
                    setCurrentUserStory={() => { }}
                />
            )}

            {/* Tags Modal */}
            {showTagsForStoryId && (
                <TagsModal
                    isShow={true}
                    onClose={() => setShowTagsForStoryId(null)}
                    contentId={showTagsForStoryId}
                    contentType="story"
                    userId={profile?.id}
                    userImageUrl={profile?.profileImage}
                    username={profile?.username}
                />
            )}
        </SafeAreaView>
    );
};

export default MyStories;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    addStoryButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F2F2F7",
    },
    addIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#FFEBED",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    plusText: {
        fontSize: 24,
        color: "#FF5C68",
        fontWeight: "400",
    },
    addStoryText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: "center",
    },
    emptyText: {
        color: "#8E8E93",
        fontSize: 14,
    },
});
