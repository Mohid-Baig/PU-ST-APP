import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Animated,
    StatusBar,
    Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector, useDispatch } from "react-redux";
import jwtDecode from "jwt-decode";
import { useLazyGetProfileQuery } from "../../Redux/apiSlice";
import { logout } from '../../Redux/authslice';


const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
    const logoScale = useRef(new Animated.Value(0.3)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleTranslateY = useRef(new Animated.Value(50)).current;
    const subtitleOpacity = useRef(new Animated.Value(0)).current;
    const subtitleTranslateY = useRef(new Animated.Value(30)).current;
    const backgroundOpacity = useRef(new Animated.Value(0)).current;
    const logoGlow = useRef(new Animated.Value(0)).current;
    const progressWidth = useRef(new Animated.Value(0)).current;

    const bookFloat = useRef(new Animated.Value(0)).current;
    const gearRotate = useRef(new Animated.Value(0)).current;
    const { token, refreshToken } = useSelector((state) => state.auth);
    const [checkProfile] = useLazyGetProfileQuery();
    const dispatch = useDispatch();
    // console.log(token, "tokennnnn");

    const authState = useSelector((state) => state.auth);
    // console.log("Auth State:", authState);


    const isTokenValid = (token) => {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp > currentTime;
        } catch (err) {
            return false;
        }
    };

    useEffect(() => {
        startAnimations();

        const checkAuth = async () => {
            if (token && isTokenValid(token)) {
                navigation.replace("MainTabs");
            } else if (refreshToken) {
                try {
                    await checkProfile().unwrap();
                    navigation.replace("MainTabs");
                } catch (err) {
                    dispatch(logout());
                    navigation.replace("Login");
                }
            } else {
                navigation.replace("Login");
            }
        };

        const timer = setTimeout(checkAuth, 4000);
        return () => clearTimeout(timer);
    }, [token, refreshToken]);


    // useEffect(() => {
    //     startAnimations();

    //     const timer = setTimeout(() => {
    //         navigation.replace('Login');
    //     }, 4000);

    //     return () => clearTimeout(timer);
    // }, []);

    const startAnimations = () => {
        Animated.timing(backgroundOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();

        Animated.sequence([
            Animated.delay(300),
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    tension: 40,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        Animated.sequence([
            Animated.delay(800),
            Animated.timing(logoGlow, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.sequence([
            Animated.delay(1000),
            Animated.parallel([
                Animated.timing(titleOpacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(titleTranslateY, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        Animated.sequence([
            Animated.delay(1400),
            Animated.parallel([
                Animated.timing(subtitleOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.spring(subtitleTranslateY, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        Animated.sequence([
            Animated.delay(2000),
            Animated.timing(progressWidth, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            }),
        ]).start();

        startAcademicAnimations();
    };

    const startAcademicAnimations = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(bookFloat, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(bookFloat, {
                    toValue: 0,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.timing(gearRotate, {
                toValue: 1,
                duration: 8000,
                useNativeDriver: true,
            })
        ).start();
    };

    const bookTranslateY = bookFloat.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -15],
    });

    const gearRotation = gearRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const progressTranslateX = progressWidth.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 0],
    });

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#1e3a8a" barStyle="light-content" />

            <Animated.View style={[styles.backgroundContainer, { opacity: backgroundOpacity }]}>
                <LinearGradient
                    colors={['#1e3a8a', '#1e40af', '#3b82f6']}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                />
            </Animated.View>

            <Animated.View
                style={[
                    styles.decorativeBook,
                    { transform: [{ translateY: bookTranslateY }] }
                ]}
            >
                <View style={styles.bookIcon}>
                    <Text style={styles.bookText}>📚</Text>
                </View>
            </Animated.View>

            <Animated.View
                style={[
                    styles.decorativeGear,
                    { transform: [{ rotate: gearRotation }] }
                ]}
            >
                <View style={styles.gearIcon}>
                    <Text style={styles.gearText}>⚙️</Text>
                </View>
            </Animated.View>

            <View style={styles.buildingSilhouette}>
                <View style={styles.building1} />
                <View style={styles.building2} />
                <View style={styles.building3} />
            </View>

            <View style={styles.contentContainer}>
                <Animated.View
                    style={[
                        styles.logoContainer,
                        {
                            opacity: logoOpacity,
                            transform: [{ scale: logoScale }],
                        },
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.logoGlow,
                            {
                                opacity: logoGlow.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 0.3],
                                }),
                            },
                        ]}
                    />
                    <View style={styles.logoWrapper}>
                        <Image
                            source={require('../../Assets/images/puLogo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                </Animated.View>

                <Animated.View
                    style={[
                        styles.titleContainer,
                        {
                            opacity: titleOpacity,
                            transform: [{ translateY: titleTranslateY }],
                        },
                    ]}
                >
                    <Text style={styles.title}>PU Smart Tracker</Text>
                    <View style={styles.titleUnderline} />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.subtitleContainer,
                        {
                            opacity: subtitleOpacity,
                            transform: [{ translateY: subtitleTranslateY }],
                        },
                    ]}
                >
                    <Text style={styles.subtitle}>University of Punjab</Text>
                    <Text style={styles.tagline}>Your Smart Campus Companion</Text>
                    <View style={styles.featuresList}>
                        <Text style={styles.feature}>🔧 Report Campus Issues</Text>
                        <Text style={styles.feature}>🔍 Find Your Lost Items</Text>
                        <Text style={styles.feature}>💬 Get Help from Peers</Text>
                    </View>
                </Animated.View>
            </View>

            <Animated.View style={[styles.loadingContainer, { opacity: subtitleOpacity }]}>
                <Text style={styles.loadingText}>Initializing Campus Services...</Text>
                <View style={styles.progressBarContainer}>
                    <Animated.View
                        style={[
                            styles.progressBar,
                            {
                                transform: [{ translateX: progressTranslateX }],
                            },
                        ]}
                    />
                </View>
                <Text style={styles.versionText}>v1.0.0</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e3a8a',
    },
    backgroundContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    gradient: {
        flex: 1,
    },
    buildingSilhouette: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
        flexDirection: 'row',
        alignItems: 'flex-end',
        opacity: 0.1,
    },
    building1: {
        width: 80,
        height: 60,
        backgroundColor: '#ffffff',
        marginRight: 10,
    },
    building2: {
        width: 60,
        height: 80,
        backgroundColor: '#ffffff',
        marginRight: 10,
    },
    building3: {
        width: 70,
        height: 45,
        backgroundColor: '#ffffff',
    },
    decorativeBook: {
        position: 'absolute',
        top: height * 0.15,
        left: 30,
    },
    bookIcon: {
        opacity: 0.3,
    },
    bookText: {
        fontSize: 24,
    },
    decorativeGear: {
        position: 'absolute',
        top: height * 0.2,
        right: 40,
    },
    gearIcon: {
        opacity: 0.3,
    },
    gearText: {
        fontSize: 20,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
        position: 'relative',
    },
    logoGlow: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#ffffff',
        top: -20,
        left: -20,
    },
    logoWrapper: {
        width: 120,
        height: 120,
        backgroundColor: '#ffffff',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    logo: {
        width: 100,
        height: 100,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#ffffff',
        textAlign: 'center',
        letterSpacing: 0.5,
        fontFamily: 'System',
    },
    titleUnderline: {
        width: 60,
        height: 3,
        backgroundColor: '#fbbf24',
        marginTop: 8,
        borderRadius: 2,
    },
    subtitleContainer: {
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 20,
        color: '#e2e8f0',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '600',
    },
    tagline: {
        fontSize: 16,
        color: '#cbd5e1',
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '400',
    },
    featuresList: {
        alignItems: 'center',
    },
    feature: {
        fontSize: 14,
        color: '#f1f5f9',
        textAlign: 'center',
        marginBottom: 4,
        opacity: 0.9,
    },
    loadingContainer: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: '#e2e8f0',
        marginBottom: 15,
        fontWeight: '500',
    },
    progressBarContainer: {
        width: 200,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 10,
    },
    progressBar: {
        width: 200,
        height: 4,
        backgroundColor: '#fbbf24',
        borderRadius: 2,
    },
    versionText: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '400',
    },
});

export default SplashScreen;