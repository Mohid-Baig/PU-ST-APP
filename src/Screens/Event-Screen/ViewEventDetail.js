import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Animated,
    SafeAreaView,
    Platform,
    Easing,
    Alert,
    Share,
    Linking,
    ActivityIndicator,
    Image
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const EventDetailScreen = ({ navigation, route }) => {
    const { event } = route.params || {};
    const [loading, setLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [attendeeCount, setAttendeeCount] = useState(Math.floor(Math.random() * 200) + 50);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, []);

    const getCategoryIcon = (category) => {
        const icons = {
            'Sports': 'sports-basketball',
            'Academic': 'school',
            'Cultural': 'theater-comedy',
            'Career': 'work',
            'Social': 'volunteer-activism',
            'default': 'event'
        };
        return icons[category] || icons.default;
    };

    const getCategoryColors = (category) => {
        const colors = {
            'Sports': ['#f97316', '#fb923c'],
            'Academic': ['#3b82f6', '#60a5fa'],
            'Cultural': ['#8b5cf6', '#a78bfa'],
            'Career': ['#10b981', '#34d399'],
            'Social': ['#ef4444', '#f87171'],
            'default': ['#6b7280', '#9ca3af']
        };
        return colors[category] || colors.default;
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'high': '#dc2626',
            'medium': '#f59e0b',
            'low': '#10b981'
        };
        return colors[priority] || colors.low;
    };

    const getPriorityText = (priority) => {
        switch (priority) {
            case 'high': return 'High Priority';
            case 'medium': return 'Medium Priority';
            case 'low': return 'Low Priority';
            default: return 'Normal Priority';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
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

    const getDaysUntilEvent = (dateString) => {
        const eventDate = new Date(dateString);
        const today = new Date();
        const diffTime = eventDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getEventStatus = (dateString) => {
        const daysUntil = getDaysUntilEvent(dateString);
        if (daysUntil < 0) return { status: 'completed', text: 'Event Completed', color: '#64748b' };
        if (daysUntil === 0) return { status: 'today', text: 'Today', color: '#dc2626' };
        if (daysUntil <= 3) return { status: 'upcoming', text: `${daysUntil} days left`, color: '#f59e0b' };
        return { status: 'scheduled', text: `${daysUntil} days away`, color: '#10b981' };
    };

    const handleRegister = () => {
        if (isRegistered) {
            Alert.alert(
                "Unregister",
                "Are you sure you want to unregister from this event?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Unregister",
                        style: "destructive",
                        onPress: () => {
                            setIsRegistered(false);
                            setAttendeeCount(prev => prev - 1);
                        }
                    }
                ]
            );
        } else {
            Alert.alert(
                "Registration Successful",
                "You have been registered for this event! You will receive a confirmation email shortly.",
                [{
                    text: "OK",
                    onPress: () => {
                        setIsRegistered(true);
                        setAttendeeCount(prev => prev + 1);
                    }
                }]
            );
        }
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this event: ${event.title}\n\n${event.description}\n\nDate: ${formatDate(event.date)}\nTime: ${event.time}\nLocation: ${event.location}`,
                title: event.title,
            });
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleDirections = () => {
        const query = encodeURIComponent(event.location);
        const url = Platform.OS === 'ios'
            ? `maps://app?q=${query}`
            : `geo:0,0?q=${query}`;

        Linking.openURL(url);
    };

    const handleContactOrganizer = () => {
        Alert.alert(
            'Contact Organizer',
            'How would you like to contact the event organizer?',
            [
                {
                    text: 'Email',
                    onPress: () => Linking.openURL(`mailto:events@university.edu?subject=Inquiry about ${event.title}&body=Hi, I have a question about the upcoming event.`)
                },
                {
                    text: 'Phone',
                    onPress: () => Linking.openURL('tel:+92000000000')
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
                    <Text style={styles.loadingText}>Loading event details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!event) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
                <View style={styles.errorContainer}>
                    <Icon name="event-busy" size={64} color="#dc2626" />
                    <Text style={styles.errorText}>Event not found</Text>
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

    const categoryColors = getCategoryColors(event.category);
    const eventStatus = getEventStatus(event.date);
    const isUpcoming = getDaysUntilEvent(event.date) >= 0;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#1e3a8a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Event Details</Text>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleShare}
                >
                    <Icon name="share" size={24} color="#1e3a8a" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <LinearGradient
                    colors={[eventStatus.color, eventStatus.color + '80']}
                    style={styles.statusHeader}
                >
                    <View style={styles.statusContent}>
                        <Icon
                            name={eventStatus.status === 'completed' ? 'event-available' : 'schedule'}
                            size={32}
                            color="#ffffff"
                        />
                        <View style={styles.statusTextContainer}>
                            <Text style={styles.statusTitle}>{eventStatus.text}</Text>
                            <Text style={styles.statusSubtitle}>
                                {eventStatus.status === 'completed' ? 'Thank you for participating' : 'Mark your calendar'}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.priorityBadge}>
                            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(event.priority) }]} />
                            <Text style={styles.priorityText}>{getPriorityText(event.priority)}</Text>
                        </View>
                        <Text style={styles.categoryText}>{event.category}</Text>
                    </View>

                    <Text style={styles.eventTitle}>{event.title}</Text>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Icon name="schedule" size={16} color="#64748b" />
                            <Text style={styles.metaText}>Created {formatDateTime(event.createdAt)}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Icon name="people" size={16} color="#64748b" />
                            <Text style={styles.metaText}>{attendeeCount} registered</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Icon name="description" size={20} color="#1e3a8a" />
                        <Text style={styles.cardTitle}>Description</Text>
                    </View>
                    <Text style={styles.descriptionText}>{event.description}</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Icon name="info" size={20} color="#1e3a8a" />
                        <Text style={styles.cardTitle}>Event Details</Text>
                    </View>

                    <View style={styles.detailsList}>
                        <View style={styles.detailItem}>
                            <View style={[styles.detailIcon, { backgroundColor: categoryColors[0] }]}>
                                <Icon name="event" size={18} color="#ffffff" />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Date</Text>
                                <Text style={styles.detailValue}>{formatDate(event.date)}</Text>
                            </View>
                        </View>

                        <View style={styles.detailItem}>
                            <View style={[styles.detailIcon, { backgroundColor: categoryColors[0] }]}>
                                <Icon name="access-time" size={18} color="#ffffff" />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Time</Text>
                                <Text style={styles.detailValue}>{event.time}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.detailItem}
                            onPress={handleDirections}
                        >
                            <View style={[styles.detailIcon, { backgroundColor: categoryColors[0] }]}>
                                <Icon name="location-on" size={18} color="#ffffff" />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Location</Text>
                                <Text style={styles.detailValue}>{event.location}</Text>
                                <Text style={styles.locationSubtext}>Tap to open in maps</Text>
                            </View>
                            <Icon name="open-in-new" size={20} color="#1e3a8a" />
                        </TouchableOpacity>

                        <View style={styles.detailItem}>
                            <View style={[styles.detailIcon, { backgroundColor: categoryColors[0] }]}>
                                <Icon name={getCategoryIcon(event.category)} size={18} color="#ffffff" />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Category</Text>
                                <Text style={styles.detailValue}>{event.category}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Icon name="info-outline" size={20} color="#1e3a8a" />
                        <Text style={styles.cardTitle}>Additional Information</Text>
                    </View>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Icon name="people" size={20} color={categoryColors[0]} />
                            <Text style={styles.infoText}>Open to all students</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Icon name="attach-money" size={20} color={categoryColors[0]} />
                            <Text style={styles.infoText}>Free entry</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Icon name="camera-alt" size={20} color={categoryColors[0]} />
                            <Text style={styles.infoText}>Photography allowed</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Icon name="local-parking" size={20} color={categoryColors[0]} />
                            <Text style={styles.infoText}>Parking available</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Icon name="accessible" size={20} color={categoryColors[0]} />
                            <Text style={styles.infoText}>Wheelchair accessible</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Icon name="wifi" size={20} color={categoryColors[0]} />
                            <Text style={styles.infoText}>Free WiFi available</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.requirementsCard}>
                    <View style={styles.cardTitleRow}>
                        <Icon name="rule" size={20} color="#f59e0b" />
                        <Text style={[styles.cardTitle, { color: '#f59e0b' }]}>Requirements & Guidelines</Text>
                    </View>
                    <Text style={styles.requirementsText}>
                        • Please bring your student ID card for verification{'\n'}
                        • Dress code: Smart casual (formal attire recommended for career events){'\n'}
                        • Registration is mandatory for accurate headcount{'\n'}
                        • Food and beverages will be provided{'\n'}
                        • Please arrive 15 minutes before the scheduled time
                    </Text>
                </View>

                <View style={styles.actionSection}>
                    {isUpcoming && (
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleRegister}
                        >
                            <LinearGradient
                                colors={isRegistered ? ['#ef4444', '#dc2626'] : categoryColors}
                                style={styles.buttonGradient}
                            >
                                <Icon
                                    name={isRegistered ? "check-circle" : "event-seat"}
                                    size={20}
                                    color="#ffffff"
                                />
                                <Text style={styles.primaryButtonText}>
                                    {isRegistered ? 'Registered' : 'Register Now'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    <View style={styles.secondaryButtons}>
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={handleBookmark}
                        >
                            <Icon
                                name={isBookmarked ? "bookmark" : "bookmark-border"}
                                size={18}
                                color="#64748b"
                            />
                            <Text style={styles.secondaryButtonText}>
                                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={handleContactOrganizer}
                        >
                            <Icon name="contact-support" size={18} color="#64748b" />
                            <Text style={styles.secondaryButtonText}>Contact</Text>
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
    eventTitle: {
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
    requirementsCard: {
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
    requirementsText: {
        fontSize: 15,
        color: '#92400e',
        lineHeight: 22,
    },
    detailsList: {
        gap: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    detailIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e3a8a',
    },
    locationSubtext: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 6,
        minWidth: '45%',
    },
    infoText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#64748b',
        flex: 1,
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

export default EventDetailScreen;