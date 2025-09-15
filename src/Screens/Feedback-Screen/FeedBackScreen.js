import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    Platform,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    FlatList
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomModal from '../../Components/Customs/CustomModal';
import useModal from '../../Components/Customs/UseModalHook';

const FeedbackScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [feedbacks, setFeedbacks] = useState([]);
    const [myFeedbacks, setMyFeedbacks] = useState([]);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('suggestion');
    const [location, setLocation] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    const categories = [
        { id: 'suggestion', label: 'Suggestion', icon: 'lightbulb-outline', color: '#3b82f6' },
        { id: 'complaint', label: 'Complaint', icon: 'warning', color: '#ef4444' },
        { id: 'appreciation', label: 'Appreciation', icon: 'favorite', color: '#10b981' },
        { id: 'teacher_absentee', label: 'Teacher Absentee', icon: 'person-off', color: '#f59e0b' },
        { id: 'other', label: 'Other', icon: 'help-outline', color: '#6b7280' }
    ];

    const tabs = [
        { id: 'all', label: 'All Feedback', icon: 'list' },
        ...categories
    ];

    const {
        modalConfig,
        showModal,
        hideModal,
        showError,
        showSuccess,
    } = useModal();

    const mockFeedbacks = [
        {
            id: '1',
            title: 'Library opening hours',
            description: 'Could the library stay open later during exam season? Many students study better at night.',
            category: 'suggestion',
            location: 'Central Library',
            status: 'under_review',
            reportedBy: {
                name: 'Sarah Chen',
                uniId: 'ST2023001'
            },
            createdAt: '2024-08-25T14:30:00Z',
            adminResponse: null
        },
        {
            id: '2',
            title: 'Broken chairs in classroom',
            description: 'Several chairs in room 204 are broken and need repair. This is a safety hazard.',
            category: 'complaint',
            location: 'Room 204, CS Building',
            status: 'in_progress',
            reportedBy: {
                name: 'Mike Johnson',
                uniId: 'ST2023003'
            },
            createdAt: '2024-08-24T16:45:00Z',
            adminResponse: 'Maintenance team has been notified. Repair scheduled for tomorrow.'
        },
        {
            id: '3',
            title: 'Excellent chemistry professor',
            description: 'Dr. Smith\'s teaching methods are exceptional. She makes complex topics easy to understand.',
            category: 'appreciation',
            location: 'Chemistry Department',
            status: 'resolved',
            reportedBy: {
                name: 'Lisa Wang',
                uniId: 'ST2023004'
            },
            createdAt: '2024-08-24T15:20:00Z',
            adminResponse: 'Thank you for your feedback! We\'ll share this with Dr. Smith.'
        },
        {
            id: '4',
            title: 'Professor missing classes',
            description: 'Professor Johnson has missed 3 classes this month without any notification or substitute.',
            category: 'teacher_absentee',
            location: 'Mathematics Department',
            status: 'under_review',
            reportedBy: {
                name: 'Alex Kim',
                uniId: 'ST2023005'
            },
            createdAt: '2024-08-23T11:30:00Z',
            adminResponse: null
        },
        {
            id: '5',
            title: 'Campus wifi issues',
            description: 'The wifi in the student lounge has been very unstable for the past week.',
            category: 'other',
            location: 'Student Lounge',
            status: 'resolved',
            reportedBy: {
                name: 'Emma Wilson',
                uniId: 'ST2023006'
            },
            createdAt: '2024-08-22T09:15:00Z',
            adminResponse: 'IT department has resolved the wifi issues. Please report any further problems.'
        }
    ];

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            setTimeout(() => {
                setFeedbacks(mockFeedbacks);
                setMyFeedbacks(mockFeedbacks.filter(feedback => feedback.reportedBy.name === 'Sarah Chen'));
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.log('Error fetching feedbacks:', error);
            setLoading(false);
        }
    };

    const getFilteredFeedbacks = () => {
        if (activeTab === 'all') return feedbacks;
        return feedbacks.filter(feedback => feedback.category === activeTab);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        resetForm();
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setCategory('suggestion');
        setLocation('');
        setShowCategoryDropdown(false);
    };

    const submitFeedback = async () => {
        if (!title.trim() || !description.trim()) {
            showError('Error', 'Please fill in title and description');
            return;
        }

        setSubmitting(true);
        try {
            const feedbackData = {
                title,
                description,
                category,
                location
            };

            console.log('Submitting feedback:', feedbackData);

            setTimeout(() => {
                const newFeedback = {
                    id: Date.now().toString(),
                    title,
                    description,
                    category,
                    location,
                    status: 'under_review',
                    reportedBy: {
                        name: 'Current User',
                        uniId: 'ST2023000'
                    },
                    createdAt: new Date().toISOString(),
                    adminResponse: null
                };

                setFeedbacks([newFeedback, ...feedbacks]);
                setMyFeedbacks([newFeedback, ...myFeedbacks]);
                setSubmitting(false);
                setModalVisible(false);
                resetForm();
                showSuccess('Success', 'Feedback submitted successfully!');
            }, 1500);

        } catch (error) {
            console.log('Error submitting feedback:', error);
            setSubmitting(false);
            showError('Error', 'Failed to submit feedback. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'under_review': return '#f59e0b';
            case 'in_progress': return '#3b82f6';
            case 'resolved': return '#10b981';
            case 'rejected': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'under_review': return 'Under Review';
            case 'in_progress': return 'In Progress';
            case 'resolved': return 'Resolved';
            case 'rejected': return 'Rejected';
            default: return 'Unknown';
        }
    };

    const getCategoryInfo = (categoryId) => {
        return categories.find(cat => cat.id === categoryId) || categories[0];
    };

    const renderTabBar = () => (
        <View style={styles.tabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContainer}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <Icon
                            name={tab.icon}
                            size={18}
                            color={activeTab === tab.id ? '#1e3a8a' : '#64748b'}
                        />
                        <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderFeedbackCard = ({ item }) => {
        const categoryInfo = getCategoryInfo(item.category);

        return (
            <View style={styles.feedbackCard}>
                <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                        <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '20' }]}>
                            <Icon name={categoryInfo.icon} size={14} color={categoryInfo.color} />
                            <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
                                {categoryInfo.label}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                        </View>
                    </View>
                    <Text style={styles.feedbackTime}>{formatDate(item.createdAt)}</Text>
                </View>

                <Text style={styles.feedbackTitle}>{item.title}</Text>
                <Text style={styles.feedbackDescription}>{item.description}</Text>

                {item.location && (
                    <View style={styles.locationInfo}>
                        <Icon name="location-on" size={16} color="#64748b" />
                        <Text style={styles.locationText}>{item.location}</Text>
                    </View>
                )}

                <View style={styles.userInfo}>
                    <Icon name="person" size={16} color="#64748b" />
                    <Text style={styles.userText}>
                        By: {item.reportedBy.name} ({item.reportedBy.uniId})
                    </Text>
                </View>

                {item.adminResponse && (
                    <View style={styles.adminResponse}>
                        <View style={styles.responseHeader}>
                            <Icon name="admin-panel-settings" size={16} color="#10b981" />
                            <Text style={styles.responseTitle}>Admin Response</Text>
                        </View>
                        <Text style={styles.responseText}>{item.adminResponse}</Text>
                    </View>
                )}

                <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => navigation.navigate('ViewFeedback', { feedbackId: item.id })}
                >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Icon name="arrow-forward-ios" size={12} color="#1e3a8a" />
                </TouchableOpacity>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="feedback" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Feedback Yet</Text>
            <Text style={styles.emptySubtitle}>
                {activeTab === 'my'
                    ? "You haven't submitted any feedback yet"
                    : "No feedback in this category"}
            </Text>
        </View>
    );

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
                <Text style={styles.headerTitle}>Feedback</Text>
                <View style={styles.headerRight} />
            </View>

            {renderTabBar()}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1e3a8a" />
                    <Text style={styles.loadingText}>Loading feedback...</Text>
                </View>
            ) : (
                <FlatList
                    data={getFilteredFeedbacks()}
                    renderItem={renderFeedbackCard}
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

            {/* Create Feedback Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Submit Feedback</Text>
                            <TouchableOpacity onPress={handleCloseModal}>
                                <Icon name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                            {/* Category */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Category *</Text>
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                >
                                    <View style={styles.categorySelection}>
                                        <Icon
                                            name={getCategoryInfo(category).icon}
                                            size={20}
                                            color={getCategoryInfo(category).color}
                                        />
                                        <Text style={styles.dropdownText}>
                                            {getCategoryInfo(category).label}
                                        </Text>
                                    </View>
                                    <Icon name="arrow-drop-down" size={24} color="#6b7280" />
                                </TouchableOpacity>

                                {showCategoryDropdown && (
                                    <View style={styles.dropdown}>
                                        {categories.map((cat) => (
                                            <TouchableOpacity
                                                key={cat.id}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    setCategory(cat.id);
                                                    setShowCategoryDropdown(false);
                                                }}
                                            >
                                                <Icon name={cat.icon} size={20} color={cat.color} />
                                                <Text style={[styles.dropdownItemText, { color: cat.color }]}>
                                                    {cat.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Title */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Title *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Brief title for your feedback"
                                    value={title}
                                    onChangeText={setTitle}
                                    maxLength={100}
                                />
                            </View>

                            {/* Description */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Description *</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Please describe your feedback in detail..."
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline={true}
                                    numberOfLines={6}
                                    textAlignVertical="top"
                                    maxLength={1000}
                                />
                            </View>

                            {/* Location */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Location (Optional)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Where does this apply to? (e.g., Library, Room 204)"
                                    value={location}
                                    onChangeText={setLocation}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                                onPress={submitFeedback}
                                disabled={submitting}
                            >
                                <LinearGradient
                                    colors={submitting ? ['#9ca3af', '#6b7280'] : ['#1e3a8a', '#3b82f6']}
                                    style={styles.submitGradient}
                                >
                                    {submitting ? (
                                        <>
                                            <ActivityIndicator size="small" color="#ffffff" />
                                            <Text style={[styles.submitText, { marginLeft: 8 }]}>Submitting...</Text>
                                        </>
                                    ) : (
                                        <Text style={styles.submitText}>Submit Feedback</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

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
        backgroundColor: '#f8fafc',
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
        fontWeight: '500',
    },
    activeTabText: {
        color: '#1e3a8a',
        fontWeight: '600',
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
    feedbackCard: {
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
    headerLeft: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ffffff',
    },
    feedbackTime: {
        fontSize: 12,
        color: '#94a3b8',
    },
    feedbackTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    feedbackDescription: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 12,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    locationText: {
        fontSize: 13,
        color: '#64748b',
        marginLeft: 6,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    userText: {
        fontSize: 13,
        color: '#64748b',
        marginLeft: 6,
    },
    adminResponse: {
        backgroundColor: '#f0fdf4',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#10b981',
    },
    responseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    responseTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#065f46',
        marginLeft: 6,
    },
    responseText: {
        fontSize: 13,
        color: '#065f46',
        lineHeight: 18,
    },
    viewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        marginTop: 4,
    },
    viewDetailsText: {
        fontSize: 14,
        color: '#1e3a8a',
        fontWeight: '500',
        marginRight: 4,
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
        height: 150,
        textAlignVertical: 'top',
    },
    dropdownButton: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    categorySelection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dropdownText: {
        fontSize: 16,
        color: '#1e293b',
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        marginTop: 4,
        backgroundColor: '#ffffff',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        gap: 12,
    },
    dropdownItemText: {
        fontSize: 16,
        fontWeight: '500',
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
});

export default FeedbackScreen;