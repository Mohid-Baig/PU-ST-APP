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

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const confessionInputRef = useRef(null);

    // Mock data - anonymous confessions
    const mockConfessions = [
        {
            id: '1',
            message: "I saw someone cheating during the last exam in the main hall. It's not fair to those of us who studied honestly.",
            timestamp: '2 hours ago',
            likes: 12,
            comments: 3,
            isLiked: false
        },
        {
            id: '2',
            message: "The wifi in the library has been terrible this week. Can't even download research papers properly.",
            timestamp: '5 hours ago',
            likes: 8,
            comments: 2,
            isLiked: true
        },
        {
            id: '3',
            message: "I found a lost wallet near the cafeteria. Turned it in to security. Hope the owner finds it!",
            timestamp: '1 day ago',
            likes: 25,
            comments: 7,
            isLiked: false
        },
        {
            id: '4',
            message: "The food quality in the cafeteria has really improved this semester. Great job to the staff!",
            timestamp: '2 days ago',
            likes: 15,
            comments: 4,
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
                    comments: 0,
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

    const handleShare = async (confession) => {
        try {
            const shareContent = {
                message: `Anonymous Confession: "${confession.message}" - Shared from University App`,
                title: 'Anonymous Confession'
            };

            const result = await Share.share(shareContent);

            if (result.action === Share.sharedAction) {
                // Content was shared successfully
                console.log('Confession shared successfully');
            } else if (result.action === Share.dismissedAction) {
                // Share dialog was dismissed
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
        // In a real app, this would send the report to your backend
        Alert.alert(
            'Report Submitted',
            'Thank you for reporting. Our moderators will review this content.',
            [{ text: 'OK' }]
        );
        console.log(`Reported confession ${confessionId} for: ${reason}`);
    };

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

                <TouchableOpacity style={styles.actionButton}>
                    <Icon name="chat-bubble-outline" size={20} color="#64748b" />
                    <Text style={styles.actionText}>{item.comments}</Text>
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
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View style={styles.encouragementBox}>
                            <IconCommunity name="shield-account" size={32} color="#1e4d8c" />
                            <Text style={styles.encouragementText}>
                                Your identity is protected. Share safely and responsibly.
                            </Text>
                            <Text style={styles.encouragementSubtext}>
                                All confessions are completely anonymous. Admins cannot see who posted them.
                            </Text>
                        </View>
                    }
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
                            onPress={() => { }} // Prevent modal close when tapping inside
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
});

export default AnonymousConfessionsScreen;