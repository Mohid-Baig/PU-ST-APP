import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Platform,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Linking,
    Share,
    Alert,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const IssueDetailsScreen = ({ route, navigation }) => {
    const { issueId } = route.params || {};
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [locationString, setLocationString] = useState('');

    const mockIssueDetails = {
        id: '1',
        title: 'Broken Water Cooler in CS Block',
        description: 'The water cooler on the 2nd floor of the Computer Science block has been malfunctioning for the past 3 days. Water is leaking from the bottom and the cooling system is not working properly. This is causing inconvenience to students and faculty who rely on this facility during classes. The floor around the cooler is constantly wet, creating a potential safety hazard.',
        category: 'Broken_resources',
        status: 'viewed',
        createdAt: '2024-08-20T10:30:00Z',
        updatedAt: '2024-08-21T14:20:00Z',
        location: JSON.stringify({
            type: "Point",
            coordinates: [73.0563, 31.4504]
        }),
        image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop',
        priority: 'high',
        assignedTo: 'Maintenance Department',
        adminRemarks: 'Parts have been ordered. Expected resolution within 2-3 days.',
        comments: [
            {
                id: '1',
                user: 'Admin Team',
                comment: 'Issue has been logged and assigned to maintenance team. Priority set to high due to safety concerns.',
                createdAt: '2024-08-20T11:00:00Z',
                type: 'admin'
            },
            {
                id: '2',
                user: 'Maintenance Team',
                comment: 'We have inspected the issue. Water valve needs replacement and cooling unit requires repair. Parts ordered from supplier.',
                createdAt: '2024-08-21T09:15:00Z',
                type: 'staff'
            },
            {
                id: '3',
                user: 'Maintenance Team',
                comment: 'Update: Parts arrived. Repair work will begin tomorrow morning.',
                createdAt: '2024-08-22T16:30:00Z',
                type: 'staff'
            }
        ]
    };

    useEffect(() => {
        fetchIssueDetails();
    }, [issueId]);

    const fetchIssueDetails = async () => {
        try {
            setTimeout(() => {
                setIssue(mockIssueDetails);
                if (mockIssueDetails.location) {
                    const locationData = JSON.parse(mockIssueDetails.location);
                    if (locationData.coordinates && locationData.coordinates.length === 2) {
                        setLocationString(`${locationData.coordinates[1].toFixed(6)}, ${locationData.coordinates[0].toFixed(6)}`);
                    }
                }
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.log('Error fetching issue details:', error);
            setLoading(false);
            Alert.alert('Error', 'Failed to load issue details');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'viewed': return '#3b82f6';
            case 'resolved': return '#10b981';
            case 'rejected': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pending Review';
            case 'viewed': return 'In Progress';
            case 'resolved': return 'Resolved';
            case 'rejected': return 'Rejected';
            default: return 'Unknown';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return 'schedule';
            case 'viewed': return 'visibility';
            case 'resolved': return 'check-circle';
            case 'rejected': return 'cancel';
            default: return 'help';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#dc2626';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getPriorityText = (priority) => {
        switch (priority) {
            case 'high': return 'High Priority';
            case 'medium': return 'Medium Priority';
            case 'low': return 'Low Priority';
            default: return 'Normal Priority';
        }
    };

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

    const handleShareIssue = async () => {
        try {
            await Share.share({
                message: `Issue: ${issue.title}\n\nDescription: ${issue.description}\n\nStatus: ${getStatusText(issue.status)}\n\nReported: ${formatDateTime(issue.createdAt)}`,
                title: 'Share Issue Details'
            });
        } catch (error) {
            console.log('Error sharing issue:', error);
        }
    };

    const handleContactSupport = () => {
        Alert.alert(
            'Contact Support',
            'How would you like to contact support?',
            [
                {
                    text: 'Email',
                    onPress: () => Linking.openURL(`mailto:mohidtahir12@gmail.com?subject=Issue: ${issue.title}&body=Issue ID: ${issue.id}%0A%0AHi, I need help with my reported issue.`)
                },
                {
                    text: 'Phone',
                    onPress: () => Linking.openURL('tel:+92000000000')
                },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const handleOpenLocation = () => {
        if (issue.location) {
            const locationData = JSON.parse(issue.location);
            const coords = locationData.coordinates;
            const url = Platform.select({
                ios: `maps:0,0?q=${coords[1]},${coords[0]}`,
                android: `geo:0,0?q=${coords[1]},${coords[0]}(Issue Location)`,
            });
            Linking.openURL(url);
        }
    };

    const handleImageView = () => {
        // You can implement full-screen image view here
        Alert.alert('Image', 'Full-screen image view will be implemented');
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1e3a8a" />
                    <Text style={styles.loadingText}>Loading issue details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!issue) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
                <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={64} color="#dc2626" />
                    <Text style={styles.errorText}>Issue not found</Text>
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
                <Text style={styles.headerTitle}>Issue #{issue.id}</Text>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleShareIssue}
                >
                    <Icon name="share" size={24} color="#1e3a8a" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Status Header */}
                <LinearGradient
                    colors={[getStatusColor(issue.status), getStatusColor(issue.status) + '80']}
                    style={styles.statusHeader}
                >
                    <View style={styles.statusContent}>
                        <Icon
                            name={getStatusIcon(issue.status)}
                            size={32}
                            color="#ffffff"
                        />
                        <View style={styles.statusTextContainer}>
                            <Text style={styles.statusTitle}>{getStatusText(issue.status)}</Text>
                            <Text style={styles.statusSubtitle}>Last updated {formatTimeAgo(issue.updatedAt)}</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Issue Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.priorityBadge}>
                            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(issue.priority) }]} />
                            <Text style={styles.priorityText}>{getPriorityText(issue.priority)}</Text>
                        </View>
                        <Text style={styles.categoryText}>{issue.category.replace('_', ' ')}</Text>
                    </View>

                    <Text style={styles.issueTitle}>{issue.title}</Text>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Icon name="schedule" size={16} color="#64748b" />
                            <Text style={styles.metaText}>Reported {formatDateTime(issue.createdAt)}</Text>
                        </View>
                        {issue.assignedTo && (
                            <View style={styles.metaItem}>
                                <Icon name="assignment-ind" size={16} color="#64748b" />
                                <Text style={styles.metaText}>{issue.assignedTo}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Description Card */}
                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Icon name="description" size={20} color="#1e3a8a" />
                        <Text style={styles.cardTitle}>Description</Text>
                    </View>
                    <Text style={styles.descriptionText}>{issue.description}</Text>
                </View>

                {/* Admin Remarks */}
                {issue.adminRemarks && (
                    <View style={styles.remarksCard}>
                        <View style={styles.cardTitleRow}>
                            <Icon name="admin-panel-settings" size={20} color="#f59e0b" />
                            <Text style={[styles.cardTitle, { color: '#f59e0b' }]}>Admin Remarks</Text>
                        </View>
                        <Text style={styles.remarksText}>{issue.adminRemarks}</Text>
                    </View>
                )}

                {/* Image */}
                {issue.image && (
                    <View style={styles.card}>
                        <View style={styles.cardTitleRow}>
                            <Icon name="photo" size={20} color="#1e3a8a" />
                            <Text style={styles.cardTitle}>Attached Photo</Text>
                        </View>
                        <TouchableOpacity onPress={handleImageView}>
                            <Image source={{ uri: issue.image }} style={styles.issueImage} />
                            <View style={styles.imageOverlay}>
                                <Icon name="zoom-in" size={24} color="#ffffff" />
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Location */}
                {locationString && (
                    <View style={styles.card}>
                        <View style={styles.cardTitleRow}>
                            <Icon name="location-on" size={20} color="#1e3a8a" />
                            <Text style={styles.cardTitle}>Location</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.locationButton}
                            onPress={handleOpenLocation}
                        >
                            <View style={styles.locationInfo}>
                                <Text style={styles.locationText}>{locationString}</Text>
                                <Text style={styles.locationSubtext}>Tap to open in maps</Text>
                            </View>
                            <Icon name="open-in-new" size={20} color="#1e3a8a" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Timeline/Comments */}
                {issue.comments && issue.comments.length > 0 && (
                    <View style={styles.card}>
                        <View style={styles.cardTitleRow}>
                            <Icon name="timeline" size={20} color="#1e3a8a" />
                            <Text style={styles.cardTitle}>Timeline ({issue.comments.length} updates)</Text>
                        </View>
                        <View style={styles.timeline}>
                            {issue.comments.map((comment, index) => (
                                <View key={comment.id} style={styles.timelineItem}>
                                    <View style={[
                                        styles.timelineMarker,
                                        { backgroundColor: comment.type === 'admin' ? '#10b981' : '#3b82f6' }
                                    ]}>
                                        <Icon
                                            name={comment.type === 'admin' ? 'admin-panel-settings' : 'build'}
                                            size={12}
                                            color="#ffffff"
                                        />
                                    </View>
                                    {index < issue.comments.length - 1 && <View style={styles.timelineLine} />}
                                    <View style={styles.timelineContent}>
                                        <View style={styles.timelineHeader}>
                                            <Text style={styles.timelineUser}>{comment.user}</Text>
                                            <Text style={styles.timelineTime}>{formatTimeAgo(comment.createdAt)}</Text>
                                        </View>
                                        <Text style={styles.timelineText}>{comment.comment}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
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
                        {/* <TouchableOpacity style={styles.secondaryButton}>
                            <Icon name="refresh" size={18} color="#64748b" />
                            <Text style={styles.secondaryButtonText}>Request Update</Text>
                        </TouchableOpacity> */}
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={handleShareIssue}
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
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    priorityText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    categoryText: {
        fontSize: 12,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
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
    metaText: {
        fontSize: 14,
        color: '#64748b',
        marginLeft: 8,
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
    issueImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    imageOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        padding: 8,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    locationInfo: {
        flex: 1,
    },
    locationText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
        marginBottom: 2,
    },
    locationSubtext: {
        fontSize: 12,
        color: '#64748b',
    },
    timeline: {
        marginTop: 8,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 16,
        position: 'relative',
    },
    timelineMarker: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    timelineLine: {
        position: 'absolute',
        left: 11.5,
        top: 24,
        bottom: -16,
        width: 1,
        backgroundColor: '#e2e8f0',
    },
    timelineContent: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    timelineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    timelineUser: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1e293b',
    },
    timelineTime: {
        fontSize: 12,
        color: '#64748b',
    },
    timelineText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
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

export default IssueDetailsScreen;