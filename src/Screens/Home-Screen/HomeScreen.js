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
    Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from "react-redux";
import messaging from '@react-native-firebase/messaging';
import { requestUserPermission, getFcmToken } from '../../Components/notifications/firebaseMessaging';
import { usePostfcmtokenMutation, usePrefetch } from '../../Redux/apiSlice';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

const HomeScreen = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const cardAnimations = useRef([...Array(6)].map(() => new Animated.Value(0))).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    const userName = useSelector((state) => state.auth.user?.name) || "Apki Pehchan";
    const shortName = userName.split(" ").slice(0, 2).join(" ");
    const role = useSelector((state) => state.auth.user?.role) || 'Student';

    const prefetchPolls = usePrefetch('getpolls');
    const prefetchLostFound = usePrefetch('getlostfound');
    const prefetchIssues = usePrefetch('issuesReportedbyme');
    const prefetchHelpboard = usePrefetch('gethelpboard');
    const prefetchFeedback = usePrefetch('getfeedback');
    const prefetchEvents = usePrefetch('getevents');
    const prefetchAnonymous = usePrefetch('getanonymous');
    const [sendfcmToken] = usePostfcmtokenMutation();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();

        cardAnimations.forEach((anim, index) => {
            Animated.timing(anim, {
                toValue: 1,
                delay: 200 + index * 80,
                duration: 500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        });

        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 3000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        prefetchPolls(undefined, { force: true });
        prefetchLostFound(undefined, { force: true });
        prefetchIssues(undefined, { force: true });
        prefetchHelpboard(undefined, { force: true });
        prefetchFeedback(undefined, { force: true });
        prefetchEvents(undefined, { force: true });
        prefetchAnonymous(undefined, { force: true });
    }, []);

    useEffect(() => {
        const initNotifications = async () => {
            try {
                const permissionGranted = await requestUserPermission();
                if (permissionGranted) {
                    const fcmToken = await getFcmToken();
                    if (fcmToken) {
                        try {
                            await sendfcmToken(fcmToken);
                        } catch (err) {
                            console.error("Failed to register FCM token:", err);
                        }
                    }
                }
            } catch (error) {
                console.error("Error initializing notifications:", error);
            }
        };

        initNotifications();

        const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
            if (remoteMessage.notification) {
                Alert.alert(
                    remoteMessage.notification.title || 'Notification',
                    remoteMessage.notification.body || 'You have a new message'
                );
            }
        });

        const unsubscribeOnTokenRefresh = messaging().onTokenRefresh(async newToken => {
            try {
                await sendfcmToken(newToken);
            } catch (err) {
                console.error("Failed to refresh FCM token:", err);
            }
        });

        return () => {
            unsubscribeOnMessage();
            unsubscribeOnTokenRefresh();
        };
    }, [sendfcmToken]);

    const menuItems = [
        {
            id: 1,
            title: 'Fix This!',
            subtitle: 'Report issues instantly',
            icon: 'build-circle',
            gradient: ['#1e3a8a', '#2563eb'],
            iconBg: '#3b82f6',
            route: 'ReportIssues'
        },
        {
            id: 2,
            title: 'Lost Something?',
            subtitle: 'Find your missing items',
            icon: 'search',
            gradient: ['#1e40af', '#3b82f6'],
            iconBg: '#60a5fa',
            route: 'LostFound'
        },
        {
            id: 3,
            title: 'Need Help?',
            subtitle: 'Connect with support',
            icon: 'help',
            gradient: ['#2563eb', '#60a5fa'],
            iconBg: '#93c5fd',
            route: 'HelpBoard'
        },
        {
            id: 4,
            title: 'Your Voice',
            subtitle: 'Cast your vote',
            icon: 'poll',
            gradient: ['#233d84', '#3b82f6'],
            iconBg: '#60a5fa',
            route: 'Polls'
        },
        {
            id: 5,
            title: 'Improve Campus',
            subtitle: 'Share feedback',
            icon: 'rate-review',
            gradient: ['#1d4ed8', '#3b82f6'],
            iconBg: '#60a5fa',
            route: 'Feedback'
        },
        {
            id: 6,
            title: 'Andar Ki Baatein',
            subtitle: 'Report confidentially',
            icon: 'visibility-off',
            gradient: ['#1e40af', '#2563eb'],
            iconBg: '#60a5fa',
            route: 'Anonymous'
        }
    ];

    const handleMenuPress = (item) => {
        navigation.navigate(item.route);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const renderMenuItem = (item, index) => {
        const cardScale = cardAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1],
        });

        const cardOpacity = cardAnimations[index];

        return (
            <Animated.View
                key={item.id}
                style={[
                    styles.cardWrapper,
                    {
                        opacity: cardOpacity,
                        transform: [{ scale: cardScale }]
                    }
                ]}
            >
                <Pressable
                    onPress={() => handleMenuPress(item)}
                    android_ripple={{ color: 'rgba(59, 130, 246, 0.1)' }}
                    style={({ pressed }) => [
                        styles.card,
                        pressed && styles.cardPressed
                    ]}
                >
                    <LinearGradient
                        colors={['#FFFFFF', '#F8FAFC']}
                        style={styles.cardGradient}
                    >
                        <View style={styles.cardContent}>
                            <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                                <Icon name={item.icon} size={26} color="#FFFFFF" />
                            </View>

                            <View style={styles.cardText}>
                                <Text style={styles.cardTitle} numberOfLines={1}>
                                    {item.title}
                                </Text>
                                <Text style={styles.cardSubtitle} numberOfLines={1}>
                                    {item.subtitle}
                                </Text>
                            </View>

                            <View style={styles.arrowCircle}>
                                <Icon name="arrow-forward" size={20} color="#1e3a8a" />
                            </View>
                        </View>
                    </LinearGradient>
                </Pressable>
            </Animated.View>
        );
    };

    const floatingTranslate = floatAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -8],
    });

    return (
        <View style={styles.container}>
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="light-content"
            />

            <LinearGradient
                colors={['#0f172a', '#1e3a8a', '#2563eb']}
                style={styles.background}
            />

            <Animated.View
                style={[
                    styles.decorCircle1,
                    { transform: [{ translateY: floatingTranslate }] }
                ]}
            />
            <Animated.View
                style={[
                    styles.decorCircle2,
                    {
                        transform: [{
                            translateY: floatAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 10],
                            })
                        }]
                    }
                ]}
            />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Animated.View
                    style={[
                        styles.header,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.headerTop}>
                        <View style={styles.greetingSection}>
                            <Text style={styles.greeting}>{getGreeting()}</Text>
                            <Text style={styles.userName}>{shortName}</Text>
                        </View>
                        <View style={styles.logoCircle}>
                            <LinearGradient
                                colors={['#3b82f6', '#60a5fa']}
                                style={styles.logoGradient}
                            >
                                <Icon name="account-balance" size={24} color="#FFFFFF" />
                            </LinearGradient>
                        </View>
                    </View>

                    <View style={styles.roleChip}>
                        <Icon name="school" size={14} color="#3b82f6" />
                        <Text style={styles.roleText}>Student • PU Smart Tracker</Text>
                    </View>
                </Animated.View>

                <Animated.View
                    style={[
                        styles.welcomeSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.welcomeTitle}>What would you like to do?</Text>
                    <Text style={styles.welcomeSubtitle}>Choose an option below to get started</Text>
                </Animated.View>

                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => renderMenuItem(item, index))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    background: {
        position: 'absolute',
        width: width * 1.5,
        height: height * 1.2,
        top: -height * 0.1,
        left: -width * 0.25,
    },
    decorCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        top: 80,
        right: -60,
    },
    decorCircle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        bottom: 200,
        left: -40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 150,
    },
    header: {
        marginHorizontal: 24,
        marginBottom: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    greetingSection: {
        flex: 1,
    },
    greeting: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '500',
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    userName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    logoCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        overflow: 'hidden',
    },
    logoGradient: {
        width: 52,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    },
    roleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    roleText: {
        fontSize: 12,
        color: '#1e3a8a',
        fontWeight: '600',
        marginLeft: 6,
    },
    welcomeSection: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    welcomeSubtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '400',
    },
    menuContainer: {
        paddingHorizontal: 24,
    },
    cardWrapper: {
        marginBottom: 16,
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardPressed: {
        opacity: 0.9,
    },
    cardGradient: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(203, 213, 225, 0.3)',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 3,
        letterSpacing: -0.2,
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    arrowCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});

export default HomeScreen;