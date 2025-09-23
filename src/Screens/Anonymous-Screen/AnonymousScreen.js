import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    FlatList,
    Dimensions,
    Animated,
    Easing,
    TextInput,
    KeyboardAvoidingView,
    Alert,
    Modal,
    Share
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
const { width, height } = Dimensions.get('window');
const AnonymousConfessionsScreen = ({ navigation }) => {
    const [confessions, setConfessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [showConfessionModal, setShowConfessionModal] = useState(false);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [selectedConfession, setSelectedConfession] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const confessionInputRef = useRef(null);
    const commentInputRef = useRef(null);
    // Mock data - anonymous confessions with comments
    const mockConfessions = [
        {
            id: '1',
            message: "I saw someone cheating during the last exam in the main hall. It's not fair to those of us who studied honestly.",
            timestamp: '2 hours ago',
            likes: 12,
            comments: [
                {
                    id: 'c1',
                    message: "This is really concerning. Maybe report it to the administration?",
                    timestamp: '1 hour ago',
                    likes: 3,
                    isLiked: false
                },
                {
                    id: 'c2',
                    message: "I've seen this too. Academic integrity is important for everyone.",
                    timestamp: '45 minutes ago',
                    likes: 5,
                    isLiked: true
                },
                {
                    id: 'c3',
                    message: "Maybe approach the professor privately about this issue.",
                    timestamp: '30 minutes ago',
                    likes: 2,
                    isLiked: false
                }
            ],
            isLiked: false
        },
        {
            id: '2',
            message: "The wifi in the library has been terrible this week. Can't even download research papers properly.",
            timestamp: '5 hours ago',
            likes: 8,
            comments: [
                {
                    id: 'c4',
                    message: "Same here! It's affecting my productivity during finals week.",
                    timestamp: '3 hours ago',
                    likes: 4,
                    isLiked: false
                },
                {
                    id: 'c5',
                    message: "Try using the ethernet cables in the study rooms if available.",
                    timestamp: '2 hours ago',
                    likes: 6,
                    isLiked: true
                }
            ],
            isLiked: true
        },
        {
            id: '3',
            message: "I found a lost wallet near the cafeteria. Turned it in to security. Hope the owner finds it!",
            timestamp: '1 day ago',
            likes: 25,
            comments: [
                {
                    id: 'c6',
                    message: "You're a good person! Thank you for being honest.",
                    timestamp: '20 hours ago',
                    likes: 8,
                    isLiked: false
                },
                {
                    id: 'c7',
                    message: "Faith in humanity restored! 🙏",
                    timestamp: '18 hours ago',
                    likes: 12,
                    isLiked: true
                },
                {
                    id: 'c8',
                    message: "This made my day. More people should be like you.",
                    timestamp: '15 hours ago',
                    likes: 7,
                    isLiked: false
                },
                {
                    id: 'c9',
                    message: "Security usually posts found items on the notice board.",
                    timestamp: '12 hours ago',
                    likes: 3,
                    isLiked: false
                },
                {
                    id: 'c10',
                    message: "I hope whoever lost it sees this and checks with security!",
                    timestamp: '10 hours ago',
                    likes: 5,
                    isLiked: false
                },
                {
                    id: 'c11',
                    message: "You could also post on the university Facebook groups.",
                    timestamp: '8 hours ago',
                    likes: 2,
                    isLiked: false
                },
                {
                    id: 'c12',
                    message: "Really appreciate people like you in our community.",
                    timestamp: '6 hours ago',
                    likes: 9,
                    isLiked: true
                }
            ],
            isLiked: false
        },
        {
            id: '4',
            message: "The food quality in the cafeteria has really improved this semester. Great job to the staff!",
            timestamp: '2 days ago',
            likes: 15,
            comments: [
                {
                    id: 'c13',
                    message: "Yes! The new chef is amazing. Love the variety now.",
                    timestamp: '1 day ago',
                    likes: 6,
                    isLiked: false
                },
                {
                    id: 'c14',
                    message: "The vegetarian options are so much better too!",
                    timestamp: '1 day ago',
                    likes: 4,
                    isLiked: true
                },
                {
                    id: 'c15',
                    message: "Still think the prices are a bit high though.",
                    timestamp: '18 hours ago',
                    likes: 2,
                    isLiked: false
                },
                {
                    id: 'c16',
                    message: "The hygiene standards have improved a lot too.",
                    timestamp: '12 hours ago',
                    likes: 7,
                    isLiked: false
                }
            ],
            isLiked: false
        }
    ];
    useEffect(() => {
        fetchConfessions();
        startAnimations();
    }, []);
    const startAnimations = () => {
        // Floating animation for header icon
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
            ])
        ).start();
        // Fade in animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    };
    const fetchConfessions = async () => {
        try {
            // Simulate API call
            setTimeout(() => {
                setConfessions(mockConfessions);
                setLoading(false);
            }, 1200);
        } catch (error) {
            console.log('Error fetching confessions:', error);
            setLoading(false);
        }
    };
    const submitConfession = async () => {
        if (!message.trim()) {
            Alert.alert('Empty Confession', 'Please write something to confess');
            return;
        }
        if (message.length < 10) {
            Alert.alert('Too Short', 'Please provide more details (at least 10 characters)');
            return;
        }
        setSubmitting(true);
        try {
            // Simulate API call
            setTimeout(() => {
                const newConfession = {
                    id: Date.now().toString(),
                    message: message.trim(),
                    timestamp: 'Just now',
                    likes: 0,
                    comments: [],
                    isLiked: false
                };
                setConfessions([newConfession, ...confessions]);
                setSubmitting(false);
                setMessage('');
                setShowConfessionModal(false);
                Alert.alert('Confessed!', 'Your anonymous confession has been posted');
            }, 1500);
        } catch (error) {
            console.log('Error submitting confession:', error);
            setSubmitting(false);
            Alert.alert('Error', 'Failed to post confession. Please try again.');
        }
    };
    const submitComment = async () => {
        if (!commentText.trim()) {
            Alert.alert('Empty Comment', 'Please write something to comment');
            return;
        }
        if (commentText.length < 3) {
            Alert.alert('Too Short', 'Please provide more details (at least 3 characters)');
            return;
        }
        setSubmittingComment(true);
        try {
            // Simulate API call
            setTimeout(() => {
                const newComment = {
                    id: `c${Date.now()}`,
                    message: commentText.trim(),
                    timestamp: 'Just now',
                    likes: 0,
                    isLiked: false
                };
                const updatedConfessions = confessions.map(confession => {
                    if (confession.id === selectedConfession.id) {
                        return {
                            ...confession,
                            comments: [newComment, ...confession.comments]
                        };
                    }
                    return confession;
                });
                setConfessions(updatedConfessions);
                setSelectedConfession({
                    ...selectedConfession,
                    comments: [newComment, ...selectedConfession.comments]
                });

                setSubmittingComment(false);
                setCommentText('');
                Alert.alert('Comment Posted!', 'Your anonymous comment has been posted');
            }, 1000);
        } catch (error) {
            console.log('Error submitting comment:', error);
            setSubmittingComment(false);
            Alert.alert('Error', 'Failed to post comment. Please try again.');
        }
    };
    const handleLike = (confessionId) => {
        const updatedConfessions = confessions.map(confession => {
            if (confession.id === confessionId) {
                return {
                    ...confession,
                    isLiked: !confession.isLiked,
                    likes: confession.isLiked ? confession.likes - 1 : confession.likes + 1
                };
            }
            return confession;
        });
        setConfessions(updatedConfessions);
    };
    const handleCommentLike = (commentId, confessionId) => {
        const updatedConfessions = confessions.map(confession => {
            if (confession.id === confessionId) {
                const updatedComments = confession.comments.map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            isLiked: !comment.isLiked,
                            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
                        };
                    }
                    return comment;
                });
                return { ...confession, comments: updatedComments };
            }
            return confession;
        });
        setConfessions(updatedConfessions);
        // Update selected confession if comments modal is open
        if (selectedConfession && selectedConfession.id === confessionId) {
            const updatedSelected = updatedConfessions.find(c => c.id === confessionId);
            setSelectedConfession(updatedSelected);
        }
    };
    const handleComments = (confession) => {
        setSelectedConfession(confession);
        setShowCommentsModal(true);
    };
    const handleShare = async (confession) => {
        try {
            const shareContent = {
                message: `Anonymous Confession: "${confession.message}" - Shared from University App`,
                title: 'Anonymous Confession'
            };
            const result = await Share.share(shareContent);
            if (result.action === Share.sharedAction) {
                console.log('Confession shared successfully');
            } else if (result.action === Share.dismissedAction) {
                console.log('Share dialog dismissed');
            }
        } catch (error) {
            console.error('Error sharing confession:', error);
            Alert.alert('Error', 'Unable to share confession at the moment');
        }
    };
    const handleReport = (confessionId) => {
        Alert.alert(
            'Report Confession',
            'Why are you reporting this confession?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Inappropriate Content',
                    onPress: () => submitReport(confessionId, 'inappropriate')
                },
                {
                    text: 'Spam',
                    onPress: () => submitReport(confessionId, 'spam')
                },
                {
                    text: 'Harassment',
                    onPress: () => submitReport(confessionId, 'harassment')
                },
                {
                    text: 'Other',
                    onPress: () => submitReport(confessionId, 'other')
                }
            ]
        );
    };
    const submitReport = (confessionId, reason) => {
        Alert.alert(
            'Report Submitted',
            'Thank you for reporting. Our moderators will review this content.',
            [{ text: 'OK' }]
        );
        console.log(`Reported confession ${confessionId} for: ${reason}`);
    };
    const renderCommentItem = ({ item }) => (
        <View style={styles.commentItem}>
            <View style={styles.commentHeader}>
                <View style={styles.commentUser}>
                    <IconCommunity name="incognito" size={16} color="#3b82f6" />
                    <Text style={styles.commentUserText}>Anonymous</Text>
                </View>
                <Text style={styles.commentTimestamp}>{item.timestamp}</Text>
            </View>

            <Text style={styles.commentMessage}>{item.message}</Text>

            <View style={styles.commentActions}>
                <TouchableOpacity
                    style={styles.commentActionButton}
                    onPress={() => handleCommentLike(item.id, selectedConfession.id)}
                >
                    <Icon
                        name={item.isLiked ? 'favorite' : 'favorite-border'}
                        size={16}
                        color={item.isLiked ? '#dc2626' : '#64748b'}
                    />
                    <Text style={[styles.commentActionText, item.isLiked && styles.commentLikedText]}>
                        {item.likes}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
    const renderConfessionItem = ({ item, index }) => (
        <Animated.View
            style={[
                styles.confessionCard,
                {
                    opacity: fadeAnim,
                    transform: [
                        {
                            translateY: slideAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 10 + (index * 2)]
                            })
                        }
                    ]
                }
            ]}
        >
            <View style={styles.cardHeader}>
                <View style={styles.anonymousIdentity}>
                    <IconCommunity name="incognito" size={20} color="#1e4d8c" />
                    <Text style={styles.anonymousText}>Anonymous Student</Text>
                </View>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
            <Text style={styles.confessionMessage}>"{item.message}"</Text>
            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleLike(item.id)}
                >
                    <Icon
                        name={item.isLiked ? 'favorite' : 'favorite-border'}
                        size={20}
                        color={item.isLiked ? '#dc2626' : '#64748b'}
                    />
                    <Text style={[styles.actionText, item.isLiked && styles.likedText]}>
                        {item.likes}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleComments(item)}
                >
                    <Icon name="chat-bubble-outline" size={20} color="#64748b" />
                    <Text style={styles.actionText}>{item.comments.length}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleShare(item)}
                >
                    <Icon name="share" size={20} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleReport(item.id)}
                >
                    <Icon name="flag" size={20} color="#64748b" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <IconCommunity name="incognito" size={64} color="#3b82f6" />
            <Text style={styles.emptyTitle}>No Confessions Yet</Text>
            <Text style={styles.emptySubtitle}>
                Be the first to share something anonymously
            </Text>
        </View>
    );
    const renderHeader = () => (
        <View style={styles.encouragementBox}>
            <IconCommunity name="shield-account" size={32} color="#1e4d8c" />
            <Text style={styles.encouragementText}>
                Your identity is protected. Share safely and responsibly.
            </Text>
            <Text style={styles.encouragementSubtext}>
                All confessions are completely anonymous. Admins cannot see who posted them.
            </Text>
        </View>
    );
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#0a192f" barStyle="light-content" />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <IconCommunity name="incognito" size={32} color="#ffffff" />
                </Animated.View>
                <Text style={styles.headerTitle}>Anonymous Confessions</Text>
                <TouchableOpacity
                    style={styles.infoButton}
                    onPress={() => Alert.alert(
                        'Privacy Protected',
                        'Your identity is completely hidden. Admins receive reports but cannot see who submitted them. Please use this responsibly.'
                    )}
                >
                    <Icon name="info-outline" size={24} color="#ffffff" />
                </TouchableOpacity>
            </View>
            {/* Warning Banner */}
            <View style={styles.warningBanner}>
                <Icon name="warning" size={18} color="#92400e" />
                <Text style={styles.warningText}>
                    Please be respectful. Do not use abusive language. Emergency issues should be reported directly to authorities.
                </Text>
            </View>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1e4d8c" />
                    <Text style={styles.loadingText}>Loading confessions...</Text>
                </View>
            ) : (
                <FlatList
                    data={confessions}
                    renderItem={renderConfessionItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={renderEmptyState}
                    ListHeaderComponent={renderHeader}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                    initialNumToRender={5}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                />
            )}
            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowConfessionModal(true)}
            >
                <View style={styles.fabContent}>
                    <IconCommunity name="feather" size={28} color="#ffffff" />
                </View>
            </TouchableOpacity>
            {/* Confession Modal */}
            <Modal
                visible={showConfessionModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowConfessionModal(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowConfessionModal(false)}
                    >
                        <TouchableOpacity
                            style={styles.modalContent}
                            activeOpacity={1}
                            onPress={() => { }}
                        >
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Anonymous Confession</Text>
                                <TouchableOpacity onPress={() => setShowConfessionModal(false)}>
                                    <Icon name="close" size={24} color="#64748b" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.inputLabel}>Share your thoughts anonymously</Text>
                            <TextInput
                                ref={confessionInputRef}
                                style={styles.confessionInput}
                                placeholder="Write your confession here... (Remember: no abusive language)"
                                placeholderTextColor="#64748b"
                                value={message}
                                onChangeText={setMessage}
                                multiline={true}
                                numberOfLines={6}
                                textAlignVertical="top"
                                maxLength={500}
                                editable={!submitting}
                                autoFocus={true}
                            />
                            <Text style={styles.charCount}>{message.length}/500 characters</Text>
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setShowConfessionModal(false);
                                        setMessage('');
                                    }}
                                    disabled={submitting}
                                >
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                                    onPress={submitConfession}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <ActivityIndicator size="small" color="#ffffff" />
                                    ) : (
                                        <View style={styles.submitContent}>
                                            <IconCommunity name="send" size={20} color="#ffffff" />
                                            <Text style={styles.submitText}>Post Anonymously</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>
            {/* Comments Modal */}
            <Modal
                visible={showCommentsModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCommentsModal(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.commentsModalContent}>
                        <View style={styles.commentsModalHeader}>
                            <Text style={styles.commentsModalTitle}>Comments</Text>
                            <TouchableOpacity onPress={() => setShowCommentsModal(false)}>
                                <Icon name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        {/* Original confession */}
                        {selectedConfession && (
                            <View style={styles.originalConfession}>
                                <View style={styles.originalConfessionHeader}>
                                    <View style={styles.anonymousIdentity}>
                                        <IconCommunity name="incognito" size={18} color="#1e4d8c" />
                                        <Text style={styles.anonymousText}>Anonymous Student</Text>
                                    </View>
                                    <Text style={styles.timestamp}>{selectedConfession.timestamp}</Text>
                                </View>
                                <Text style={styles.originalConfessionMessage}>"{selectedConfession.message}"</Text>

                                <View style={styles.originalConfessionStats}>
                                    <Text style={styles.statsText}>{selectedConfession.likes} likes</Text>
                                    <Text style={styles.statsText}>{selectedConfession.comments.length} comments</Text>
                                </View>
                            </View>
                        )}
                        {/* Comments List */}
                        {selectedConfession && (
                            <FlatList
                                data={selectedConfession.comments}
                                renderItem={renderCommentItem}
                                keyExtractor={(item) => item.id}
                                style={styles.commentsList}
                                contentContainerStyle={styles.commentsListContent}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    <View style={styles.noCommentsContainer}>
                                        <IconCommunity name="comment-outline" size={48} color="#64748b" />
                                        <Text style={styles.noCommentsText}>No comments yet</Text>
                                        <Text style={styles.noCommentsSubtext}>Be the first to comment!</Text>
                                    </View>
                                }
                                removeClippedSubviews={true}
                                initialNumToRender={10}
                                maxToRenderPerBatch={10}
                                windowSize={10}
                            />
                        )}
                        {/* Comment Input */}
                        <View style={styles.commentInputContainer}>
                            <TextInput
                                ref={commentInputRef}
                                style={styles.commentInput}
                                placeholder="Write a comment..."
                                placeholderTextColor="#64748b"
                                value={commentText}
                                onChangeText={setCommentText}
                                multiline={true}
                                maxLength={300}
                                editable={!submittingComment}
                            />
                            <TouchableOpacity
                                style={[styles.commentSubmitButton, submittingComment && styles.commentSubmitButtonDisabled]}
                                onPress={submitComment}
                                disabled={submittingComment}
                            >
                                {submittingComment ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <IconCommunity name="send" size={20} color="#ffffff" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a192f',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#0a192f',
        borderBottomWidth: 1,
        borderBottomColor: '#1e4d8c',
        marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#ffffff',
        textAlign: 'center',
        flex: 1,
        marginHorizontal: 12,
    },
    infoButton: {
        padding: 8,
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef3c7',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#fcd34d',
    },
    warningText: {
        fontSize: 12,
        color: '#92400e',
        marginLeft: 8,
        flex: 1,
        fontWeight: '500',
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
    listContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    encouragementBox: {
        backgroundColor: '#132f5c',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1e4d8c',
    },
    encouragementText: {
        fontSize: 16,
        color: '#e1f5fe',
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 12,
    },
    encouragementSubtext: {
        fontSize: 14,
        color: '#93c5fd',
        textAlign: 'center',
        marginTop: 8,
    },
    confessionCard: {
        backgroundColor: '#132f5c',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1e4d8c',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    anonymousIdentity: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    anonymousText: {
        fontSize: 14,
        color: '#3b82f6',
        fontWeight: '600',
        marginLeft: 6,
    },
    timestamp: {
        fontSize: 12,
        color: '#94a3b8',
    },
    confessionMessage: {
        fontSize: 16,
        color: '#e1f5fe',
        lineHeight: 22,
        marginBottom: 16,
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#1e4d8c',
        paddingTop: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    actionText: {
        fontSize: 14,
        color: '#64748b',
        marginLeft: 4,
    },
    likedText: {
        color: '#dc2626',
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#e1f5fe',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 20,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 30,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    fabContent: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1e4d8c',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#132f5c',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#1e4d8c',
        borderBottomWidth: 0,
        maxHeight: height * 0.9,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#e1f5fe',
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3b82f6',
        marginBottom: 12,
    },
    confessionInput: {
        borderWidth: 2,
        borderColor: '#1e4d8c',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#e1f5fe',
        backgroundColor: '#0a192f',
        minHeight: 150,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'right',
        marginTop: 4,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelButton: {
        padding: 16,
        borderRadius: 12,
    },
    cancelText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
        flex: 1,
        marginLeft: 12,
        backgroundColor: '#1e4d8c',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitContent: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    submitText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    // Comments Modal Styles
    commentsModalContent: {
        flex: 1,
        backgroundColor: '#132f5c',
        marginTop: 50,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderWidth: 1,
        borderColor: '#1e4d8c',
        borderBottomWidth: 0,
    },
    commentsModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1e4d8c',
    },
    commentsModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#e1f5fe',
    },
    originalConfession: {
        backgroundColor: '#0a192f',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1e4d8c',
    },
    originalConfessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    originalConfessionMessage: {
        fontSize: 15,
        color: '#e1f5fe',
        lineHeight: 20,
        marginBottom: 12,
    },
    originalConfessionStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#1e4d8c',
    },
    statsText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    commentsList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    commentsListContent: {
        paddingBottom: 20,
    },
    commentItem: {
        backgroundColor: '#0a192f',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1e4d8c',
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    commentUser: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentUserText: {
        fontSize: 12,
        color: '#3b82f6',
        fontWeight: '600',
        marginLeft: 4,
    },
    commentTimestamp: {
        fontSize: 10,
        color: '#64748b',
    },
    commentMessage: {
        fontSize: 14,
        color: '#e1f5fe',
        lineHeight: 18,
        marginBottom: 8,
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#1e4d8c',
    },
    commentActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    commentActionText: {
        fontSize: 12,
        color: '#64748b',
        marginLeft: 4,
    },
    commentLikedText: {
        color: '#dc2626',
        fontWeight: '600',
    },
    noCommentsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    noCommentsText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e1f5fe',
        marginTop: 16,
        marginBottom: 8,
    },
    noCommentsSubtext: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#1e4d8c',
        backgroundColor: '#0a192f',
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#1e4d8c',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#e1f5fe',
        backgroundColor: '#132f5c',
        maxHeight: 100,
        marginRight: 12,
    },
    commentSubmitButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1e4d8c',
        justifyContent: 'center',
        alignItems: 'center',
    },
    commentSubmitButtonDisabled: {
        opacity: 0.7,
    },
});
export default AnonymousConfessionsScreen;