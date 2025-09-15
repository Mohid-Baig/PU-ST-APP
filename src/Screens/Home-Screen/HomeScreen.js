import React, { useState, useRef, useEffect, } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from "react-redux";

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {


    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-50)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const cardAnimations = useRef([...Array(6)].map(() => new Animated.Value(0))).current;
    const floatingAnim = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(-1)).current;
    const userName = useSelector((state) => state.auth.user?.name) || "John Doe";
    console.log(useSelector((state) => state.auth));
    const shortName = userName.split(" ").slice(0, 2).join(" ");
    const role = useSelector((state) => state.auth.user?.role) || 'Student';

    useEffect(() => {
        startAnimations();
        startContinuousAnimations();
    }, []);

    const startAnimations = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        cardAnimations.forEach((anim, index) => {
            Animated.spring(anim, {
                toValue: 1,
                delay: 400 + index * 150,
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
                    duration: 3000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(floatingAnim, {
                    toValue: 0,
                    duration: 3000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 2500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    };

    const menuItems = [
        {
            id: 1,
            title: 'Fix This!',
            subtitle: 'Report campus issues instantly',
            icon: 'build-circle',
            colors: ['#1e3a8a', '#3b82f6'],
            shadowColor: '#1e3a8a',
            route: 'ReportIssues'
        },
        {
            id: 2,
            title: 'Lost Something?',
            subtitle: 'Find your missing items',
            icon: 'search',
            colors: ['#1e40af', '#60a5fa'],
            shadowColor: '#1e40af',
            route: 'LostFound'
        },
        {
            id: 3,
            title: 'Need Help?',
            subtitle: 'Connect with student support',
            icon: 'help',
            colors: ['#2563eb', '#93c5fd'],
            shadowColor: '#2563eb',
            route: 'HelpBoard'
        },
        // {
        //     id: 4,
        //     title: 'Campus Events',
        //     subtitle: 'Stay updated with notifications',
        //     icon: 'event-note',
        //     colors: ['#1e3a8a', '#1e40af'],
        //     shadowColor: '#1e3a8a',
        //     route: 'Event'
        // },
        {
            id: 4,
            title: 'Improve Campus',
            subtitle: 'Share valuable feedback',
            icon: 'rate-review',
            colors: ['#1d4ed8', '#3b82f6'],
            shadowColor: '#1d4ed8',
            route: 'Feedback'
        },
        {
            id: 5,
            title: 'Andar Ki Baatein',
            subtitle: 'Report confidentially',
            icon: 'visibility-off',
            colors: ['#1e40af', '#2563eb'],
            shadowColor: '#1e40af',
            route: 'Anonymous'
        }
    ];

    const handleMenuPress = (item) => {
        console.log(`Navigating to ${item.route}`);
        navigation.navigate(item.route);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const renderMenuItem = (item, index) => {
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
                        outputRange: [0.8, 1],
                    })
                }
            ]
        };

        return (
            <Animated.View key={item.id} style={animatedStyle}>
                <Pressable
                    onPress={() => handleMenuPress(item)}
                    style={({ pressed }) => [
                        styles.menuItem,
                        {
                            transform: [{ scale: pressed ? 0.98 : 1 }],
                        }
                    ]}
                >
                    <LinearGradient
                        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.90)']}
                        style={styles.menuItemGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
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

                        <View style={styles.menuItemContent}>
                            <LinearGradient
                                colors={item.colors}
                                style={styles.iconContainer}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Icon name={item.icon} size={32} color="#ffffff" />
                            </LinearGradient>

                            <View style={styles.textContainer}>
                                <Text style={styles.menuItemTitle}>{item.title}</Text>
                                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                            </View>

                            <LinearGradient
                                colors={item.colors}
                                style={styles.arrowGradient}
                            >
                                <Icon name="arrow-forward-ios" size={18} color="#ffffff" />
                            </LinearGradient>
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
                outputRange: [0, -10],
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
                        outputRange: [0, 15],
                    })
                }]
            }
            ]} />

            <Animated.View
                style={[
                    styles.header,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim }
                        ]
                    }
                ]}
            >
                <View style={styles.headerContainer}>
                    <View style={styles.greetingContainer}>
                        <Text style={styles.greetingText}>{getGreeting()}</Text>
                        <Text style={styles.userNameText}>{shortName}</Text>
                        <View style={styles.roleContainer}>
                            <Icon name="school" size={16} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.roleText}>Student • PU Smart Tracker</Text>
                        </View>
                    </View>

                    <View style={styles.logoContainer}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                            style={styles.logoGradient}
                        >
                            <Icon name="account-balance" size={28} color="#ffffff" />
                        </LinearGradient>
                    </View>
                </View>
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                <Animated.View
                    style={[
                        styles.welcomeSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.welcomeTitle}>How can we help you today?</Text>
                    <Text style={styles.welcomeSubtitle}>Choose from the options below to get started</Text>
                </Animated.View>

                <View style={styles.menuGrid}>
                    {menuItems.map((item, index) => renderMenuItem(item, index))}
                </View>
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
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 100,
    },
    floatingElement1: {
        width: 120,
        height: 120,
        top: height * 0.15,
        right: -30,
    },
    floatingElement2: {
        width: 80,
        height: 80,
        top: height * 0.6,
        left: -20,
    },
    header: {
        marginTop: Platform.OS === 'ios' ? 50 : 40,
        marginHorizontal: 20,
        marginBottom: 10,
    },
    headerContainer: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 25,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    greetingContainer: {
        flex: 1,
    },
    greetingText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    userNameText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    roleText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginLeft: 6,
        fontWeight: '500',
    },
    logoContainer: {
        borderRadius: 18,
        overflow: 'hidden',
    },
    logoGradient: {
        width: 54,
        height: 54,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 140,
    },
    welcomeSection: {
        paddingHorizontal: 24,
        paddingVertical: 25,
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 5,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        fontWeight: '400',
        lineHeight: 22,
    },
    menuGrid: {
        paddingHorizontal: 20,
        gap: 18,
    },
    menuItem: {
        borderRadius: 22,
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
    menuItemGradient: {
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        overflow: 'hidden',
    },
    shimmerOverlay: {
        position: 'absolute',
        top: 0,
        width: 100,
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.15)',
        transform: [{ skewX: '-20deg' }],
    },
    menuItemContent: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 68,
        height: 68,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 18,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    textContainer: {
        flex: 1,
    },
    menuItemTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e3a8a', // PU blue text
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    menuItemSubtitle: {
        fontSize: 14,
        color: '#64748b', // Light gray text
        fontWeight: '500',
        lineHeight: 18,
    },
    arrowGradient: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default HomeScreen;