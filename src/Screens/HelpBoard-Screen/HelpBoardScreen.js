import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    Image,
    Platform,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Switch,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Keyboard
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomModal from '../../Components/Customs/CustomModal';
import useModal from '../../Components/Customs/UseModalHook';

const { width, height } = Dimensions.get('window');

const HelpBoardScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [myPosts, setMyPosts] = useState([]);
    const [commentTexts, setCommentTexts] = useState({});
    const [submittingComments, setSubmittingComments] = useState({});
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('academic');
    const [contactInfo, setContactInfo] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [commentsModalVisible, setCommentsModalVisible] = useState(false);
    const [currentPostForComments, setCurrentPostForComments] = useState(null);

    const commentInputRefs = useRef({});
    const flatListRef = useRef(null);
    const commentsFlatListRef = useRef(null);

    const categories = [
        { id: 'academic', label: 'Academic Help', icon: 'school' },
        { id: 'material', label: 'Material Sharing', icon: 'book' },
        { id: 'study', label: 'Group Study', icon: 'group' },
        { id: 'personal', label: 'Personal Issues', icon: 'support' }
    ];

    const tabs = [
        { id: 'all', label: 'All Posts', icon: 'list' },
        ...categories
    ];

    const {
        modalConfig,
        showModal,
        hideModal,
        showError,
        showSuccess,
    } = useModal();

    const mockPosts = [
        {
            id: '1',
            title: 'Need help with Calculus assignment',
            message: 'Struggling with integration problems in Calculus II. Anyone available to help? Preferably tomorrow in the library.',
            category: 'academic',
            contactInfo: 'john.math@university.edu',
            isAnonymous: false,
            likes: 5,
            liked: false,
            comments: [
                {
                    id: '1',
                    user: {
                        name: 'Sarah Chen',
                        uniId: 'ST2023002',
                        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
                    },
                    message: `I can help! I'm free tomorrow at 3 PM in the library.`,
                    createdAt: '2024-08-25T14:30:00Z'
                },
                {
                    id: '2',
                    user: {
                        name: 'Mike Johnson',
                        uniId: 'ST2023003',
                        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
                    },
                    message: `Check out Khan Academy's integration section. Really helpful!`,
                    createdAt: '2024-08-25T15:45:00Z'
                }
            ],
            reportedBy: {
                name: 'John Doe',
                uniId: 'ST2023001',
                profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
            },
            createdAt: '2024-08-25T10:30:00Z'
        },
        {
            id: '2',
            title: 'Sharing programming books',
            message: 'I have several programming books (Python, Java, C++) that I no longer need. Free for anyone who needs them!',
            category: 'material',
            contactInfo: 'contact via DM',
            isAnonymous: false,
            likes: 12,
            liked: true,
            comments: [
                {
                    id: '3',
                    user: {
                        name: 'Alex Kim',
                        uniId: 'ST2023004',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
                    },
                    message: `I'd love the Python book! When can I pick it up?`,
                    createdAt: '2024-08-24T17:20:00Z'
                }
            ],
            reportedBy: {
                name: 'Mike Johnson',
                uniId: 'ST2023003',
                profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
            },
            createdAt: '2024-08-24T16:45:00Z'
        },
        {
            id: '3',
            title: 'Looking for study group',
            message: 'Anyone interested in forming a study group for Data Structures? We can meet twice a week.',
            category: 'study',
            contactInfo: '',
            isAnonymous: false,
            likes: 8,
            liked: false,
            comments: [
                {
                    id: '4',
                    user: {
                        name: 'Emma Wilson',
                        uniId: 'ST2023005',
                        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
                    },
                    message: 'Count me in! When are you thinking?',
                    createdAt: '2024-08-24T18:20:00Z'
                },
                {
                    id: '5',
                    user: {
                        name: 'David Lee',
                        uniId: 'ST2023006',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
                    },
                    message: `I'd like to join too! Maybe we can meet in the CS building?`,
                    createdAt: '2024-08-24T19:15:00Z'
                }
            ],
            reportedBy: {
                name: 'Lisa Wang',
                uniId: 'ST2023004',
                profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
            },
            createdAt: '2024-08-24T15:20:00Z'
        }
    ];

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setTimeout(() => {
                setPosts(mockPosts);
                setMyPosts(mockPosts.filter(post => post.reportedBy?.name === 'John Doe'));
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.log('Error fetching posts:', error);
            setLoading(false);
        }
    };

    const getFilteredPosts = () => {
        if (activeTab === 'all') return posts;
        return posts.filter(post => post.category === activeTab);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        resetForm();
    };

    const resetForm = () => {
        setTitle('');
        setMessage('');
        setCategory('academic');
        setContactInfo('');
        setIsAnonymous(false);
        setShowCategoryDropdown(false);
    };

    const handleLikePost = async (postId) => {
        try {
            const updatedPosts = posts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        liked: !post.liked,
                        likes: post.liked ? post.likes - 1 : post.likes + 1
                    };
                }
                return post;
            });
            setPosts(updatedPosts);
        } catch (error) {
            console.log('Error liking post:', error);
        }
    };

    const openCommentsModal = (post) => {
        setCurrentPostForComments(post);
        setCommentsModalVisible(true);
        setTimeout(() => {
            if (commentInputRefs.current[post.id]) {
                commentInputRefs.current[post.id].focus();
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
            setTimeout(() => {
                const newComment = {
                    id: Date.now().toString(),
                    user: {
                        name: 'Current User',
                        uniId: 'ST2023000',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
                    },
                    message: commentText,
                    createdAt: new Date().toISOString()
                };

                const updatedPosts = posts.map(post => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            comments: [...post.comments, newComment]
                        };
                    }
                    return post;
                });

                setPosts(updatedPosts);

                if (currentPostForComments && currentPostForComments.id === postId) {
                    setCurrentPostForComments({
                        ...currentPostForComments,
                        comments: [...currentPostForComments.comments, newComment]
                    });
                }

                setCommentTexts(prev => ({ ...prev, [postId]: '' }));
                setSubmittingComments(prev => ({ ...prev, [postId]: false }));

                setTimeout(() => {
                    if (commentsFlatListRef.current) {
                        commentsFlatListRef.current.scrollToEnd({ animated: true });
                    }
                }, 100);
            }, 1000);
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
            setTimeout(() => {
                const newPost = {
                    id: Date.now().toString(),
                    title,
                    message,
                    category,
                    contactInfo,
                    isAnonymous,
                    likes: 0,
                    liked: false,
                    comments: [],
                    reportedBy: isAnonymous ? null : {
                        name: 'Current User',
                        uniId: 'ST2023000',
                        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
                    },
                    createdAt: new Date().toISOString()
                };

                setPosts([newPost, ...posts]);
                setSubmitting(false);
                setModalVisible(false);
                resetForm();
                showSuccess('Success', 'Post created successfully!');
            }, 1500);
        } catch (error) {
            console.log('Error submitting post:', error);
            setSubmitting(false);
            showError('Error', 'Failed to create post. Please try again.');
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

    const getCategoryIcon = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.icon : 'help';
    };

    const getCategoryLabel = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.label : 'Help';
    };

    const renderTabItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.tab, activeTab === item.id && styles.activeTab]}
            onPress={() => setActiveTab(item.id)}
        >
            <Icon
                name={item.icon}
                size={18}
                color={activeTab === item.id ? '#1e3a8a' : '#64748b'}
            />
            <Text style={[styles.tabText, activeTab === item.id && styles.activeTabText]}>
                {item.label}
            </Text>
        </TouchableOpacity>
    );

    const renderTabBar = () => (
        <View style={styles.tabContainer}>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={tabs}
                renderItem={renderTabItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.tabScrollContainer}
            />
        </View>
    );

    const renderComment = ({ item }) => (
        <View style={styles.commentItem}>
            <Image source={{ uri: item.user.avatar }} style={styles.commentAvatar} />
            <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                    <Text style={styles.commentUserName}>{item.user.name}</Text>
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
                        <View style={styles.categoryBadge}>
                            <Icon name={getCategoryIcon(item.category)} size={14} color="#1e3a8a" />
                            <Text style={styles.categoryText}>{getCategoryLabel(item.category)}</Text>
                        </View>
                    </View>
                    <View style={styles.userInfoContainer}>
                        {item.reportedBy && !item.isAnonymous ? (
                            <View style={styles.userInfo}>
                                <Image source={{ uri: item.reportedBy.profileImage }} style={styles.avatar} />
                                <View style={styles.userDetails}>
                                    <Text style={styles.userName}>{item.reportedBy.name}</Text>
                                    <Text style={styles.userId}>{item.reportedBy.uniId}</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.userInfo}>
                                <View style={styles.anonymousAvatar}>
                                    <Icon name="visibility-off" size={20} color="#94a3b8" />
                                </View>
                                <View style={styles.userDetails}>
                                    <Text style={styles.userName}>Anonymous</Text>
                                    <Text style={styles.userId}>Hidden</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                <Text style={styles.cardDescription} numberOfLines={3}>
                    {item.message}
                </Text>

                {item.contactInfo && (
                    <View style={styles.contactInfo}>
                        <Icon name="contact-mail" size={16} color="#64748b" />
                        <Text style={styles.contactText}>{item.contactInfo}</Text>
                    </View>
                )}

                <View style={styles.cardFooter}>
                    <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
                    <View style={styles.postActions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleLikePost(item.id)}
                        >
                            <Icon
                                name={item.liked ? 'favorite' : 'favorite-border'}
                                size={20}
                                color={item.liked ? '#ef4444' : '#64748b'}
                            />
                            <Text style={[styles.actionText, item.liked && styles.likedText]}>
                                {item.likes}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => openCommentsModal(item)}
                        >
                            <Icon name="chat-bubble-outline" size={20} color="#64748b" />
                            <Text style={styles.actionText}>
                                {item.comments.length}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderCategoryDropdownItem = ({ item }) => (
        <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
                setCategory(item.id);
                setShowCategoryDropdown(false);
            }}
        >
            <Icon name={item.icon} size={20} color="#1e3a8a" />
            <Text style={styles.dropdownItemText}>{item.label}</Text>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="forum" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Posts Yet</Text>
            <Text style={styles.emptySubtitle}>
                Be the first to ask for help or offer support to others
            </Text>
        </View>
    );

    const renderCommentsModal = () => {
        if (!currentPostForComments) return null;

        const commentText = commentTexts[currentPostForComments.id] || '';
        const isSubmittingComment = submittingComments[currentPostForComments.id];

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
                            data={currentPostForComments.comments}
                            renderItem={renderComment}
                            keyExtractor={(item) => item.id}
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
                                    ref={ref => commentInputRefs.current[currentPostForComments.id] = ref}
                                    style={styles.commentInput}
                                    placeholder="Write a comment..."
                                    value={commentText}
                                    onChangeText={(text) => setCommentTexts(prev => ({ ...prev, [currentPostForComments.id]: text }))}
                                    multiline
                                    maxLength={300}
                                />
                                <TouchableOpacity
                                    style={[styles.commentSubmitButton, !commentText.trim() && styles.commentSubmitButtonDisabled]}
                                    onPress={() => handleCommentSubmit(currentPostForComments.id)}
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

            {renderTabBar()}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1e3a8a" />
                    <Text style={styles.loadingText}>Loading posts...</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={getFilteredPosts()}
                    renderItem={renderPostCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={renderEmptyState}
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
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create Help Post</Text>
                            <TouchableOpacity onPress={handleCloseModal}>
                                <Icon name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            style={styles.modalForm}
                            showsVerticalScrollIndicator={false}
                            data={[{ key: 'form' }]}
                            renderItem={() => (
                                <View>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Category</Text>
                                        <TouchableOpacity
                                            style={styles.dropdownButton}
                                            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                        >
                                            <Text style={styles.dropdownText}>
                                                {getCategoryLabel(category)}
                                            </Text>
                                            <Icon name="arrow-drop-down" size={24} color="#6b7280" />
                                        </TouchableOpacity>
                                        {showCategoryDropdown && (
                                            <View style={styles.dropdown}>
                                                <FlatList
                                                    data={categories}
                                                    renderItem={renderCategoryDropdownItem}
                                                    keyExtractor={(item) => item.id}
                                                />
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Title *</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="What do you need help with?"
                                            value={title}
                                            onChangeText={setTitle}
                                            maxLength={100}
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
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Contact Information</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="How should people contact you?"
                                            value={contactInfo}
                                            onChangeText={setContactInfo}
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
                                </View>
                            )}
                            keyExtractor={(item) => item.key}
                        />
                    </View>
                </KeyboardAvoidingView>
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
    tabContainer: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    tabScrollContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 12,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
    },
    activeTab: {
        backgroundColor: '#dbeafe',
    },
    tabText: {
        fontSize: 14,
        color: '#64748b',
        marginLeft: 6,
    },
    activeTabText: {
        color: '#1e3a8a',
        fontWeight: '600',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 80,
    },
    // Updated card styles to match ReportIssuesScreen
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
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    categoryText: {
        fontSize: 12,
        color: '#1e3a8a',
        marginLeft: 4,
        fontWeight: '500',
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
    userId: {
        fontSize: 12,
        color: '#64748b',
    },
    cardDescription: {
        fontSize: 16,
        color: '#334155',
        lineHeight: 24,
        marginBottom: 16,
    },
    contactInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#f8fafc',
        padding: 8,
        borderRadius: 8,
    },
    contactText: {
        fontSize: 14,
        color: '#64748b',
        marginLeft: 6,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748b',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#64748b',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    fabGradient: {
        width: '100%',
        height: '100%',
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
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    modalForm: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1e293b',
        backgroundColor: '#ffffff',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
    },
    dropdownText: {
        fontSize: 16,
        color: '#1e293b',
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        marginTop: 4,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#1e293b',
        marginLeft: 12,
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
        marginTop: 8,
        borderRadius: 8,
        overflow: 'hidden',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitGradient: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
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
        marginBottom: 4,
    },
    commentsPostMessage: {
        fontSize: 14,
        color: '#64748b',
    },
    commentsListContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 80,
    },
    commentsEmptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    commentsEmptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },
    commentsEmptySubtext: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    commentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        color: '#334155',
        lineHeight: 20,
    },
    commentInputContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    commentInputAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    commentInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#f1f5f9',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    commentInput: {
        flex: 1,
        fontSize: 14,
        color: '#334155',
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