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
    Image,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from "react-redux";
import { useGetProfileQuery, useLogoutMutation } from '../../Redux/apiSlice';
import { useFocusEffect } from '@react-navigation/native';
const { width, height } = Dimensions.get('window');
import { logout } from '../../Redux/authslice';
import Loader from '../../Components/Customs/Loader'
import FastImage from 'react-native-fast-image';

const ProfileScreen = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-30)).current;
    const cardAnimations = useRef([...Array(4)].map(() => new Animated.Value(0))).current;
    const floatingAnim = useRef(new Animated.Value(0)).current;
    const [qrCodeUri, setQrCodeUri] = useState('');
    const dispatch = useDispatch();

    const { data: profile, error, isLoading } = useGetProfileQuery();
    console.log("profile data:", profile);
    if (error) {
        console.error("Error fetching profile:", error);
    }

    const token = useSelector((state) => state.auth.token);
    const [logoutRTKApi] = useLogoutMutation();

    const {
        fullName = "John Doe",
        uniId = "000000",
        email = "yourmail@example.com",
        profileImageUrl = null,
        uniCardImageUrl = null,
    } = profile?.user || {};

    useEffect(() => {
        startAnimations();
        generateQRCode();
        startContinuousAnimations();
    }, []);

    const startAnimations = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
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
                    useNativeDriver: true,
                }),
                Animated.timing(floatingAnim, {
                    toValue: 0,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const generateQRCode = () => {
        try {
            const currentDate = new Date();
            const formattedDate = currentDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const qrText = `STUDENT DIGITAL ID CARD\nName: ${fullName}\nStudent ID: ${uniId}\nEmail: ${email}\nUniversity: University of Punjab\nVerified: ${formattedDate}`;

            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrText)}&bgcolor=ffffff&color=1e3a8a&margin=10`;

            setQrCodeUri(qrCodeUrl);
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    };

    const handleEditProfile = () => {
        navigation.navigate('EditProfile');
    };

    const handleShowQRCode = () => {
        Alert.alert(
            "Digital Student ID",
            "This QR code contains your official student verification information. When scanned, it will display:\n\n• Your full name\n• Student ID number\n• University information\n• Verification timestamp",
            [{ text: "OK" }]
        );
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: () => logoutApi(),
                }
            ]
        );
    };

    const logoutApi = async () => {
        try {
            await logoutRTKApi().unwrap();

            dispatch(logout());
            navigation.replace("Login");

            console.log("Logout successful");
        } catch (error) {
            console.error("Error during logout:", error);
            dispatch(logout());
            navigation.replace("Login");
        }
    };

    const floatingTransform = {
        transform: [{
            translateY: floatingAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -10],
            })
        }]
    };

    const renderSection = (content, index) => {
        const animatedStyle = {
            opacity: cardAnimations[index],
            transform: [
                {
                    translateY: cardAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                    })
                }
            ]
        };

        return (
            <Animated.View style={animatedStyle}>
                {content}
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />

            {/* Background Gradient */}
            <LinearGradient
                colors={['#1e3a8a', '#1e40af', '#3b82f6']}
                style={styles.backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Floating Elements */}
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

            {/* Header */}
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

                    <Text style={styles.headerTitle}>My Profile</Text>

                    <View style={styles.headerRightButtons}>
                        <TouchableOpacity
                            onPress={handleEditProfile}
                            style={styles.editButton}
                        >
                            <Icon name="edit" size={24} color="#ffffff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleLogout}
                            style={styles.logoutButton}
                        >
                            <Icon name="logout" size={24} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                {renderSection(
                    <View style={styles.profileCard}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.90)']}
                            style={styles.profileCardGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.profileHeader}>
                                <View style={styles.profileImageContainer}>
                                    {profileImageUrl ? (
                                        <FastImage
                                            source={{ uri: profileImageUrl }}
                                            style={styles.profileImage}
                                        />
                                    ) : (
                                        <View style={styles.defaultProfileImage}>
                                            <Icon name="person" size={50} color="#64748b" />
                                        </View>
                                    )}
                                </View>

                                <View style={styles.profileInfo}>
                                    <Text style={styles.fullName}>{fullName}</Text>
                                    <Text style={styles.studentId}>{uniId}</Text>
                                    <Text style={styles.email}>{email}</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>,
                    0
                )}

                {/* University Card Section */}
                {uniCardImageUrl && renderSection(
                    <View style={styles.uniCardSection}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.90)']}
                            style={styles.sectionGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.sectionHeader}>
                                <LinearGradient
                                    colors={['#1e3a8a', '#3b82f6']}
                                    style={styles.sectionIconContainer}
                                >
                                    <Icon name="credit-card" size={20} color="#ffffff" />
                                </LinearGradient>
                                <Text style={styles.sectionTitle}>University Card</Text>
                            </View>
                            <View style={styles.cardContainer}>
                                <FastImage
                                    source={{ uri: uniCardImageUrl }}
                                    style={styles.uniCardImage}
                                    resizeMode="cover"
                                />
                            </View>
                        </LinearGradient>
                    </View>,
                    1
                )}

                {/* Digital ID Section */}
                {renderSection(
                    <View style={styles.digitalIdSection}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.90)']}
                            style={styles.sectionGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.sectionHeader}>
                                <LinearGradient
                                    colors={['#1e3a8a', '#3b82f6']}
                                    style={styles.sectionIconContainer}
                                >
                                    <Icon name="qr-code" size={20} color="#ffffff" />
                                </LinearGradient>
                                <Text style={styles.sectionTitle}>Digital Student ID</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.qrContainer}
                                onPress={handleShowQRCode}
                            >
                                <View style={styles.qrCodeBackground}>
                                    {qrCodeUri ? (
                                        <FastImage
                                            source={{ uri: qrCodeUri }}
                                            style={styles.qrCodeImage}
                                        />
                                    ) : (
                                        <View style={styles.qrCodePlaceholder}>
                                            <Icon name="qr-code" size={80} color="#64748b" />
                                            <Text style={styles.qrCodeText}>Generating QR Code...</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.qrInfo}>
                                    <Text style={styles.qrTitle}>Scan for Verification</Text>
                                    <Text style={styles.qrSubtitle}>
                                        Contains student ID, name, and email for official verification
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>,
                    2
                )}

                {/* University Section */}
                {renderSection(
                    <View style={styles.universitySection}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.90)']}
                            style={styles.sectionGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.universityInfo}>
                                <LinearGradient
                                    colors={['#1e3a8a', '#3b82f6']}
                                    style={styles.universityIconContainer}
                                >
                                    <Icon name="school" size={24} color="#ffffff" />
                                </LinearGradient>
                                <View style={styles.universityText}>
                                    <Text style={styles.universityName}>University of Punjab</Text>
                                    <Text style={styles.universityTagline}>Excellence in Education</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>,
                    3
                )}
            </ScrollView>

            <Loader visible={isLoading} />
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
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },
    headerRightButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButton: {
        padding: 8,
    },
    logoutButton: {
        padding: 8,
        marginLeft: 10,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 140,
        paddingHorizontal: 20,
    },
    profileCard: {
        borderRadius: 22,
        marginBottom: 18,
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
    profileCardGradient: {
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: 24,
    },
    profileHeader: {
        alignItems: 'center',
    },
    profileImageContainer: {
        marginBottom: 16,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#1e3a8a',
    },
    defaultProfileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f1f5f9',
        borderWidth: 3,
        borderColor: '#1e3a8a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfo: {
        alignItems: 'center',
    },
    fullName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
        textAlign: 'center',
    },
    studentId: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e3a8a',
        marginBottom: 4,
    },
    email: {
        fontSize: 15,
        color: '#64748b',
        marginBottom: 8,
    },
    uniCardSection: {
        borderRadius: 22,
        marginBottom: 18,
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
    digitalIdSection: {
        borderRadius: 22,
        marginBottom: 18,
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
    universitySection: {
        borderRadius: 22,
        marginBottom: 18,
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
    sectionGradient: {
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    cardContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    uniCardImage: {
        width: '100%',
        height: 200,
    },
    qrContainer: {
        alignItems: 'center',
    },
    qrCodeBackground: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#1e3a8a',
        backgroundColor: '#ffffff',
    },
    qrCodeImage: {
        width: 200,
        height: 200,
    },
    qrCodePlaceholder: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrCodeText: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 8,
    },
    qrInfo: {
        alignItems: 'center',
    },
    qrTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    qrSubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    universityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    universityIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    universityText: {
        flex: 1,
    },
    universityName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    universityTagline: {
        fontSize: 14,
        color: '#64748b',
    },
});

export default ProfileScreen;