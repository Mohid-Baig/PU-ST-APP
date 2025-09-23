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
    Pressable,
    RefreshControl,
    Image
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const EventScreen = ({ navigation }) => {
    const [refreshing, setRefreshing] = useState(false);
    const [events, setEvents] = useState([
        {
            id: 1,
            title: "Annual Sports Day 2024",
            description: "Join us for the biggest sporting event of the year! Multiple sports competitions, prizes, and fun activities for everyone.",
            date: "2024-12-25",
            time: "09:00 AM",
            location: "Main Sports Ground",
            category: "Sports",
            priority: "high",
            image: null,
            createdAt: "2024-09-15T10:30:00Z"
        },
        {
            id: 2,
            title: "Tech Innovation Summit",
            description: "Explore the latest in technology and innovation. Guest speakers from top tech companies will share insights.",
            date: "2024-10-15",
            time: "02:00 PM",
            location: "Computer Science Auditorium",
            category: "Academic",
            priority: "medium",
            image: null,
            createdAt: "2024-09-14T14:20:00Z"
        },
        {
            id: 3,
            title: "Cultural Night - Desi Vibes",
            description: "Experience the rich cultural heritage through music, dance, and traditional performances.",
            date: "2024-11-08",
            time: "06:30 PM",
            location: "Main Auditorium",
            category: "Cultural",
            priority: "high",
            image: null,
            createdAt: "2024-09-13T16:45:00Z"
        },
        {
            id: 4,
            title: "Career Fair 2024",
            description: "Meet with top recruiters and explore career opportunities. Bring your resume and dress professionally.",
            date: "2024-10-30",
            time: "10:00 AM",
            location: "Engineering Block - Hall A",
            category: "Career",
            priority: "high",
            image: null,
            createdAt: "2024-09-12T09:15:00Z"
        },
        {
            id: 5,
            title: "Blood Donation Drive",
            description: "Be a hero, donate blood and save lives. Medical team will be available for check-ups.",
            date: "2024-09-28",
            time: "11:00 AM",
            location: "Medical Center",
            category: "Social",
            priority: "medium",
            image: null,
            createdAt: "2024-09-11T11:30:00Z"
        }
    ]);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-50)).current;
    const cardAnimations = useRef(events.map(() => new Animated.Value(0))).current;
    const floatingAnim = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(-1)).current;

    useEffect(() => {
        startAnimations();
        startContinuousAnimations();
    }, []);

    const startAnimations = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        cardAnimations.forEach((anim, index) => {
            Animated.spring(anim, {
                toValue: 1,
                delay: 200 + index * 100,
                tension: 60,
                friction: 8,
                useNativeDriver: true,
            }).start();
        });
    };

    const startContinuousAnimations = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatingAnim, {
                    toValue: 1,
                    duration: 4000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(floatingAnim, {
                    toValue: 0,
                    duration: 4000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    };

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    };

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

    const getPriorityIndicator = (priority) => {
        const colors = {
            'high': '#ef4444',
            'medium': '#f59e0b',
            'low': '#10b981'
        };
        return colors[priority] || colors.low;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    };

    const isEventUpcoming = (dateString) => {
        const eventDate = new Date(dateString);
        const today = new Date();
        return eventDate >= today;
    };

    const handleEventPress = (event) => {
        navigation.navigate('ViewEventDetail', { event });
    };

    const renderEventCard = (event, index) => {
        const animatedStyle = {
            opacity: cardAnimations[index],
            transform: [
                {
                    translateY: cardAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                    })
                },
                {
                    scale: cardAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                    })
                }
            ]
        };

        const categoryColors = getCategoryColors(event.category);
        const isUpcoming = isEventUpcoming(event.date);

        return (
            <Animated.View key={event.id} style={animatedStyle}>
                <Pressable
                    onPress={() => handleEventPress(event)}
                    style={({ pressed }) => [
                        styles.eventCard,
                        {
                            transform: [{ scale: pressed ? 0.98 : 1 }],
                        }
                    ]}
                >
                    <LinearGradient
                        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.90)']}
                        style={styles.eventCardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={[
                            styles.priorityIndicator,
                            { backgroundColor: getPriorityIndicator(event.priority) }
                        ]} />

                        <Animated.View
                            style={[
                                styles.shimmerOverlay,
                                {
                                    transform: [{
                                        translateX: shimmerAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-width, width],
                                        })
                                    }]
                                }
                            ]}
                        />

                        <View style={styles.eventCardContent}>
                            {/* Header */}
                            <View style={styles.eventHeader}>
                                <LinearGradient
                                    colors={categoryColors}
                                    style={styles.categoryIcon}
                                >
                                    <Icon
                                        name={getCategoryIcon(event.category)}
                                        size={24}
                                        color="#ffffff"
                                    />
                                </LinearGradient>

                                <View style={styles.eventTitleContainer}>
                                    <Text style={styles.eventTitle} numberOfLines={1}>
                                        {event.title}
                                    </Text>
                                    <View style={styles.categoryContainer}>
                                        <Text style={[
                                            styles.categoryText,
                                            { color: categoryColors[0] }
                                        ]}>
                                            {event.category}
                                        </Text>
                                        {isUpcoming && (
                                            <View style={styles.upcomingBadge}>
                                                <Text style={styles.upcomingText}>Upcoming</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <LinearGradient
                                    colors={categoryColors}
                                    style={styles.arrowContainer}
                                >
                                    <Icon name="arrow-forward-ios" size={14} color="#ffffff" />
                                </LinearGradient>
                            </View>

                            <Text style={styles.eventDescription} numberOfLines={2}>
                                {event.description}
                            </Text>

                            <View style={styles.eventDetails}>
                                <View style={styles.detailItem}>
                                    <Icon name="event" size={16} color="#6b7280" />
                                    <Text style={styles.detailText}>
                                        {formatDate(event.date)}
                                    </Text>
                                </View>

                                <View style={styles.detailItem}>
                                    <Icon name="access-time" size={16} color="#6b7280" />
                                    <Text style={styles.detailText}>
                                        {event.time}
                                    </Text>
                                </View>

                                <View style={styles.detailItem}>
                                    <Icon name="location-on" size={16} color="#6b7280" />
                                    <Text style={styles.detailText} numberOfLines={1}>
                                        {event.location}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </Pressable>
            </Animated.View>
        );
    };

    const floatingTransform = {
        transform: [{
            translateY: floatingAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -15],
            })
        }]
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="light-content"
            />

            <LinearGradient
                colors={['#1e3a8a', '#1e40af', '#3b82f6']}
                style={styles.backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <Animated.View style={[styles.floatingElement, styles.floatingElement1, floatingTransform]} />
            <Animated.View style={[styles.floatingElement, styles.floatingElement2,
            {
                transform: [{
                    translateY: floatingAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 20],
                    })
                }]
            }
            ]} />

            <Animated.View
                style={[
                    styles.header,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                <View style={styles.headerContainer}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Icon name="arrow-back" size={24} color="#ffffff" />
                    </TouchableOpacity>

                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Campus Events</Text>
                        <Text style={styles.headerSubtitle}>Stay updated with latest happenings</Text>
                    </View>

                    <LinearGradient
                        colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                        style={styles.notificationButton}
                    >
                        <Icon name="notifications" size={22} color="#ffffff" />
                        <View style={styles.notificationDot} />
                    </LinearGradient>
                </View>
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#ffffff"
                        colors={['#3b82f6']}
                    />
                }
            >
                <Animated.View
                    style={[
                        styles.statsSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.statsTitle}>
                        {events.filter(e => isEventUpcoming(e.date)).length} Upcoming Events
                    </Text>
                    <Text style={styles.statsSubtitle}>
                        Don't miss out on exciting campus activities!
                    </Text>
                </Animated.View>

                <View style={styles.eventsContainer}>
                    {events.map((event, index) => renderEventCard(event, index))}
                </View>

                {events.length === 0 && (
                    <View style={styles.emptyState}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                            style={styles.emptyStateContainer}
                        >
                            <Icon name="event-busy" size={64} color="rgba(255,255,255,0.4)" />
                            <Text style={styles.emptyStateTitle}>No Events Available</Text>
                            <Text style={styles.emptyStateSubtitle}>
                                Check back later for exciting campus events!
                            </Text>
                        </LinearGradient>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundGradient: {
        position: 'absolute',
        width: width * 1.5,
        height: height * 1.5,
        top: -height * 0.25,
        left: -width * 0.25,
    },
    floatingElement: {
        position: 'absolute',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 100,
    },
    floatingElement1: {
        width: 100,
        height: 100,
        top: height * 0.2,
        right: -30,
    },
    floatingElement2: {
        width: 140,
        height: 140,
        top: height * 0.7,
        left: -40,
    },
    header: {
        marginTop: Platform.OS === 'ios' ? 50 : 40,
        marginHorizontal: 20,
        marginBottom: 10,
    },
    headerContainer: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 22,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        flexDirection: 'row',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 15,
            },
        }),
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
        marginTop: 2,
    },
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 150,
    },
    statsSection: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        alignItems: 'center',
    },
    statsTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    statsSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        fontWeight: '500',
    },
    eventsContainer: {
        paddingHorizontal: 20,
        gap: 16,
    },
    eventCard: {
        borderRadius: 20,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    eventCardGradient: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        overflow: 'hidden',
        position: 'relative',
    },
    priorityIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 4,
        height: '100%',
        zIndex: 1,
    },
    shimmerOverlay: {
        position: 'absolute',
        top: 0,
        width: 80,
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        transform: [{ skewX: '-20deg' }],
    },
    eventCardContent: {
        padding: 20,
        paddingLeft: 24,
    },
    eventHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    categoryIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
            },
        }),
    },
    eventTitleContainer: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e3a8a',
        letterSpacing: -0.3,
        marginBottom: 4,
    },
    categoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    upcomingBadge: {
        backgroundColor: '#10b981',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    upcomingText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#ffffff',
        textTransform: 'uppercase',
    },
    arrowContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventDescription: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        fontWeight: '500',
        marginBottom: 16,
    },
    eventDetails: {
        gap: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
        flex: 1,
    },
    emptyState: {
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    emptyStateContainer: {
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default EventScreen;