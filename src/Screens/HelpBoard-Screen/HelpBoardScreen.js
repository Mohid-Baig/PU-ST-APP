import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    Image,
    Platform,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Switch,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Keyboard,
    ScrollView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomModal from '../../Components/Customs/CustomModal';
import useModal from '../../Components/Customs/UseModalHook';
import { usePosthelpboardMutation, useGethelpboardQuery, useAddhelpboardpostlikeMutation } from '../../Redux/apiSlice';

const { width, height } = Dimensions.get('window');

const HelpBoardScreen = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [commentTexts, setCommentTexts] = useState({});
    const [submittingComments, setSubmittingComments] = useState({});
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [commentsModalVisible, setCommentsModalVisible] = useState(false);
    const [currentPostForComments, setCurrentPostForComments] = useState(null);

    const commentInputRefs = useRef({});
    const flatListRef = useRef(null);
    const commentsFlatListRef = useRef(null);

    const [posthelpboard] = usePosthelpboardMutation();
    const [addhelpboardpostlike] = useAddhelpboardpostlikeMutation();
    const {
        data: helpboardData,
        error: helpboardError,
        isLoading: helpboardLoading,
        refetch: refetchPosts,
    } = useGethelpboardQuery();

    const {
        modalConfig,
        showModal,
        hideModal,
        showError,
        showSuccess,
    } = useModal();

    const posts = helpboardData?.posts || [];
    const hasRealError = helpboardError && helpboardError.status !== 404;

    const handleCloseModal = () => {
        setModalVisible(false);
        resetForm();
    };

    useEffect(() => {
        if (helpboardError) {
            console.log(' HelpBoard Fetch Error Details:', {
                status: helpboardError.status,
                data: helpboardError.data,
                error: helpboardError.error,
                endpoint: '/helpboard'
            });
        }

        if (helpboardData) {
            console.log(' HelpBoard Data Received:', {
                count: helpboardData.posts?.length,
                firstPost: helpboardData.posts?.[0]
            });
        }
    }, [helpboardError, helpboardData]);

    const resetForm = () => {
        setTitle('');
        setMessage('');
        setIsAnonymous(false);
    };

    const handleLikePost = async (postId) => {
        try {
            const response = await addhelpboardpostlike(postId).unwrap();
            console.log('✅ Like API Response:', response);
        } catch (err) {
            console.log('❌ Error liking post:', err);
        }
    };

    const openCommentsModal = (post) => {
        setCurrentPostForComments(post);
        setCommentsModalVisible(true);
        setTimeout(() => {
            if (commentInputRefs.current[post._id]) {
                commentInputRefs.current[post._id].focus();
            }
        }, 300);
    };

    const closeCommentsModal = () => {
        setCommentsModalVisible(false);
        setCurrentPostForComments(null);
        Keyboard.dismiss();
    };

    const handleCommentSubmit = async (postId) => {
        const commentText = commentTexts[postId]?.trim();
        if (!commentText) return;

        setSubmittingComments(prev => ({ ...prev, [postId]: true }));

        try {
            console.log('Submit comment:', commentText, 'for post:', postId);

            setCommentTexts(prev => ({ ...prev, [postId]: '' }));
            setSubmittingComments(prev => ({ ...prev, [postId]: false }));

            showSuccess('Success', 'Comment posted successfully!');
        } catch (error) {
            console.log('Error submitting comment:', error);
            setSubmittingComments(prev => ({ ...prev, [postId]: false }));
            showError('Error', 'Failed to post comment');
        }
    };

    const submitPost = async () => {
        if (!title.trim() || !message.trim()) {
            showError('Error', 'Please fill in title and message');
            return;
        }

        setSubmitting(true);

        try {
            const postData = {
                title: title.trim(),
                message: message.trim(),
                isAnonymous: isAnonymous
            };

            const response = await posthelpboard(postData).unwrap();
            console.log('Post created successfully:', response);

            setSubmitting(false);
            setModalVisible(false);
            resetForm();

            refetchPosts();

            showSuccess('Success', 'Post created successfully!');
        } catch (error) {
            console.log('Error submitting post:', error);
            setSubmitting(false);

            let errorMessage = 'Failed to create post. Please try again.';

            if (error.status === 'FETCH_ERROR') {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (error.status === 401) {
                errorMessage = 'Your session has expired. Please login again.';
            } else if (error.status === 400) {
                errorMessage = error?.data?.message || 'Invalid data. Please check all fields.';
            } else if (error.status === 500) {
                errorMessage = error?.data?.message || 'Server error. Please try again later.';
            } else if (error?.data?.message) {
                errorMessage = error.data.message;
            }

            showError('Submission Failed', errorMessage);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const renderComment = ({ item }) => (
        <View style={styles.commentItem}>
            <Image
                source={{
                    uri: item.user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
                }}
                style={styles.commentAvatar}
            />
            <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                    <Text style={styles.commentUserName}>{item.user?.name || 'User'}</Text>
                    <Text style={styles.commentTime}>{formatDate(item.createdAt)}</Text>
                </View>
                <Text style={styles.commentText}>{item.message}</Text>
            </View>
        </View>
    );

    const renderPostCard = ({ item }) => {
        return (
            <View style={styles.issueCard}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleContainer}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                    </View>
                    <View style={styles.userInfoContainer}>
                        {item.postedBy && !item.isAnonymous ? (
                            <View style={styles.userInfo}>
                                <Image
                                    source={{
                                        uri: item.postedBy.profileImageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
                                    }}
                                    style={styles.avatar}
                                />
                                <View style={styles.userDetails}>
                                    <Text style={styles.userName}>{item.postedBy.fullName}</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.userInfo}>
                                <View style={styles.anonymousAvatar}>
                                    <Icon name="visibility-off" size={20} color="#94a3b8" />
                                </View>
                                <View style={styles.userDetails}>
                                    <Text style={styles.userName}>Anonymous</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.message}
                </Text>

                <View style={styles.cardFooter}>
                    <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
                    <View style={styles.postActions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleLikePost(item._id)}
                        >
                            <Icon
                                name={item.likedByMe ? 'favorite' : 'favorite-border'}
                                size={20}
                                color={item.likedByMe ? '#ef4444' : '#64748b'}
                            />
                            <Text style={[styles.actionText, item.likedByMe && styles.likedText]}>
                                {item.likeCount || 0}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => openCommentsModal(item)}
                        >
                            <Icon name="chat-bubble-outline" size={20} color="#64748b" />
                            <Text style={styles.actionText}>
                                {item.replies?.length || 0}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="forum" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Posts Yet</Text>
            <Text style={styles.emptySubtitle}>
                Be the first to ask for help or offer support to others
            </Text>
        </View>
    );

    const renderHeaderComponent = () => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Help Board</Text>
            <Text style={styles.sectionSubtitle}>Ask for help or support your peers</Text>
        </View>
    );

    const renderCommentsModal = () => {
        if (!currentPostForComments) return null;

        const commentText = commentTexts[currentPostForComments._id] || '';
        const isSubmittingComment = submittingComments[currentPostForComments._id];

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={commentsModalVisible}
                onRequestClose={closeCommentsModal}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.commentsModalOverlay}
                >
                    <View style={styles.commentsModalContent}>
                        <View style={styles.commentsModalHeader}>
                            <TouchableOpacity onPress={closeCommentsModal}>
                                <Icon name="arrow-back" size={24} color="#1e3a8a" />
                            </TouchableOpacity>
                            <Text style={styles.commentsModalTitle}>Comments</Text>
                            <View style={styles.commentsModalHeaderRight} />
                        </View>

                        <View style={styles.commentsPostPreview}>
                            <Text style={styles.commentsPostTitle}>{currentPostForComments.title}</Text>
                            <Text style={styles.commentsPostMessage} numberOfLines={2}>
                                {currentPostForComments.message}
                            </Text>
                        </View>

                        <FlatList
                            ref={commentsFlatListRef}
                            data={currentPostForComments.replies || []}
                            renderItem={renderComment}
                            keyExtractor={(item, index) => item._id || index.toString()}
                            contentContainerStyle={styles.commentsListContainer}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.commentsEmptyContainer}>
                                    <Icon name="chat-bubble-outline" size={48} color="#d1d5db" />
                                    <Text style={styles.commentsEmptyText}>No comments yet</Text>
                                    <Text style={styles.commentsEmptySubtext}>Be the first to comment</Text>
                                </View>
                            }
                        />

                        <View style={styles.commentInputContainer}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' }}
                                style={styles.commentInputAvatar}
                            />
                            <View style={styles.commentInputWrapper}>
                                <TextInput
                                    ref={ref => commentInputRefs.current[currentPostForComments._id] = ref}
                                    style={styles.commentInput}
                                    placeholder="Write a comment..."
                                    value={commentText}
                                    onChangeText={(text) => setCommentTexts(prev => ({ ...prev, [currentPostForComments._id]: text }))}
                                    multiline
                                    maxLength={300}
                                    placeholderTextColor="#9ca3af"
                                />
                                <TouchableOpacity
                                    style={[styles.commentSubmitButton, !commentText.trim() && styles.commentSubmitButtonDisabled]}
                                    onPress={() => handleCommentSubmit(currentPostForComments._id)}
                                    disabled={!commentText.trim() || isSubmittingComment}
                                >
                                    {isSubmittingComment ? (
                                        <ActivityIndicator size="small" color="#1e3a8a" />
                                    ) : (
                                        <Icon name="send" size={20} color={!commentText.trim() ? '#d1d5db' : '#1e3a8a'} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#1e3a8a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help Board</Text>
                <View style={styles.headerRight} />
            </View>

            {helpboardLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1e3a8a" />
                    <Text style={styles.loadingText}>Loading posts...</Text>
                </View>
            ) : hasRealError ? (
                <View style={styles.errorContainer}>
                    <Icon name="error" size={64} color="#ef4444" />
                    <Text style={styles.errorTitle}>Error Loading Posts</Text>
                    <Text style={styles.errorSubtitle}>
                        {helpboardError?.data?.message || 'Please check your connection and try again'}
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => refetchPosts()}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={posts}
                    renderItem={renderPostCard}
                    keyExtractor={(item) => item._id}
                    ListHeaderComponent={posts.length > 0 ? renderHeaderComponent : null}
                    ListEmptyComponent={
                        <View style={styles.emptyWrapper}>
                            {renderHeaderComponent()}
                            {renderEmptyState()}
                        </View>
                    }
                    contentContainerStyle={posts.length === 0 ? styles.emptyContentContainer : styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <LinearGradient
                    colors={['#1e3a8a', '#3b82f6']}
                    style={styles.fabGradient}
                >
                    <Icon name="add" size={28} color="#ffffff" />
                </LinearGradient>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create Help Post</Text>
                            <TouchableOpacity onPress={handleCloseModal}>
                                <Icon name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Title *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="What do you need help with?"
                                    value={title}
                                    onChangeText={setTitle}
                                    maxLength={100}
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Message *</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Describe what you need help with..."
                                    value={message}
                                    onChangeText={setMessage}
                                    multiline={true}
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    maxLength={500}
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <View style={styles.switchRow}>
                                    <Text style={styles.inputLabel}>Post Anonymously</Text>
                                    <Switch
                                        value={isAnonymous}
                                        onValueChange={setIsAnonymous}
                                        trackColor={{ false: '#f3f4f6', true: '#dbeafe' }}
                                        thumbColor={isAnonymous ? '#1e3a8a' : '#9ca3af'}
                                    />
                                </View>
                                <Text style={styles.switchDescription}>
                                    Your name and profile will be hidden
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                                onPress={submitPost}
                                disabled={submitting}
                            >
                                <LinearGradient
                                    colors={submitting ? ['#9ca3af', '#6b7280'] : ['#1e3a8a', '#3b82f6']}
                                    style={styles.submitGradient}
                                >
                                    {submitting ? (
                                        <>
                                            <ActivityIndicator size="small" color="#ffffff" />
                                            <Text style={[styles.submitText, { marginLeft: 8 }]}>Posting...</Text>
                                        </>
                                    ) : (
                                        <Text style={styles.submitText}>Create Post</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {renderCommentsModal()}

            <CustomModal
                {...modalConfig}
                onClose={hideModal}
                navigation={navigation}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e3a8a',
    },
    headerRight: {
        width: 40,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: '#ffffff',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#64748b',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748b',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ef4444',
        marginTop: 16,
        marginBottom: 8,
    },
    errorSubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#1e3a8a',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    emptyWrapper: {
        flex: 1,
    },
    emptyContentContainer: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingBottom: 100,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 100,
    },
    // UPDATED CARD DESIGN - Matching ReportIssuesScreen
    issueCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardTitleContainer: {
        flex: 1,
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    userInfoContainer: {
        alignItems: 'flex-end',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    anonymousAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    userDetails: {
        alignItems: 'flex-end',
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    cardDescription: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
    postActions: {
        flexDirection: 'row',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
    },
    actionText: {
        fontSize: 14,
        color: '#64748b',
        marginLeft: 4,
    },
    likedText: {
        color: '#ef4444',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 30,
        borderRadius: 28,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    modalForm: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1e293b',
        backgroundColor: '#ffffff',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    switchDescription: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    submitButton: {
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    submitText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    // Comments Modal Styles
    commentsModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    commentsModalContent: {
        flex: 1,
        backgroundColor: '#ffffff',
        marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    commentsModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    commentsModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    commentsModalHeaderRight: {
        width: 24,
    },
    commentsPostPreview: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    commentsPostTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    commentsPostMessage: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    commentsListContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    commentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 12,
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    commentUserName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    commentTime: {
        fontSize: 12,
        color: '#94a3b8',
    },
    commentText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    commentsEmptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    commentsEmptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#9ca3af',
        marginTop: 12,
    },
    commentsEmptySubtext: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 4,
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        backgroundColor: '#ffffff',
    },
    commentInputAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 12,
    },
    commentInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#f9fafb',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    commentInput: {
        flex: 1,
        fontSize: 14,
        color: '#1e293b',
        maxHeight: 100,
        paddingVertical: 4,
    },
    commentSubmitButton: {
        marginLeft: 8,
        padding: 4,
    },
    commentSubmitButtonDisabled: {
        opacity: 0.5,
    },
});

export default HelpBoardScreen;