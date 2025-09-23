import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Share,
    Alert,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const ViewFeedbackScreen = ({ route, navigation }) => {
    const { feedback } = route.params || {};
    const [loading, setLoading] = useState(true);

    // Mock data to simulate loading
    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 800);
    }, []);

    // Get category information
    const getCategoryInfo = (categoryId) => {
        const categories = [
            { id: 'suggestion', label: 'Suggestion', icon: 'lightbulb-outline', color: '#3b82f6' },
            { id: 'complaint', label: 'Complaint', icon: 'warning', color: '#ef4444' },
            { id: 'appreciation', label: 'Appreciation', icon: 'favorite', color: '#10b981' },
            { id: 'teacher_absentee', label: 'Teacher Absentee', icon: 'person-off', color: '#f59e0b' },
            { id: 'other', label: 'Other', icon: 'help-outline', color: '#6b7280' }
        ];
        return categories.find(cat => cat.id === categoryId) || categories[0];
    };

    // Status functions
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

    const getStatusIcon = (status) => {
        switch (status) {
            case 'under_review': return 'schedule';
            case 'in_progress': return 'visibility';
            case 'resolved': return 'check-circle';
            case 'rejected': return 'cancel';
            default: return 'help';
        }
    };

    // Date formatting functions
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return formatDateTime(dateString);
    };

    // Share feedback
    const handleShareFeedback = async () => {
        try {
            await Share.share({
                message: `Feedback: ${feedback.title}\n\nDescription: ${feedback.description}\n\nStatus: ${getStatusText(feedback.status)}\n\nReported: ${formatDateTime(feedback.createdAt)}`,
                title: 'Share Feedback Details'
            });
        } catch (error) {
            console.log('Error sharing feedback:', error);
        }
    };

    // Contact support
    const handleContactSupport = () => {
        Alert.alert(
            'Contact Support',
            'How would you like to contact support?',
            [
                {
                    text: 'Email',
                    onPress: () => Linking.openURL(`mailto:support@example.com?subject=Feedback: ${feedback.title}&body=Feedback ID: ${feedback.id}%0A%0AHi, I need help with my submitted feedback.`)
                },
                {
                    text: 'Phone',
                    onPress: () => Linking.openURL('tel:+1234567890')
                },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1e3a8a" />
                    <Text style={styles.loadingText}>Loading feedback details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!feedback) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
                <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={64} color="#dc2626" />
                    <Text style={styles.errorText}>Feedback not found</Text>
                    <TouchableOpacity
                        style={styles.errorButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.errorButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const categoryInfo = getCategoryInfo(feedback.category);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#1e3a8a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Feedback #{feedback.id}</Text>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleShareFeedback}
                >
                    <Icon name="share" size={24} color="#1e3a8a" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Status Header */}
                <LinearGradient
                    colors={[getStatusColor(feedback.status), getStatusColor(feedback.status) + '80']}
                    style={styles.statusHeader}
                >
                    <View style={styles.statusContent}>
                        <Icon
                            name={getStatusIcon(feedback.status)}
                            size={32}
                            color="#ffffff"
                        />
                        <View style={styles.statusTextContainer}>
                            <Text style={styles.statusTitle}>{getStatusText(feedback.status)}</Text>
                            <Text style={styles.statusSubtitle}>Last updated {formatTimeAgo(feedback.createdAt)}</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Feedback Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.categoryBadge}>
                            <Icon name={categoryInfo.icon} size={16} color={categoryInfo.color} />
                            <Text style={[styles.categoryText, { color: categoryInfo.color }]}>{categoryInfo.label}</Text>
                        </View>
                        <Text style={styles.metaText}>ID: {feedback.id}</Text>
                    </View>
                    <Text style={styles.issueTitle}>{feedback.title}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Icon name="person" size={16} color="#64748b" />
                            <Text style={styles.metaText}>{feedback.reportedBy.name}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Icon name="schedule" size={16} color="#64748b" />
                            <Text style={styles.metaText}>{formatDateTime(feedback.createdAt)}</Text>
                        </View>
                    </View>
                </View>

                {/* Description Card */}
                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Icon name="description" size={20} color="#1e3a8a" />
                        <Text style={styles.cardTitle}>Description</Text>
                    </View>
                    <Text style={styles.descriptionText}>{feedback.description}</Text>
                </View>

                {/* Location */}
                {feedback.location && (
                    <View style={styles.card}>
                        <View style={styles.cardTitleRow}>
                            <Icon name="location-on" size={20} color="#1e3a8a" />
                            <Text style={styles.cardTitle}>Location</Text>
                        </View>
                        <View style={styles.locationInfo}>
                            <Text style={styles.locationText}>{feedback.location}</Text>
                        </View>
                    </View>
                )}

                {/* Admin Response */}
                {feedback.adminResponse ? (
                    <View style={styles.remarksCard}>
                        <View style={styles.cardTitleRow}>
                            <Icon name="admin-panel-settings" size={20} color="#f59e0b" />
                            <Text style={[styles.cardTitle, { color: '#f59e0b' }]}>Admin Response</Text>
                        </View>
                        <Text style={styles.remarksText}>{feedback.adminResponse}</Text>
                    </View>
                ) : (
                    <View style={styles.noResponseCard}>
                        <View style={styles.cardTitleRow}>
                            <Icon name="hourglass-empty" size={20} color="#64748b" />
                            <Text style={[styles.cardTitle, { color: '#64748b' }]}>Admin Response</Text>
                        </View>
                        <Text style={styles.noResponseText}>No response yet. Our team is reviewing your feedback.</Text>
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionSection}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleContactSupport}
                    >
                        <LinearGradient
                            colors={['#1e3a8a', '#3b82f6']}
                            style={styles.buttonGradient}
                        >
                            <Icon name="support-agent" size={20} color="#ffffff" />
                            <Text style={styles.primaryButtonText}>Contact Support</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <View style={styles.secondaryButtons}>
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={handleShareFeedback}
                        >
                            <Icon name="share" size={18} color="#64748b" />
                            <Text style={styles.secondaryButtonText}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Using the exact same styles as IssueDetailsScreen
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
        borderBottomColor: '#e2e8f0',
        marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    headerButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
        padding: 40,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
        marginBottom: 24,
        textAlign: 'center',
    },
    errorButton: {
        backgroundColor: '#1e3a8a',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    errorButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    statusHeader: {
        margin: 16,
        marginBottom: 8,
        borderRadius: 16,
        padding: 20,
    },
    statusContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusTextContainer: {
        marginLeft: 16,
        flex: 1,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 2,
    },
    statusSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    infoCard: {
        backgroundColor: '#ffffff',
        margin: 16,
        marginTop: 8,
        padding: 20,
        borderRadius: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    metaText: {
        fontSize: 12,
        color: '#64748b',
    },
    issueTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
        lineHeight: 26,
    },
    metaRow: {
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    card: {
        backgroundColor: '#ffffff',
        margin: 16,
        marginTop: 8,
        padding: 20,
        borderRadius: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    remarksCard: {
        backgroundColor: '#fffbeb',
        margin: 16,
        marginTop: 8,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fed7aa',
    },
    noResponseCard: {
        backgroundColor: '#f8fafc',
        margin: 16,
        marginTop: 8,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginLeft: 8,
    },
    descriptionText: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 22,
    },
    remarksText: {
        fontSize: 15,
        color: '#92400e',
        lineHeight: 22,
        fontStyle: 'italic',
    },
    noResponseText: {
        fontSize: 15,
        color: '#64748b',
        lineHeight: 22,
    },
    locationInfo: {
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    locationText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
    },
    actionSection: {
        padding: 16,
        paddingBottom: 32,
    },
    primaryButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
    },
    buttonGradient: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginLeft: 8,
    },
    secondaryButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    secondaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
        marginLeft: 6,
    },
});

export default ViewFeedbackScreen;