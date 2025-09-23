import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TextInput,
    TouchableOpacity,
    Image,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
    Linking,
    Alert,
    Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomModal from '../../Components/Customs/CustomModal'
import useModal from '../../Components/Customs/UseModalHook'
import instance from "../../Components/baseURL/baseURL"
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from "react-redux";
import { loginSuccess } from '../../Redux/authslice';
import { useLazyGetProfileQuery, useLoginMutation } from '../../Redux/apiSlice';
const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [login] = useLoginMutation();
    const [triggerProfile] = useLazyGetProfileQuery();

    const dispatch = useDispatch();


    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;

    const {
        modalConfig,
        showModal,
        hideModal,
        showError,
        showSuccess,
        showConfirm,
    } = useModal();

    useEffect(() => {
        startAnimations();

        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setKeyboardVisible(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardVisible(false)
        );

        return () => {
            keyboardDidHideListener?.remove();
            keyboardDidShowListener?.remove();
        };
    }, []);

    const startAnimations = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    };
    useFocusEffect(
        React.useCallback(() => {
            setEmail('');
            setPassword('');
            setShowPassword(false);
            hideModal()
        }, [])
    );

    const handleLogin = async () => {
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }

        setIsLoading(true);

        try {
            const response = await login({ email, password }).unwrap();
            console.log("Login response:", response);
            dispatch(loginSuccess({
                token: response.accessToken,
                refreshToken: response.refreshToken,
                user: response.user,
            }));

            showSuccess('Login successful!');

            const profile = await triggerProfile().unwrap();
            console.log("Fetched profile:", profile);

            navigation.replace('MainTabs');
        } catch (error) {
            console.log("Login error:", error);
            showError(error?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };



    const openPortfolio = () => {
        Linking.openURL('https://mohidbaig.vercel.app/').catch(err => {
            showError('Could not open link. Please try again later.');
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#1e3a8a" barStyle="light-content" />

            <LinearGradient
                colors={['#1e3a8a', '#1e40af', '#3b82f6']}
                style={styles.background}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />

            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContainer,
                        isKeyboardVisible && styles.scrollContainerKeyboard
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                >
                    <Animated.View
                        style={[
                            styles.headerContainer,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    { translateY: slideAnim },
                                    { scale: logoScale }
                                ]
                            }
                        ]}
                    >
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../Assets/images/puLogo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.welcomeText}>Welcome Back</Text>
                        <Text style={styles.subWelcomeText}>Sign in to your PU Smart Tracker account</Text>
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.formContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
                    >
                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <Icon name="email" size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Email"
                                    placeholderTextColor="#94a3b8"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <Icon name="lock" size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Password"
                                    placeholderTextColor="#94a3b8"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Icon
                                        name={showPassword ? "visibility" : "visibility-off"}
                                        size={20}
                                        color="#64748b"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.forgotPasswordContainer}
                            onPress={() => showConfirm(
                                'Do you want to reset your password? We will send a reset link to your email.',
                                () => showSuccess('Password reset link sent to your email!'),
                                'Reset Password'
                            )}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={isLoading ? ['#94a3b8', '#64748b'] : ['#1e40af', '#3b82f6']}
                                style={styles.loginButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {isLoading ? (
                                    <View style={styles.loadingContainer}>
                                        <Text style={styles.loginButtonText}>Signing In...</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.loginButtonText}>Sign In</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <Text style={styles.registerLink}>Register Here</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {!isKeyboardVisible && (
                        <Animated.View
                            style={[
                                styles.universityInfoContainer,
                                { opacity: fadeAnim }
                            ]}
                        >
                            <View style={styles.infoCard}>
                                <Text style={styles.infoTitle}>Punjab University</Text>
                                <Text style={styles.infoSubtitle}>Smart Campus Management</Text>
                                <View style={styles.featuresContainer}>
                                    <View style={styles.featureItem}>
                                        <Icon name="report-problem" size={16} color="#fbbf24" />
                                        <Text style={styles.featureText}>Report Issues</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Icon name="search" size={16} color="#fbbf24" />
                                        <Text style={styles.featureText}>Lost & Found</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Icon name="help" size={16} color="#fbbf24" />
                                        <Text style={styles.featureText}>Get Help</Text>
                                    </View>
                                </View>
                            </View>
                        </Animated.View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
            {!isKeyboardVisible && (
                <View style={styles.footerContainer}>
                    <View style={styles.developerCredit}>
                        <Text style={styles.creditText}>Designed by </Text>
                        <Text style={styles.creditName}>Tanzeeha Baig</Text>
                        <Text style={styles.creditText}> & </Text>
                        <TouchableOpacity
                            onPress={openPortfolio}
                            style={styles.nameLink}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.creditNameLink}>Mohid Baig</Text>
                        </TouchableOpacity>
                        <Icon name="open-in-new" size={14} color="#94a3b8" style={styles.linkIcon} />
                    </View>
                </View>
            )}

            <CustomModal
                {...modalConfig}
                onClose={hideModal}
                navigation={navigation}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 80,
    },
    scrollContainerKeyboard: {
        paddingBottom: 20,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#ffffff',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    logo: {
        width: 80,
        height: 80,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 8,
    },
    subWelcomeText: {
        fontSize: 16,
        color: '#e2e8f0',
        textAlign: 'center',
        opacity: 0.9,
    },
    formContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 30,
        marginBottom: 30,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 16,
        height: 55,
    },
    inputIcon: {
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '500',
    },
    eyeIcon: {
        padding: 4,
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 30,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#1e40af',
        fontWeight: '600',
    },
    loginButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
        elevation: 5,
        shadowColor: '#1e40af',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    loginButtonDisabled: {
        elevation: 0,
        shadowOpacity: 0,
    },
    loginButtonGradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 55,
    },
    loginButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        fontSize: 14,
        color: '#64748b',
    },
    registerLink: {
        fontSize: 14,
        color: '#1e40af',
        fontWeight: '600',
    },
    universityInfoContainer: {
        alignItems: 'center',
    },
    infoCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        width: '100%',
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    infoSubtitle: {
        fontSize: 14,
        color: '#e2e8f0',
        marginBottom: 15,
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    featureItem: {
        alignItems: 'center',
        flex: 1,
    },
    featureText: {
        fontSize: 12,
        color: '#f1f5f9',
        marginTop: 4,
        textAlign: 'center',
    },
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 20,
        backgroundColor: 'rgba(30, 58, 138, 0.9)',
        alignItems: 'center',
        marginBottom: 10,
    },
    developerCredit: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    creditText: {
        fontSize: 12,
        color: '#94a3b8',
    },
    creditName: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: '600',
    },
    linkIcon: {
        marginLeft: 4,
    },
    nameLink: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    creditNameLink: {
        fontSize: 12,
        color: '#ffffff',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;