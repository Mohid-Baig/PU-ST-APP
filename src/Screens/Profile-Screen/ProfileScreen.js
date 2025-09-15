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
    }, []);

    const startAnimations = () => {
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



    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#1e3a8a" barStyle="light-content" />

            <View style={styles.headerSection}>
                <LinearGradient
                    colors={['#1e3a8a', '#1e40af', '#3b82f6']}
                    style={styles.headerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />

                <Animated.View
                    style={[
                        styles.headerContent,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.headerTop}>
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
            </View>
            <View style={{ flex: 1 }}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        style={[
                            styles.profileCard,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
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
                    </Animated.View>

                    {uniCardImageUrl && (
                        <Animated.View
                            style={[
                                styles.uniCardSection,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }]
                                }
                            ]}
                        >
                            <View style={styles.sectionHeader}>
                                <Icon name="credit-card" size={24} color="#1e3a8a" />
                                <Text style={styles.sectionTitle}>University Card</Text>
                            </View>
                            <View style={styles.cardContainer}>
                                <FastImage
                                    source={{ uri: uniCardImageUrl }}
                                    style={styles.uniCardImage}
                                    resizeMode="cover"
                                />
                            </View>
                        </Animated.View>
                    )}

                    <Animated.View
                        style={[
                            styles.digitalIdSection,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
                    >
                        <View style={styles.sectionHeader}>
                            <Icon name="qr-code" size={24} color="#1e3a8a" />
                            <Text style={styles.sectionTitle}>Digital Student ID</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.qrContainer}
                            onPress={handleShowQRCode}
                        >
                            <LinearGradient
                                colors={['#ffffff', '#f8fafc']}
                                style={styles.qrCodeBackground}
                            >
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
                            </LinearGradient>

                            <View style={styles.qrInfo}>
                                <Text style={styles.qrTitle}>Scan for Verification</Text>
                                <Text style={styles.qrSubtitle}>
                                    Contains student ID, name, and email for official verification
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.universitySection,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
                    >
                        <View style={styles.universityInfo}>
                            <Icon name="school" size={32} color="#1e3a8a" />
                            <View style={styles.universityText}>
                                <Text style={styles.universityName}>University of Punjab</Text>
                                <Text style={styles.universityTagline}>Excellence in Education</Text>
                            </View>
                        </View>
                    </Animated.View>
                </ScrollView>
            </View>
            <Loader visible={isLoading} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    headerSection: {
        height: 120,
        position: 'relative',
    },
    headerGradient: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    headerContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        justifyContent: 'center',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
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
        paddingBottom: 120,
    },
    profileCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginTop: -20,
        borderRadius: 16,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
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
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginLeft: 12,
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
    digitalIdSection: {
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
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
    universitySection: {
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    universityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    universityText: {
        marginLeft: 16,
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